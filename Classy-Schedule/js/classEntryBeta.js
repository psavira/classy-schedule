async function submitForm() {
    // Clear any alerts
    clearAlerts()

    let class_form = document.forms["classForm"];

    let class_name = class_form["className"].value
    let department = class_form["department"].value
    let class_number = class_form["classNumber"].value
    let capacity = class_form["capacity"].value
    let credits = class_form["credits"].value

    if (isValidForm(class_name, department, class_number, capacity, credits)) {
        let post_data = {
            class_name: class_name,
            department: department,
            class_number: class_number,
            capacity: capacity,
            credits: credits
        }
        fetch('/api/course', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post_data)
        })
        .then(async (response) => {
            if(response.ok) {
                clearAlerts()
                showAlert("Success!")
                // Clear form
                class_form["className"].value = ""
                class_form["department"].value = ""
                class_form["classNumber"].value = ""
                class_form["capacity"].value = ""
                class_form["credits"].value = ""
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

function isValidForm(class_name, department, class_number, capacity, credits) {

    let alert_count = 0

    // Validate class name
    if (validator.isEmpty(class_name)) {
        showAlert("Please enter a class name.");
        alert_count++;
    }

    // Validate department
    if (validator.isEmpty(department)) {
        showAlert("Please pick a department.")
        alert_count++;
    }

    // Validate class number
    if (validator.isEmpty(class_number)){
        showAlert("Please enter a class number.")
        alert_count++
    }
    
    if (!validator.isInt(class_number)) {
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
    
    // Validate credits
    if (validator.isEmpty(credits)) {
        showAlert("Please enter class credits.")
        alert_count++
    }

    if (!validator.isInt(credits)) {
        showAlert("Class credits should be an integer.")
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

async function fetchDepartments() {
    let departmentSelect = document.getElementById("department")

    fetch('/api/departments')
    .then(async (response) => {
        if (response.ok) {
            return response.json()
        }
        const error_text = await response.text()
        throw new Error(error_text)
    })
    .then(departments => {
        for (let department of departments) {
            let departmentOption = document.createElement("option");
            departmentOption.value = department.dept_name;
            departmentOption.textContent = department.dept_name;
            departmentSelect.appendChild(departmentOption);
        } 
    })
    .catch(error => {
        clearAlerts()
        showAlert(error.message)
    })
}