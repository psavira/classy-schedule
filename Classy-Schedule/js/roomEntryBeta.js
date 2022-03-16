async function submitForm() {
    // Clear any alerts
    clearAlerts()

    let room_form = document.forms["roomForm"];

    let room_num = room_form["roomNum"].value
    let capacity = room_form["capacity"].value

    if (isValidForm(room_num, capacity)) {
        let post_data = {
            room_num: room_num,
            capacity: capacity
        }
        fetch('/api/room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post_data)
        })
        .then(async (response) => {
            if(response.ok) {
                clearAlerts()
                showAlert("Success!")
                // Clear form
                room_form["roomNum"].value = ""
                room_form["capacity"].value = ""
            } else {
                clearAlerts()
                const text = await response.text()
                showAlert(text)
            }
        })
        .catch((error) => {
            clearAlerts()
            showAlert(error.message)
        })
        showAlert("Sending request...")
    }
}

function isValidForm(room_num, capacity) {

    let alert_count = 0

    // Validate class name
    if (validator.isEmpty(room_num)) {
        showAlert("Please enter a class name.");
        alert_count++;
    }

    // Validate department
    if (validator.isEmpty(capacity)) {
        showAlert("Please pick a department.")
        alert_count++;
    }

    if (!validator.isInt(room_num)) {
        showAlert("Class number should be an integer.")
        alert_count++
    }

    // Validate capacity
    if (validator.isEmpty(capacity)) {
        showAlert("Please enter class capacity.")
        alert_count++
    }

    if (!validator.isInt(capacity)) {
        showAlert("Class capacity should be an integer.")
        alert_count++
    } 
    

    // Fail if any alerts
    if (alert_count > 0) return false;
    return true;

}

async function fetchRooms() {
    let roomSelect = document.getElementById("roomSelect");

    fetch('/api/room')
    .then(async (response) => {
        if (response.ok) {
            return response.json()
        }
        const error_text = await response.text()
        throw new Error(error_text)
    })
    .then(roomSelection => {
        for (let room of roomSelection) {
            let roomOption = document.createElement("option");
            roomOption.value = room.room_id;
            roomOption.text = "ROOM " + room.room_num;
            roomSelect.appendChild(roomOption);
        } 
    })
    .catch(error => {
        clearAlerts()
        showAlert(error.message)
    })
}

function showAlert(alert_text) {
    let alertContainer = document.getElementById("alertContainer")

    let alert = document.createElement("div")
    alert.classList.add("callout", "warning")
    alert.innerText = alert_text

    alertContainer.appendChild(alert)
}

function clearAlerts() {
    let alertContainer = document.getElementById("alertContainer")
    
    let children = [...alertContainer.children]
    for(let child of children) {
        console.log(child)
        alertContainer.removeChild(child)
    }
}
