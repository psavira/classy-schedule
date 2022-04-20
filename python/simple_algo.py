import json
from ortools.sat.python import cp_model

from prettytable import PrettyTable

data = None

with open("./python/simple_algo_data.json", "r") as f:
    data = json.loads(f.read())

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

print(teacher_classes)

for ro in rooms:
    for ti in times:
        model.AddAtMostOne(instances[(te,cl,ro,ti)] for (te,cl) in teacher_classes)
        

# Enforce that at least 2 sections of intro are taught
min_sections = 2
max_sections = 4
for cl in classes:
    sections = []
    for ro in rooms:
        for ti in times:
            for te in teachers:
                if (te['id'], cl['id']) in teacher_classes:
                    sections.append(instances[(te['id'],cl['id'],ro,ti)])
    model.Add(min_sections <= sum(sections))
    model.Add(max_sections >= sum(sections))

# Enforce that a teacher can't teach in the same room at the same time
for ti in times:
    for te in teachers:
        current_classes = []
        for cl in classes:
            for ro in rooms:
                if (te['id'], cl['id']) in teacher_classes:
                    current_classes.append(instances[(te['id'],cl['id'],ro,ti)])
        model.Add(sum(current_classes) <= 1)
                

solver = cp_model.CpSolver()
solver.parameters.linearization_level = 0
solver.parameters.enumerate_all_solutions = True

class SchedulePartialSolutionPrinter(cp_model.CpSolverSolutionCallback):
    """Print intermediate solutions."""

    def __init__(self, limit):
        cp_model.CpSolverSolutionCallback.__init__(self)

        self._solution_count = 0
        self._solution_limit = limit

    def on_solution_callback(self):
        self._solution_count += 1
        print('Solution %i' % self._solution_count)
        headers = [""] + rooms
        table = PrettyTable(headers)
        for time in times:
            row = []
            row.append(f"{time}")
            for room in rooms:
                # print("  Room: ", room)
                room_occupied = False
                for course in classes:
                    for teacher in teachers:
                        if (teacher['id'], course['id']) in teacher_classes:
                            if self.Value(instances[(teacher["id"],course["id"],room,time)]):
                                # print(f"   Class: {course['name']} Teacher: {teacher['name']}")
                                row.append(f"{teacher['name']} - {course['name']}")
                                room_occupied = True
                if not room_occupied:
                    row.append('')
                
            # print(row)
            table.add_row(row)
        print(table)
        

        if self._solution_count >= self._solution_limit:
            print('Stop search after %i solutions' % self._solution_limit)
            self.StopSearch()

    def solution_count(self):
        return self._solution_count

solution_limit = 5
solution_printer = SchedulePartialSolutionPrinter(solution_limit)

solver.Solve(model, solution_printer)