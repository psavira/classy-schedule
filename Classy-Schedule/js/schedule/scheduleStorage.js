// Concerns schedule saving and loading

/* -------------------------------------------------------------------------- */
/*                                Local Storage                               */
/* -------------------------------------------------------------------------- */
let localSchedule = {}

/* ----------------------------- Entire Schedule ---------------------------- */

/**
 * Saves localSchedule to window.localStorage
 */
function saveSchedule() {
    saveCurrentRoom()
    window.localStorage.setItem("localSchedule", JSON.stringify(localSchedule));
}


/**
 * Loads localSchedule from window.localStorage and sets table value to room if
 * a layout for the current room exists.
 */
function loadSchedule() {
    localSchedule = JSON.parse(window.localStorage.getItem("localSchedule"));
    loadCurrentRoom()
}

/**
 * Load schedule from algo
 */
function loadAlgoSchedule() {
    let algoSchedule = window.localStorage.getItem('algoSchedule')
    if (!algoSchedule) {
        showAlert('No algo schedule found in local storage. Try generating one')
        return
    } else {
        localSchedule = JSON.parse(algoSchedule)
    }
    loadCurrentRoom()
}

/* ----------------------------- Room Schedules ----------------------------- */

/**
 * Save the given table to the given room in temporary storage
 * @param {*} room_id Room to save to
 * @param {*} table Table to save
 */
function saveRoom(room_id, table) {
    localSchedule[room_id] = table
}

/**
 * Load the table saved in the given room from temporary storage
 * @param {*} room_id Room to load from
 * @returns The table at the given room. Undefined if the table doesn't exist
 */
function loadRoom(room_id) {
    if (!localSchedule[room_id]) {
        console.log("No schedule exists for this room yet")
        return
    }
    return localSchedule[room_id]
}

/**
 * Saves the current table to the current room in temporary storage
 */
function saveCurrentRoom() {
    let roomSelect = document.querySelector('#roomSelect')
    if (roomSelect.value != '') {
        saveRoom(roomSelect.value, getTable())
    }
}

/**
 * Loads the current room from temporary storage and updates the visible table
 */
function loadCurrentRoom() {
    let roomSelect = document.querySelector('#roomSelect')
    let room_id = roomSelect.value

    if (!localSchedule[room_id]) {
        console.log("No schedule exists for this room yet")
        return
    }
    setTable(localSchedule[room_id])
}

/* -------------------------------------------------------------------------- */
/*                                 DB Storage                                 */
/* -------------------------------------------------------------------------- */

const DB_TIME_SLOT_IDS = {
    '0800': 1,
    '0815': 2,
    '0935': 3,
    '0955': 4,
    '1055': 5,
    '1215': 6,
    '1330': 7,
    '1335': 8,
    '1525': 9,
    '1730': 10,
    '1930': 11,
}

const TIME_SLOT_KEYS = {
    '0800': '08:00-09:40',
    '0815': '08:15-09:20',
    '0935': '09:35-10:40',
    '0955': '09:55-11:35',
    '1055': '10:55-12:00',
    '1215': '12:15-13:20',
    '1330': '13:30-15:10',
    '1335': '13:35-14:40',
    '1525': '15:25-17:00',
    '1730': '17:30-19:15',
    '1930': '19:30-21:15',
}

const END_TIMES = {
    '0800': '0940',
    '0815': '0920',
    '0935': '1040',
    '0955': '1135',
    '1055': '1200',
    '1215': '1320',
    '1330': '1510',
    '1335': '1440',
    '1525': '1700',
    '1730': '1915',
    '1930': '2115',
}

async function saveToDB() {
    // Disable DB controls
    // TODO

    // Get all time slots
    let timeSlotMap = {}

    let sectionsRequestSucceeded = await dbToken.then((token) => {
        return fetch('https://capstonedbapi.azurewebsites.net' +
            '/section_time_slot-management/section_time_slots/formatted',
            {
                headers: {
                    'Authorization': token
                }
            })
    })
        .then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error("Couldn't get time slots from database")
            }
        })
        .then((timeslots) => {
            for (let slot of timeslots) {
                timeSlotMap[slot["time"]] = slot["id"]
            }
            return true
        })
        .catch((error) => {
            return false
        })

    // If the sections could not be retrieved, return early 
    if (!sectionsRequestSucceeded) {
        clearAlerts()
        showAlert('Sections could not be retrieved from the database')
        return
    }

    // Generate sections for all days, times, and rooms
    let sections = []
    for (let room in localSchedule) {
        for (let day in localSchedule[room]) {
            for (let starttime in localSchedule[room][day]) {

                let entry = localSchedule[room][day][starttime]

                // Ignore adding class if the data is not set
                if (entry.class != "") {
                    // Stop if professor not set for the class
                    if (entry.professor == "") {
                        clearAlerts()
                        showAlert(`Please set a professor for ${day} ${TIME_SLOT_KEYS[starttime]}`)
                        return
                    }

                    // Handle database storing thursday as H instead of R
                    let dbDay = day
                    if (day == 'R') dbDay = 'H'

                    // Check if the time slot exists in the database
                    let timeSlotText = `${dbDay} ${TIME_SLOT_KEYS[starttime]}`
                    console.log('Slot Text', timeSlotText)

                    let timeSlotID = timeSlotMap[timeSlotText]

                    // If the time slot does not exist, create one
                    if (timeSlotID == undefined) {
                        console.log(timeSlotMap)
                        console.log(`Couldn't find time slot [${timeSlotText}]. Trying to make new one.`)
                        timeSlotID = await getNewTimeslot(starttime, day)
                        if (timeSlotID == undefined) {
                            return
                        }
                    }

                    // Create a new section with the proper variables
                    let classData = entry.class.split(':')
                    let planID = document.getElementById('planSelect').value

                    let section = {
                        section_num: classData[1],
                        class_id: classData[0],
                        room_id: room,
                        plan_id: planID,
                        professor_id: entry.professor,
                        section_time_slot_id: timeSlotID
                    }

                    sections.push(section)
                }

            }

        }
    }
    
    // When all done, send sections in a /create/multiple request
    console.log(sections)
    let createSectionsSucceeded = await dbToken.then((token) => {
        return fetch('https://capstonedbapi.azurewebsites.net' + 
            '/sections-management/sections/create/multiple',
            {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(sections)
            })
    })
    .then((response) => {
        if(response.ok) {
            return true
        } else {
            return false
        }
    })

    // If the request was successful, show a success message!
    // Else show an error
    if(createSectionsSucceeded) {
        clearAlerts()
        showAlert('Saved!', 'success')
        return
    } else {
        clearAlerts()
        showAlert('Failed to save')
        return
    }
}

