async function fetchClasses() {
    let classSelect = document.getElementById("classSelection");

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
            classSelect.appendChild(classOption);
        } 
    })
    .catch(error => {
        clearAlerts()
        showAlert(error.message)
    })
}