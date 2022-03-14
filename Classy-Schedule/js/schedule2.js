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