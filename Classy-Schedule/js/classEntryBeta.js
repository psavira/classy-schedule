/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/** function to send form to db */
async function submitForm() {
  // Clear any alerts
  // eslint-disable-next-line no-use-before-define
  clearAlerts();

  // eslint-disable-next-line no-undef
  // make a form
  // eslint-disable-next-line no-undef
  const { classForm } = document.forms;
  // get class name
  const className = classForm.className.value;
  // get dept id
  const deptID = classForm.department.value;
  // get class number
  const classNum = classForm.classNumber.value;
  // get capacity
  const capacity = classForm.capacity.value;
  // get credits
  const credits = classForm.credits.value;
  // if all info works
  if (isValidForm(className, deptID, classNum, capacity, credits)) {
    // make a var to hold info
    const postData = {
      className,
      deptID,
      classNum,
      capacity,
      credits,
    };
    // get the courses from database
    fetch('/api/course', {
      // send to db
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    })
      // if response okay
      .then(async (response) => {
        // say success
        if (response.ok) {
          clearAlerts();
          showAlert('Success!');
          // Clear form
          classForm.className.value = '';
          classForm.department.value = '';
          classForm.classNumber.value = '';
          classForm.capacity.value = '';
          classForm.credits.value = '';
          // otherwise don't send and show alerts
        } else {
          clearAlerts();
          const text = await response.text();
          showAlert(text);
        }
      })
      // catch the error and show error message
      .catch((error) => {
        clearAlerts();
        showAlert(error.message);
      });
    showAlert('Sending request...');
  }
}

/* function to see if class entry form is valid */
function isValidForm(className, deptID, classNum, capacity, credits) {
  // variable to hold # of alerts
  let alertCount = 0;

  // Validate class name if empty
  if (validator.isEmpty(className)) {
    showAlert('Please enter a class name.');
    alertCount++;
  }

  // Validate department if empty
  if (validator.isEmpty(deptID)) {
    showAlert('Please pick a department.');
    alertCount++;
  }

  // Validate class number if empty
  if (validator.isEmpty(classNum)) {
    showAlert('Please enter a class number.');
    alertCount++;
  }
  // if class number isn't an int show alert
  if (!validator.isInt(classNum)) {
    showAlert('Class number should be an integer.');
    alertCount++;
  }

  // Validate capacity if empry
  if (validator.isEmpty(capacity)) {
    showAlert('Please enter class capacity.');
    alertCount++;
  }
  // validate capacity if not integer
  if (!validator.isInt(capacity)) {
    showAlert('Class capacity should be an integer.');
    alertCount++;
  }

  // Validate credits if empty
  if (validator.isEmpty(credits)) {
    showAlert('Please enter class credits.');
    alertCount++;
  }
  // validate credits if not integer
  if (!validator.isInt(credits)) {
    showAlert('Class credits should be an integer.');
    alertCount++;
  }

  // Fail if any alerts
  if (alertCount > 0) return false;
  return true;
}

/* method to show the alerts that pop when filling class entry form */
function showAlert(alertText) {
  // container to hold alerts
  const alertContainer = document.getElementById('alertContainer');
  // make alert a div element
  const alert = document.createElement('div');
  // add callout and warning to alert
  alert.classList.add('callout', 'warning');
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
  // eslint-disable-next-line no-restricted-syntax
  for (const child of children) {
    // print out alert
    console.log(child);
    // remove the alerts
    alertContainer.removeChild(child);
  }
}

/* fetch the departments from database */
async function fetchDepartments() {
  // get department by element id
  const departmentSelect = document.getElementById('department');
  // fetch departments from database
  fetch('/api/departments')
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
      // eslint-disable-next-line no-restricted-syntax
      for (const department of departments) {
        // create an element for each department
        const departmentOption = document.createElement('option');
        // set the value to department ID
        departmentOption.value = department.deptID;
        // set text to department name
        departmentOption.textContent = department.dept_name;
        // add department to departmentSelect
        departmentSelect.appendChild(departmentOption);
      }
    })
    // show alert message
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });
}

/* function to get classes from database */
async function fetchClasses() {
  // make classSelect by id
  const classSelect = document.getElementById('testclasses');
  // fetch courses from database
  fetch('/api/courses')
  // if response okay return response
    .then(async (response) => {
      if (response.ok) {
        return response.json();
      }
      // otherwise error
      const errorText = await response.text();
      throw new Error(errorText);
    })
    // loop through courses
    .then((testclasses) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const classes of testclasses) {
        // create element for each course
        const classOption = document.createElement('option');
        // set value to dept id
        classOption.value = classes.deptID;
        // set text to class Name
        classOption.textContent = classes.className;
        // add each course
        classSelect.appendChild(classOption);
      }
    })
    // catch errors and show message
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });
}
