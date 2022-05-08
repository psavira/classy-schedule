async function ready() {
    
}

function formatDataToBody(professors, classes, rooms, times) {
    /* DEBUG */
    let section_map = {}
    // For each teacher
    for(let teacher of professors) {
        // Set teach load to 99
        teacher.teach_load = 99
        for(let can_teach of teacher.classes) {
            if(!section_map[can_teach]) {
                section_map[can_teach] = 1
            } else {
                section_map[can_teach] += 1
            }
        }
    }

    for(let course of classes) {
        if(section_map[course.id]) {
            course.sections = section_map[course.id]
        }
    }

    /* END DEBUG */
    return {
        // Get an array of ints from 0-13
        "times": [...Array(14).keys()],
        "rooms": rooms,
        "teachers": professors,
        "classes": classes
    }
}


function generateSchedule() {
    const elemScheduleGenerated = document.getElementById("scheduleGenerated")
    const elemScheduleGenerating = document.getElementById("scheduleGenerating")
    const elemScheduleNotGenerating = document.getElementById("scheduleNotGenerating")

    elemScheduleGenerated.classList.add("no-display");
    elemScheduleNotGenerating.classList.remove("no-display")
    elemScheduleGenerating.classList.add("no-display")

    Promise.all([fetchProfessorsData(),
        fetchClassesData(),
        fetchRoomsData(),
        fetchTimesData()])
    .then((values) => {
        let professors, classes, rooms, times
        [professors, classes, rooms, times] = values

        // Format data
        const body = formatDataToBody(professors, classes, rooms, times)
        console.log("Body", body)

        return fetch('/api/generateSchedule',
        {
            headers: {
                user_id: window.localStorage.getItem("user_id"),
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(body)
        })
    })
    .then(async (res) => {
        const restext = await res.text()
        if(!res.ok) {
            showAlert(restext);
        } else {
            console.log("Creating schedule")
            elemScheduleNotGenerating.classList.add("no-display")
            elemScheduleGenerating.classList.remove("no-display")
            statusChecker()
        }
    })
}

const ATStatusCode = {
    STARTING: 0,
    RUNNING: 1,
    FINISHED: 2,
    ERROR: 3,
}
let solutions = undefined;

/**
 * Repeat status checking until end state reached.
 */
function statusChecker() {
    console.log("Checking status")

    // Get element references
    const elemScheduleGenerated = document.getElementById("scheduleGenerated")
    const elemScheduleGenerating = document.getElementById("scheduleGenerating")
    const elemScheduleNotGenerating = document.getElementById("scheduleNotGenerating")

    // Send the request to the status check endpoint
    fetch('/api/getAlgoStatus',
    {
        headers: {
            user_id: window.localStorage.getItem("user_id")
        }
    }).then(async (res) => {
        const restext = await res.text()

        // Check to see if a schedule has been made
        if(res.status == 403) {
            // If not, show the generate schedule view
            elemScheduleNotGenerating.classList.remove("no-display")
            elemScheduleGenerating.classList.add("no-display")
            elemScheduleGenerated.classList.add("no-display")
            return
        }
        
        // If something unexpected happened, throw an error
        if(!res.ok) {
            throw new Error("Something went wrong, refresh the page.")
        }

        if(parseInt(restext) == ATStatusCode.FINISHED) {
            console.log("Finished")
            elemScheduleNotGenerating.classList.add("no-display")
            elemScheduleGenerating.classList.add("no-display")
            elemScheduleGenerated.classList.remove("no-display")
            fetch('/api/getAlgoSchedule', {
                headers: {
                    user_id: window.localStorage.getItem("user_id")
                }
            }).then(res => {
                return res.json()
            }).then(json => {
                solutions = json
                previewSolutions()
            })

        } else {
            // Recheck status in 5 seconds.
            setTimeout(() => {statusChecker()}, 5000)
        }
    })
    .catch(err => {
        showAlert(err.message)
    })
}

function previewSolutions() {
    if(!solutions) {
        showAlert("No solutions to show")
        return
    }

    const elemPreviewSolutionSelect = document.getElementById("previewSolutionSelect")
    elemPreviewSolutionSelect.innerHTML = ""
    
    for(let solution_id in solutions) {
        const selectOption = document.createElement("option");
        selectOption.value = solution_id
        selectOption.textContent = `Solution ${parseInt(solution_id) + 1}`
        elemPreviewSolutionSelect.appendChild(selectOption)
    }

    elemPreviewSolutionSelect.onchange = function() {
        let solution_id = elemPreviewSolutionSelect.value
        solutionToTable(solution_id);
    }
    solutionToTable(elemPreviewSolutionSelect.value)
}

function solutionToTable(solution_id) {
    const table = document.getElementById("previewSolutionTable")
    table.innerHTML = ""
    const solution = solutions[solution_id]

    // Add a header for room titles
    let row = document.createElement('tr')
    // add a blank tile first
    let td = document.createElement('td')
    td.innerHTML = "Room<br>Time"
    row.appendChild(td)
    for(let room in solution) {
        td = document.createElement('td')
        td.textContent = room
        row.appendChild(td);
    }
    table.appendChild(row)
    
    // for each time block, get 
    for(let time of Array(14).keys()) {
        row = document.createElement('tr');
        td = document.createElement('td');
        td.textContent = time
        row.appendChild(td)
        for(let room in solution) {
            td = document.createElement('td')
            if(solution[room][time]) {
                td.innerHTML = `${solution[room][time].course}<br/><i><b>${solution[room][time].teacher}</b></i>`
            }
            row.appendChild(td)
        }
        table.appendChild(row)
    }

}