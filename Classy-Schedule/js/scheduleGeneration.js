async function ready() {
    Promise.all([fetchProfessorsData(),
                fetchClassesData(),
                fetchRoomsData(),
                fetchTimesData()])
        .then((values) => {
            let professors, classes, rooms, times
            [professors, classes, rooms, times] = values
            console.log(professors)
            console.log(classes)
            console.log(rooms)
            console.log(times)
        })
}

function formatDataToBody(professors, classes, rooms, times) {
    return {
        // Get an array of ints from 0-13
        "times": [...Array(14).keys()],
        "rooms": rooms,
        "teachers": professors,
        "classes": classes
    }
}


function generateSchedule() {
    const elemScheduleGenerating = document.getElementById("scheduleGenerating")
    const elemScheduleNotGenerating = document.getElementById("scheduleNotGenerating")

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
                user_id: -99,
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
}
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
            user_id: -99
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

        } else {
            // Recheck status in 5 seconds.
            setTimeout(() => {statusChecker()}, 5000)
        }
    })
    .catch(err => {
        showAlert(err.message)
    })
}