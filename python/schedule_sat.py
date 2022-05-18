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

# Generate some reference dicts for faster access
teacher_dict = {}
for te in teachers:
    teacher_dict[te['id']] = te

model = cp_model.CpModel()

instances = {}
for te in teachers:
    for cl in classes:
        for ro in rooms:
            for ti in times:
                if cl['id'] in te['classes']:
                    instances[(te['id'], cl['id'], ro['id'], ti)] = model.NewBoolVar(f'te{te["id"]}cl{cl["id"]}ro{ro["id"]}ti{ti}')

teacher_classes = []
for cl in classes:
    for te in teachers:
        if cl['id'] in te['classes']:
            teacher_classes.append((te['id'],cl['id']))

for ro in rooms:
    for ti in times:
        model.AddAtMostOne(instances[(te,cl,ro['id'],ti)] for (te,cl) in teacher_classes)
        

# First, enforce that section count inputs don't exceed  the following
# (can_teach teachers * time) or (available rooms * time)
# Additionally, ignore classes that have a higher capacity than any available
# rooms are disabled
num_times = len(times)
num_rooms = len(rooms)
for cl in classes:
    # Count all teaching teachers
    num_teachers = 0
    max_teach_load = 0

    for tup in teacher_classes:
        if (tup[1] == cl['id']):
            num_teachers += 1
            max_teach_load += teacher_dict[tup[0]]['teach_load']

    
    # Check that sections don't exceed all possible teaching times
    print(num_teachers, cl["sections"])
    if cl["sections"] > (num_times * num_teachers):
        print("Limited teacher count")
        cl["sections"] = (num_times * num_teachers)

    # Reduce the section count to the maximum possible teach load
    if cl["sections"] > max_teach_load:
        print("Section count would dominate teach load")
        cl["sections"] = max_teach_load
    

    fitting_rooms_count = 0
    # Check that the class capacity doesn't exceed maximum available capacity
    for ro in rooms:
        if(ro['capacity'] >= cl['capacity']):
            fitting_rooms_count += 1
    
    if cl["sections"] > (fitting_rooms_count * times):
        cl["sections"] = (fitting_rooms_count * times)

    # This section count would consume all possible times.
    # Don't allow this
    if cl["sections"] > (num_times * num_rooms):
        cl["sections"] = 0

# Enforce that sections are at or below section count
for cl in classes:
    section_count = cl["sections"]
    sections = []
    for ro in rooms:
        for ti in times:
            for te in teachers:
                if (te['id'], cl['id']) in teacher_classes:
                    sections.append(instances[(te['id'],cl['id'],ro['id'],ti)])
    # The assigned sections of a class must equal the number of desired sections
    model.Add(section_count == sum(sections))

# Enforce that a teacher can't teach in the same room at the same time
for ti in times:
    for te in teachers:
        current_classes = []
        for cl in classes:
            for ro in rooms:
                if (te['id'], cl['id']) in teacher_classes:
                    current_classes.append(instances[(te['id'],cl['id'],ro['id'],ti)])
        # The sum of all classes at a particular time for a teacher must be
        # Less than or equal to 1
        model.Add(sum(current_classes) <= 1)

# Enforce that a teacher cannot exceed teach load
for te in teachers:
    teach_classes = []
    teach_load = te["teach_load"]
    for ti in times:
        for cl in classes:
            for ro in rooms:
                if (te['id'], cl['id']) in teacher_classes:
                    teach_classes.append(instances[(te['id'], cl['id'], ro['id'], ti)])
    # The sum of the classes teachers can teach must not exceed teach laod
    model.Add(sum(teach_classes) <= teach_load)
    
print(teacher_classes)

# Ignore ony classes where no proper room size exists
for cl in classes:
        

# Enforce that a class for a room cannot exceed capacity
for ro in rooms:
    for cl in classes:
        possible_assignments = []
        for ti in times:
            for te in teachers:
                if (te['id'], cl['id']) in teacher_classes:
                    possible_assignments.append(instances[(te['id'], cl['id'], ro['id'], ti)])
        # If class capacity is greater than room capacity, the sum of all
        # assignment of that class to that room must be 0
        if(cl['capacity'] > ro['capacity']):
            model.Add(sum(possible_assignments) == 0)


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
                            if self.Value(instances[(teacher["id"],course["id"],room['id'],time)]):
                                # print(f"   Class: {course['name']} Teacher: {teacher['name']}")
                                s_times[time] = {
                                    "teacher": teacher['name'],
                                    "teacher_id": teacher['id'],
                                    "course": course['name'],
                                    "course_id": course['id']
                                }
            s_rooms[room['id']] = s_times.copy()
                                
        self.solutions.append(s_rooms)

        if self._solution_count >= self._solution_limit:
            print('Stop search after %i solutions' % self._solution_limit)
            self.StopSearch()

    def solution_count(self):
        return self._solution_count

solution_limit = 2
solution_printer = SchedulePartialSolutionPrinter(solution_limit)

print("Looking for solutions")
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
    