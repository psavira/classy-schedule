// loads dept name
function loadDepartment(deptID) {
  return dbToken.then((token) => {
    return fetch(
      'https://capstonedbapi.azurewebsites.net/department-management/departments/' + deptID,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      }
    )
  })
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Department request failed.");
    }
  })
  .then((json) => {
    return json[0].dept_name;
  })
  .catch((error) => {
    console.log(error.message);
  })
}

/** function to fetch classes from database */
// eslint-disable-next-line no-unused-vars

async function fetchClasses() {
  // get class select by id
  const classSelect = document.getElementById('classSelect');
  // fetch classes from db
  dbToken.then((token) => {
  return fetch('https://capstonedbapi.azurewebsites.net/class-management/classes', 
    {
      headers: {'Authorization': token}
    })
  })
    // if response is good return it
    .then(async (response) => {
      if (response.ok) {
        return response.json();
      }
      // else error
      const errorText = await response.text();
      throw new Error(errorText);
    })
    // loop through the profs
    .then((classSelection) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const course of classSelection) {
        // create a option for every class
        const classOption = document.createElement('option');
        // set value to class id
        classOption.value = course.class_id;
        // set text course
        loadDepartment(course.dept_id).then(dept =>{
          classOption.text = dept + " " + course.class_num +
                              " - " + course.class_name;
        })
        // add each class
        classSelect.appendChild(classOption);
      }
    })
    // catch errors and show messages
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });
}

/** function to send form to db */
async function submitForm() {
  // Clear any alerts
  clearAlerts();
  

  // Get the form from the document
  const { classForm } = document.forms;

  // Clear form error highlighting
  classForm.className.classList.remove('error');
  classForm.department.classList.remove('error');
  classForm.classNumber.classList.remove('error');
  classForm.capacity.classList.remove('error');
  classForm.credits.classList.remove('error');
  classForm.isLab.classList.remove('error');
  classForm.num_sections.classList.remove('error');

  // Get form values
  const className = classForm.className.value;
  const deptID = classForm.department.value;
  const classNum = classForm.classNumber.value;
  const capacity = classForm.capacity.value;
  const credits = classForm.credits.value;
  const num_sections = classForm.num_sections.value;
  const isLab = classForm.isLab.checked;


  // If info is all valid
  if (isValidForm(className, deptID, classNum, capacity, credits, isLab, num_sections)) {

    // Create an object to POST as JSON
    const postData = {
      class_name: className,
      dept_id: deptID,
      class_num: classNum,
      capacity: capacity,
      credits: credits,
      is_lab: isLab,
      num_sections: num_sections
    };


    // POST the data to upload the course
    dbToken.then((token) => {
      return fetch(
        'https://capstonedbapi.azurewebsites.net' + 
        '/class-management/classes/create', 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': token },
          body: JSON.stringify(postData),
        })
    })
      .then(async (response) => {
        // Check that response code is 200
        if (response.ok) {
          clearAlerts();
          showAlert('Success!', 'success');
          // Clear form
          classForm.className.value = '';
          classForm.department.value = '';
          classForm.classNumber.value = '';
          classForm.capacity.value = '';
          classForm.credits.value = '';
          classForm.isLab.value = '';
          classForm.num_sections.value = '';
        } else {
          clearAlerts();
          const text = await response.text();
          showAlert(text);
        }
      })
      .then(() => {
        window.location.reload();
      })
      // catch any errors and show error message
      .catch((error) => {
        clearAlerts();
        showAlert(error.message);
      });
    showAlert('Sending request...', 'warning');
  }
}

