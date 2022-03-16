async function fetchClasses() {
    let classSelect = document.getElementsByClassName("classSelection");

    fetch('/api/courses')
    .then(async (response) => {
        if (response.ok) {
            return response.json()
        }
        const error_text = await response.text()
        throw new Error(error_text)
    })
    .then(classSelection => {
        for (let classes of classSelection) {
            let classOption = document.createElement("option");
            classOption.value = classes.dept_id;
            if(classes.dept_id==1){
                classOption.text = "CISC " + classes.class_num;
            }
            else{
                classOption.text = "STAT " + classes.class_num;
            }
            for(let i=0;i < classSelect.length; i++){
                classSelect[i].appendChild(classOption.cloneNode(true));
            }
        } 
    })
    .catch(error => {
        clearAlerts()
        showAlert(error.message)
    })
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

function makeTable() {


    fetch('/api/courses')
    .then(async (response) => {
        if (response.ok) {
            return response.json()
        }
        const error_text = await response.text()
        throw new Error(error_text)
    })
    .then(classSelection => {

        let table = document.getElementById("classtable");


        console.log("makeTable()");
        for (let i = 0; i < classSelection.length; i++) {

            let row = document.createElement("tr");

            if (classSelection[i].dept_id == 1) {
                row.innerHTML += "<td> " + "CISC" + "</td>";
            } else {
                row.innerHTML += "<td> " + "STAT" + "</td>";
            }

            row.innerHTML += "<td> " + classSelection[i].class_num + "</td>";
            row.innerHTML += "<td> " + classSelection[i].class_name + "</td>";
            row.innerHTML += "<td> " + classSelection[i].capacity + "</td>";
            row.innerHTML += "<td> " + classSelection[i].credits + "</td>";
            table.appendChild(row);

        }

        
    })
    .catch(error => {
        clearAlerts()
        showAlert(error.message)
    })
}

makeTable();