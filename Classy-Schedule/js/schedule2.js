async function fetchClasses() {
    let classSelect = document.getElementById("classSelection")

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
            classOption.textContent = classes.class_name;
            classSelect.appendChild(classOption);
        } 
    })
    .catch(error => {
        clearAlerts()
        showAlert(error.message)
    })
}