function isValid() {
    let alert_count = 0

    let planForm = document.forms.planForm

    let planName = planForm.planName.value
    let planDesc = planForm.planDescription.value
    let planYear = planForm.planYear.value
    let planSemester = planForm.planSemester.value

    if(validator.isEmpty(planName)) {
        showAlert('Please enter a plan name.')
        planForm.planName.classList.add('error')
        alert_count++
    }

    if(validator.isEmpty(planDesc)) {
        showAlert('Please enter a plan description.')
        planForm.planDescription.classList.add('error')
        alert_count++
    }

    if(validator.isEmpty(planYear)) {
        showAlert('Please enter a plan year.')
        planForm.planYear.classList.add('error')
        alert_count++
    }

    if(!validator.isInt(planYear)) {
        showAlert('Plan year must be an integer.')
        planForm.planYear.classList.add('error')
        alert_count++
    }

    if(validator.isEmpty(planSemester)) {
        showAlert('Please enter a plan semester.')
        planForm.planSemester.classList.add('error')
        alert_count++
    }

    if(!validator.isInt(planSemester)) {
        showAlert('Plan semester must be an integer.')
        planForm.planSemester.classList.add('error')
        alert_count++
    }

    if(alert_count > 0) {
        return false
    }
    
    return true
}

function submit() {
    // Clear alerts
    clearAlerts()

    // Validate the inputs
    if(!isValid()) {
        return
    }

    // Next, Submit the request
    let planName = planForm.planName.value
    let planDesc = planForm.planDescription.value
    let planYear = planForm.planYear.value
    let planSemester = planForm.planSemester.value

    let body = {
        "plan_name": planName,
        "plan_description": planDesc,
        "semester_year": planYear,
        "semester_num": planSemester
    }

    let sending = false

    if(!sending) {
        sending = true
        dbToken
        .then((token) => {
            return fetch(
                "https://capstonedbapi.azurewebsites.net" + 
                "/plan-management/plans/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    },
                    body: JSON.stringify(body)
                }
            )
        })
        .then((response) => {
            if(response.ok) {
                showAlert("Success!", "success")
                planForm.planName.value = ""
                planForm.planDescription.value = ""
                planForm.planYear.value = ""
                planForm.planSemester.value = ""
            } else {
                showAlert("Something went wrong")
            }
            sending = false
        })
    } else {
        clearAlerts();
        showAlert("Already sending request")
    }

    // Finally, parse the response
}