/**
 * Generates a new timeslot in the database for the creation script
 * @param {*} starttime Starting time of the slot
 * @param {*} day Day to create
 * @returns 
 */
function getNewTimeslot(starttime, day) {
    let body = {
        "time_slot_id": DB_TIME_SLOT_IDS[starttime],
        "on_monday": (day == "M"),
        "on_tuesday": (day == "T"),
        "on_wednesday": (day == "W"),
        "on_thursday": (day == "R"),
        "on_friday": (day == "F"),
    }

    return dbToken.then((token) => {
        return fetch('https://capstonedbapi.azurewebsites.net' +
            '/section_time_slot-management/section_time_slots/create',
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                method: 'POST',
                body: JSON.stringify(body)
            })
    })
        .then((response) => {
            if ((response.ok)) {
                return response.json()
            } else {
                throw new Error("Couldn't create new timeslot")
            }
        })
        .then((json) => {
            return json['section_time_slot_id']
        })
        .catch((error) => {
            clearAlerts()
            showAlert('Couldn\'t create a new time slot')
            return
        })
}

async function loadFromDB() {
    // Disable DB controls

    // Set new schedule
    newSchedule = {}

    // Generate a time slot map
    let timeSlotMap = {}
    let timeSlotMapSuccess = await dbToken.then((token) => {
        return fetch('https://capstonedbapi.azurewebsites.net' +
            '/section_time_slot-management/section_time_slots/formatted',
            {
                headers: {
                    'Authorization': token
                }
            })
        })
        .then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error("Couldn't get time slots from database")
            }
        })
        .then((timeslots) => {
            for (let slot of timeslots) {
                timeSlotMap[slot["id"]] = slot["time"]
            }
            return true
        })
        .catch((error) => {
            return false
        })

    if (!timeSlotMapSuccess) {
        clearAlerts()
        showAlert("Couldn't get time slots from database")
        return
    }

    // Get the plan ID from the dropdown
    let planID = document.getElementById('planSelect').value

    // Get the plan from the database
    let plan = await dbToken.then((token) => {
        return fetch('https://capstonedbapi.azurewebsites.net' +
        '/sections-management/sections/plan/' + planID,
        {
            headers: {
                'Authorization': token,
            }
        })
        .then((response) => {
            if(response.ok) {
                return response.json()
            } else {
                throw new Error('Failed to get plan data')
            }
        })
        .then((sections) => {
            for(let section of sections) {
                // Check that the section time slot is valid
                let timeSlotText = timeSlotMap[section["section_time_slot_id"]]
                console.log(timeSlotText, section)
                if(!isValidTimeSlot(timeSlotText)) {
                    throw new Error('Section time slot not valid')
                }
                // If it is, parse out the time and days
                let days = timeSlotText.split(' ')[0].split('')
                let starttime = timeSlotText.split(' ')[1].split('-')[0].replace(':', '')
                for(let day of days) {
                    // Format day code to local standard
                    if(day == 'H') day = 'R'
                    console.log(`Placing class into ${day} ${starttime}`)
                    placeSection(section, day, starttime, newSchedule)
                }
            }
            return true
        })
        .catch((error) => {
            clearAlerts()
            showAlert(error.message)
            return false
        })
    })

    if(!plan) {
        return
    } else {
        clearTable()
        localSchedule = newSchedule
        loadCurrentRoom()
    }
}

function isValidTimeSlot(timeSlotText) {
    let timeText = timeSlotText.split(' ')[1]
    // Replace xx:xx-xx:xx to xxxx, xxxx
    let startTime = timeText.split('-')[0].replace(':', '')
    let endTime = timeText.split('-')[1].replace(':', '')

    // Check that end times match valid entries for start times
    return (END_TIMES[startTime] == endTime)
}

function placeSection(section, day, time, schedule) {
    let room_id = section['room_id']
    if(!schedule[room_id]) {
        schedule[room_id] = {}
    }

    if(!schedule[room_id][day]) {
        schedule[room_id][day] = {}
    }

    if(!schedule[room_id][day][time]) {
        schedule[room_id][day][time] = {}
    }

    let class_id = section['class_id']
    let section_num = section['section_num']
    let professor_id = section['professor_id']

    schedule[room_id][day][time] = {
        class: `${class_id}:${section_num}`,
        professor: `${professor_id}`
    }
}