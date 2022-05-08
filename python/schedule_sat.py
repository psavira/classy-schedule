import json
import sys
from ortools.sat.python import cp_model

from prettytable import PrettyTable

USER_ID = sys.argv[1]

data = None

with open(f"./scheduler-data/algo_data_user_{USER_ID}.json", "r") as f:
    data = json.loads(f.read())

print(data)

classes = data['classes']
teachers = data['teachers']
times = data['times']
rooms = data['rooms']

model = cp_model.CpModel()

instances = {}
for te in teachers:
    for cl in classes:
        for ro in rooms:
            for ti in times:
                if cl['id'] in te['classes']:
                    instances[(te['id'], cl['id'], ro, ti)] = model.NewBoolVar(f'te{te["id"]}cl{cl["id"]}ro{ro}ti{ti}')

teacher_classes = []
for cl in classes:
    for te in teachers:
        if cl['id'] in te['classes']:
            teacher_classes.append((te['id'],cl['id']))

for ro in rooms:
    for ti in times:
        model.AddAtMostOne(instances[(te,cl,ro,ti)] for (te,cl) in teacher_classes)
        

# Enforce that at least 2 sections of intro are taught
for cl in classes:
    section_count = cl["sections"]
    sections = []
    for ro in rooms:
        for ti in times:
            for te in teachers:
                if (te['id'], cl['id']) in teacher_classes:
                    sections.append(instances[(te['id'],cl['id'],ro,ti)])
    model.Add(section_count == sum(sections))

# Enforce that a teacher can't teach in the same room at the same time
for ti in times:
    for te in teachers:
        current_classes = []
        for cl in classes:
            for ro in rooms:
                if (te['id'], cl['id']) in teacher_classes:
                    current_classes.append(instances[(te['id'],cl['id'],ro,ti)])
        model.Add(sum(current_classes) <= 1)

# Enforce that a teacher cannot exceed teach load
for te in teachers:
    teach_classes = []
    teach_load = te["teach_load"]
    for ti in times:
        for cl in classes:
            for ro in rooms:
                if (te['id'], cl['id']) in teacher_classes:
                    teach_classes.append(instances[(te['id'], cl['id'], ro, ti)])
    model.Add(sum(teach_classes) <= teach_load)
    

solver = cp_model.CpSolver()
solver.parameters.linearization_level = 0
solver.parameters.enumerate_all_solutions = True

class SchedulePartialSolutionPrinter(cp_model.CpSolverSolutionCallback):
    """Print intermediate solutions."""

    def __init__(self, limit):
        cp_model.CpSolverSolutionCallback.__init__(self)

        self._solution_count = 0
        self._solution_limit = limit
        self.solutions = []

    def on_solution_callback(self):
        self._solution_count += 1
        print('Solution %i' % self._solution_count)
        s_rooms = {}
        for room in rooms:
            # print(f"Room {room}")
            s_times = {}
            for time in times:
                for course in classes:
                    for teacher in teachers:
                        if (teacher['id'], course['id']) in teacher_classes:
                            if self.Value(instances[(teacher["id"],course["id"],room,time)]):
                                # print(f"   Class: {course['name']} Teacher: {teacher['name']}")
                                s_times[time] = {
                                    "teacher": teacher['name'],
                                    "course": course['name']
                                }
            s_rooms[room] = s_times.copy()
                                
        self.solutions.append(s_rooms)

        if self._solution_count >= self._solution_limit:
            print('Stop search after %i solutions' % self._solution_limit)
            self.StopSearch()

    def solution_count(self):
        return self._solution_count

solution_limit = 30
solution_printer = SchedulePartialSolutionPrinter(solution_limit)

solver.Solve(model, solution_printer)

if(solution_printer.solution_count() == 0):
    print("Couldn't find a solution")
    exit(-1)
else:
    # try to write
    try:
        with open(f"./scheduler-data/algo_data_user_{USER_ID}_out.json", "w") as outfile:
            outfile.write(json.dumps(solution_printer.solutions))
        exit(1)
    except IOError:
        print(f"Failed to write user {USER_ID} outfile")
        exit(-2)
    