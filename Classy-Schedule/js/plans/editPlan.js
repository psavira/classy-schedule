function init() {

    console.log("Ready")
    fetchPlans()

    let buttonPressed = false;

    // Add event listeners to buttons
    document.forms.chooseForm.delete.addEventListener("click", (event) => {
        console.log("Trying to delete")
        if(!buttonPressed) {
            buttonPressed = true;
            let id = document.forms.chooseForm.planId.value
            if(id != "") {
                deletePlan(id).then(() => {
                    window.location.reload()
                })
            }
        }

    })

    document.forms.chooseForm.edit.addEventListener("click", (event) => {
        if(!buttonPressed) {
            buttonPressed = true
            let id = document.forms.chooseForm.planId.value
            if(id != "") {
                editPlan(id).then(() => {
                    window.location.reload()
                })
            }
        }
    })
}

/**
 * Fills the plan dropdown with values
 */
function fetchPlans() {
    dbToken
    .then((token) => {
        return fetch(
            "https://capstonedbapi.azurewebsites.net" +
            "/plan-management/plans",
            {
                headers: {
                    "Authorization": token
                }
            }
        )
    })
    .then((response) => {
        if(response.ok) {
            return response.json()
        } else {
            throw new Error("Something went wrong")
        }
    })
    .then((json) => {
        let planSelect = document.getElementById("planId")
        for(let plan of json) {
            let option = document.createElement("option")
            option.value = plan.plan_id
            option.textContent = `${plan.plan_id}:${plan.plan_name}`
            planSelect.appendChild(option)
        }
    })
    .catch((error) => {
        clearAlerts(error.message)
    })
}

/**
 * Checks form validity for submission. Shows relevant alerts.
 * @returns Boolean representing the validity of the form
 */
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

/**
 * Submits the form
 */
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

/**
 * Deletes a plan from the database
 * @param {*} plan_id ID of the plan to delete
 * @return A promise that runs when the function completes
 */
function deletePlan(plan_id) {
    // Try to delete the plan
    return dbToken
    .then((token) => {
        return fetch(
            "https://capstonedbapi.azurewebsites.net" +
            "/plan-management/plans/delete/" +
            plan_id,
            {
                headers: {
                    "Authorization": token
                },
                method: "DELETE"
            }
        )

    })
}