/* function to see if class entry form is valid */
function isValidForm(className, deptID, classNum, capacity, credits, isLab, num_sections) {

  // variable to hold # of alerts
  let alertCount = 0;

  // Validate class name if empty
  if (validator.isEmpty(className)) {
    showAlert('Please enter a class name.');
    document.forms.classForm.className.classList.add('error');
    alertCount += 1;
  }

  // Validate department if empty
  if (validator.isEmpty(deptID)) {
    showAlert('Please pick a department.');
    document.forms.classForm.department.classList.add('error');
    alertCount += 1;
  }

  // Validate department if empty
  if (validator.isEmpty(num_sections)) {
    showAlert('Please enter the number of sections.');
    document.forms.classForm.num_sections.classList.add('error');
    alertCount += 1;
  }

  // Validate class number if empty
  if (validator.isEmpty(classNum)) {
    showAlert('Please enter a class number.');
    document.forms.classForm.classNumber.classList.add('error');
    alertCount += 1;
  }
  // if class number isn't an int show alert
  if (!validator.isInt(classNum)) {
    showAlert('Class number should be an integer.');
    document.forms.classForm.classNumber.classList.add('error');
    alertCount += 1;
  }

  // Validate capacity if empry
  if (validator.isEmpty(capacity)) {
    showAlert('Please enter class capacity.');
    document.forms.classForm.capacity.classList.add('error');
    alertCount += 1;
  }
  // validate capacity if not integer
  if (!validator.isInt(capacity)) {
    showAlert('Class capacity should be an integer.');
    document.forms.classForm.capacity.classList.add('error');
    alertCount += 1;
  }

  // Validate credits if empty
  if (validator.isEmpty(credits)) {
    showAlert('Please enter class credits.');
    document.forms.classForm.credits.classList.add('error');
    alertCount += 1;
  }
  // validate credits if not integer
  if (!validator.isInt(credits)) {
    showAlert('Class credits should be an integer.');
    document.forms.classForm.credits.classList.add('error');
    alertCount += 1;
  }

  // Fail if any alerts
  if (alertCount > 0) return false;
  return true;
}

/* method to show the alerts that pop when filling class entry form */
function showAlert(alertText, alertClass) {
  // if defined, use parameter alert class. Otherwise, use 'alert'
  alertClass = alertClass || 'alert';
  // container to hold alerts
  const alertContainer = document.getElementById('alertContainer');
  // make alert a div element
  const alert = document.createElement('div');
  // add callout and alert class to alert
  alert.classList.add('callout', alertClass);
  alert.innerText = alertText;
  // add alert to alert container
  alertContainer.appendChild(alert);
}

/* function to remove alerts */
function clearAlerts() {
  // make a container to hold alerts
  const alertContainer = document.getElementById('alertContainer');
  // array of alerts
  const children = [...alertContainer.children];
  // eslint-disable-next-line no-restricted-syntax
  // loop through the alerts
  children.forEach((child) => {
    // print out alert
    console.log(child);
    // remove the alerts
    alertContainer.removeChild(child);
  });
}

/* fetch the departments from database */
async function fetchDepartments() {
  // get department by element id
  const departmentSelect = document.getElementById('department');
  // fetch departments from database
  dbToken.then((token) => {
  return fetch(
    'https://capstonedbapi.azurewebsites.net' + 
    '/department-management/departments', 
    {
      headers: {'Authorization': token}
    })
  })
  // if response okay
    .then(async (response) => {
      if (response.ok) {
        // return response
        return response.json();
      }
      // otherwise error
      const errorText = await response.text();
      throw new Error(errorText);
    })
    // loop through the departments
    .then((departments) => {
      departments.forEach((department) => {
        // create an element for each department
        const departmentOption = document.createElement('option');
        // set the value to department ID
        departmentOption.value = department.dept_id;
        // set text to department name
        departmentOption.textContent = department.dept_name;
        // add department to departmentSelect
        departmentSelect.appendChild(departmentOption);
      });
    })
    // show alert message
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });
}

// deletes selected class
function deleteClass(){
  var classID = document.getElementById('classSelect').value;

  // fetch the class from database
  dbToken.then((token) => {
    return fetch('https://capstonedbapi.azurewebsites.net/class-management/classes/delete/'+ classID, {
    // send to db
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json','Authorization': token },
  })
  })
  .then(() => {
    window.location.reload();
  })
}