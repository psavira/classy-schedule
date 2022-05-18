/**
 * Format input data into request body
 * @param {*} professors Professor list
 * @param {*} classes Class list
 * @param {*} rooms Room list
 * @param {*} times Time list
 * @returns Input parameters formatted into request body
 */
function formatDataToBody(professors, classes, rooms, times) {
    return {
        // Get an array of ints from 0-13
        "times": [...Array(14).keys()],
        "rooms": rooms,
        "teachers": professors,
        "classes": classes
    }
}

/**
 * Send a request to generate the schedule
 */
function generateSchedule() {
    const elemSchedGened = document.getElementById("scheduleGenerated")
    const elemSchedGening = document.getElementById("scheduleGenerating")
    const elemSchedNotGen = document.getElementById("scheduleNotGenerating")

    elemSchedGened.classList.add("no-display");
    elemSchedNotGen.classList.remove("no-display")
    elemSchedGening.classList.add("no-display")

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
            elemSchedNotGen.classList.add("no-display")
            elemSchedGening.classList.remove("no-display")
            statusChecker()
        }
    })
}

/** Status codes for the algorithm tracker */
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
    const elemSchedGened = document.getElementById("scheduleGenerated")
    const elemSchedGening = document.getElementById("scheduleGenerating")
    const elemSchedNotGen = document.getElementById("scheduleNotGenerating")

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
            elemSchedNotGen.classList.remove("no-display")
            elemSchedGening.classList.add("no-display")
            elemSchedGened.classList.add("no-display")
            return
        }
        
        // If something unexpected happened, throw an error
        if(!res.ok) {
            throw new Error("Something went wrong, refresh the page.")
        }

        if(parseInt(restext) == ATStatusCode.FINISHED) {
            console.log("Finished")
            elemSchedNotGen.classList.add("no-display")
            elemSchedGening.classList.add("no-display")
            elemSchedGened.classList.remove("no-display")
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

/**
 * Generates the preview system. Sets up solution input and events.
 */
function previewSolutions() {
    if(!solutions) {
        showAlert("No solutions to show")
        return
    }

    const elemPrevSolnSelect = document.getElementById("previewSolutionSelect")
    elemPrevSolnSelect.innerHTML = ""
    
    for(let solution_id in solutions) {
        const selectOption = document.createElement("option");
        selectOption.value = solution_id
        selectOption.textContent = `Solution ${parseInt(solution_id) + 1}`
        elemPrevSolnSelect.appendChild(selectOption)
    }

    elemPrevSolnSelect.onchange = function() {
        let solution_id = elemPrevSolnSelect.value
        solutionToTable(solution_id);
    }
    solutionToTable(elemPrevSolnSelect.value)
}

/** Maps time codes to formatted text */
const TIME_CODE_LEGENDS = {
    0: "MWF 08:15-09:20",
    1: "MWF 09:35-10:40",
    2: "MWF 10:55-12:00",
    3: "MWF 12:15-13:20",
    4: "MWF 13:35-14:40",
    5: "MWF 15:25-17:00",
    6: "MWF 17:30-19:15",
    7: "MWF 19:30-21:15",
    8: "TR 08:00-09:40",
    9: "TR 09:55-11:35",
    10: "TR 13:30-15:10",
    11: "TR 15:25-17:00",
    12: "TR 17:30-19:15",
    13: "TR 19:30-21:15",
}

/**
 * Generates the solution table from a given solution id
 * @param {*} solution_id Solution to generate table for
 */
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
        td.id = room;
        getRoomNum(room).then(roomNum => {
            document.getElementById(room).innerHTML = ""+roomNum;
        });
        row.appendChild(td);
    }
    table.appendChild(row)
    
    // for each time block, get 
    for(let time of Array(14).keys()) {
        row = document.createElement('tr');
        td = document.createElement('td');
        td.id = time;
        td.textContent = TIME_CODE_LEGENDS[time]
        row.appendChild(td)
        for(let room in solution) {
            td = document.createElement('td')
            if(solution[room][time]) {
                td.innerHTML = `${solution[room][time].course}
                    <br/>
                    <i><b>${solution[room][time].teacher}</b></i>`
            }
            row.appendChild(td)
        }
        table.appendChild(row)
    }

}

/**
 * Gets the room number for a given ID
 * @param {*} roomID Room ID to get number for
 * @returns Promise resolving to number for the room
 */
function getRoomNum(roomID){
    return dbToken.then((token) => {
        return fetch(
          'https://capstonedbapi.azurewebsites.net' + 
          '/room-management/rooms/' + roomID,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            }
          }
        )
      })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Request failed.");
        }
      })
      .then((room) => {
        return room[0].room_num;
      })
      .catch((error) => {
        console.log(error.message);
      })
}

// Maps time codes to days and start times for saving locally
const SOLUTION_CODEX = {
    0: {
        days: 'MWF',
        time: '0815',
    },
    1: {
        days: 'MWF',
        time: '0935',
    },
    2: {
        days: 'MWF',
        time: '1055',
    },
    3: {
        days: 'MWF',
        time: '1215',
    },
    4: {
        days: 'MWF',
        time: '1335',
    },
    5: {
        days: 'MWF',
        time: '1525',
    },
    6: {
        days: 'MWF',
        time: '1730',
    },
    7: {
        days: 'MWF',
        time: '1930',
    },
    8: {
        days: 'TR',
        time: '0800',
    },
    9: {
        days: 'TR',
        time: '0955',
    },
    10: {
        days: 'TR',
        time: '1330',
    },
    11: {
        days: 'TR',
        time: '1525',
    },
    12: {
        days: 'TR',
        time: '1730',
    },
    13: {
        days: 'TR',
        time: '1930',
    }
}

/**
 * Saves the currently selected solution to local storage
 */
function currentSolutionToLocalStorage() {
    let currentSolnId = document.querySelector('#previewSolutionSelect').value
    solutionToLocalStorage(currentSolnId)
    alert('Saved to local storage. Return to the schedule page to load.')
}

/**
 * Saves a given solution ID to a format for localStorage schedule
 * @param {*} solution_id Solution to store
 */
function solutionToLocalStorage(solution_id) {
    let soln = solutions[solution_id];
    let outSchedule = {}
    let sectionMap = {}

    for(let room_id in soln) {
        outSchedule[room_id] = {}
        for(let timecode in soln[room_id]) {
            let codex_val = SOLUTION_CODEX[timecode]
            
            // Get the section number for this timecode in this room
            // If the section counter does not exist yet, set it to 0
            // Else, increment
            console.log(soln[room_id][timecode]["course_id"])
            if(sectionMap[soln[room_id][timecode]["course_id"]] == undefined) {
                console.log("Setting new section counter")
                sectionMap[soln[room_id][timecode]["course_id"]] = 0
            } else {
                console.log("Incrementing existing section num")
                sectionMap[soln[room_id][timecode]["course_id"]] += 1
            }

            for(let day of codex_val.days.split('')) {
                if(!outSchedule[room_id][day]) {
                    outSchedule[room_id][day] = {}
                }

                let courseId = soln[room_id][timecode]["course_id"]
                let section = sectionMap[soln[room_id][timecode]["course_id"]]

                outSchedule[room_id][day][codex_val.time] = {
                    professor: `${soln[room_id][timecode]["teacher_id"]}`,
                    class: `${courseId}:${section}`
                }
            }
        }
    }

    window.localStorage.setItem('algoSchedule', JSON.stringify(outSchedule))
}