function formatDataToBody(professors, classes, rooms, times) {
    /* DEBUG */
    // let section_map = {}
    // // For each teacher
    // for(let teacher of professors) {
    //     // Set teach load to 99
    //     teacher.teach_load = 99
    //     for(let can_teach of teacher.classes) {
    //         if(!section_map[can_teach]) {
    //             section_map[can_teach] = 1
    //         } else {
    //             section_map[can_teach] += 1
    //         }
    //     }
    // }

    // for(let course of classes) {
    //     if(section_map[course.id]) {
    //         course.sections = section_map[course.id]
    //     }
    // }

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
                td.innerHTML = `${solution[room][time].course}<br/><i><b>${solution[room][time].teacher}</b></i>`
            }
            row.appendChild(td)
        }
        table.appendChild(row)
    }

}

function getRoomNum(roomID){
    return dbToken.then((token) => {
        return fetch(
          'https://capstonedbapi.azurewebsites.net/room-management/rooms/' + roomID,
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

function getTimeSlot(timeSlotID){
    return dbToken.then((token) => {
        return fetch(
          'https://capstonedbapi.azurewebsites.net/time_slot-management/time_slots/' + timeSlotID,
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
      .then((timeslot) => {
        return timeslot[0].start_time + " - " + timeslot[0].end_time;
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

function currentSolutionToLocalStorage() {
    let currentSolnId = document.querySelector('#previewSolutionSelect').value
    solutionToLocalStorage(currentSolnId)
    alert('Saved to local storage. Return to the schedule page to load.')
}


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


                outSchedule[room_id][day][codex_val.time] = {
                    professor: `${soln[room_id][timecode]["teacher_id"]}`,
                    class: `${soln[room_id][timecode]["course_id"]}:${sectionMap[soln[room_id][timecode]["course_id"]]}`
                }
            }
        }
    }

    window.localStorage.setItem('algoSchedule', JSON.stringify(outSchedule))
}