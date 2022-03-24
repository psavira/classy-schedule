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
        showAlert("Please enter a room number.");
        alert_count++;
    }

    // Validate department
    if (validator.isEmpty(capacity)) {
        showAlert("Please enter a room capacity.")
        alert_count++;
    }

    if (!validator.isInt(room_num)) {
        showAlert("Room number should be an integer.")
        alert_count++
    }

    if (!validator.isInt(capacity)) {
        showAlert("Room capacity should be an integer.")
        alert_count++
    } 
    

    // Fail if any alerts
    if (alert_count > 0) return false;
    return true;

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
