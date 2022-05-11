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
    if(!localSchedule[room_id]) {
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
    if(roomSelect.value != '') {
        saveRoom(roomSelect.value, getTable())
      }
}

/**
 * Loads the current room from temporary storage and updates the visible table
 */
function loadCurrentRoom() {
    let roomSelect = document.querySelector('#roomSelect')
    let room_id = roomSelect.value

    if(!localSchedule[room_id]) {
        console.log("No schedule exists for this room yet")
        return
    }
    setTable(localSchedule[room_id])
}

/* -------------------------------------------------------------------------- */
/*                                 DB Storage                                 */
/* -------------------------------------------------------------------------- */

const DBTimeSlots = {
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
