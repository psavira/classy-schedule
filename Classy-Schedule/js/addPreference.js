/** function to send form to db */
async function submitForm() {
    // Clear any alerts
    clearAlerts();
    
  
    // Get the form from the document
    const { classForm } = document.forms;
  
    // Clear form error highlighting
    classForm.department.classList.remove('error');
    classForm.classNumber.classList.remove('error');
    classForm.profID.classList.remove('error');
    classForm.canTeach.classList.remove('error');
    classForm.isLab.classList.remove('error');
    classForm.preferToTeach.classList.remove('error');

  
    // Get form values
    const className = classForm.className.value;
    const deptID = classForm.department.value;
    const classNum = classForm.classNumber.value;
    const capacity = classForm.capacity.value;
    const credits = classForm.credits.value;
    const isLab = classForm.isLab.checked;
    console.log(isLab);
  
    // If info is all valid
    if (isValidForm(className, deptID, classNum, capacity, credits, isLab)) {
      // Create an object to POST as JSON
      const postData = {
        class_name: className,
        dept_id: deptID,
        class_num: classNum,
        capacity: capacity,
        credits: credits,
        is_lab: isLab
      };
  
  
      // POST the data to upload the course
      dbToken.then((token) => {
        return fetch('https://capstonedbapi.azurewebsites.net/class-management/classes/create', {
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
            classForm.isLab.value='';
          } else {
            clearAlerts();
            const text = await response.text();
            showAlert(text);
          }
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
  function isValidForm(className, deptID, classNum, capacity, credits, isLab) {
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
    return fetch('https://capstonedbapi.azurewebsites.net/department-management/departments', 
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
  
  /* function to get classes from database */
  async function fetchClasses() {
    // make classSelect by id
    const classSelect = document.getElementById('testclasses');
    // fetch courses from database
    dbToken.then(token => {
      return fetch('https://capstonedbapi.azurewebsites.net/class-management/classes',
      {
        headers: {
          'Authorization': token
        }
      })
    })
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
        testclasses.forEach((classes) => {
          // create element for each course
          const classOption = document.createElement('option');
          // set value to dept id
          classOption.value = classes.deptID;
          // set text to class Name
          classOption.textContent = classes.className;
          // add each course
          classSelect.appendChild(classOption);
        });
      })
      // catch errors and show message
      .catch((error) => {
        clearAlerts();
        showAlert(error.message);
      });
    }



      async function fetchPreferences() {
        // make classSelect by id
        const classSelect = document.getElementById('testpreferences');
        // fetch courses from database
        dbToken.then(token => {
          return fetch('https://capstonedbapi.azurewebsites.net/preference-management/class-preferences/can-teach/65',
          {
            headers: {
              'Authorization': token
            }
          })
        })
        // if response okay return response
          .then(async (response) => {
            if (response.ok) {
              console.log(response.json());
              return response.json();
              
            }
            // otherwise error
            const errorText = await response.text();
            throw new Error(errorText);
          })
          // loop through courses
          .then((testpreferences) => {
            testpreferences.forEach((preference) => {
              // create element for each course
              const classOption = document.createElement('option');
              // set value to dept id
              classOption.value = preference.deptID;
              // set text to class Name
              classOption.textContent = preference.className;
              // add each course
              classSelect.appendChild(classOption);
            });
          })
          // catch errors and show message
          .catch((error) => {
            clearAlerts();
            showAlert(error.message);
          });
  
  }

  async function fetchProfessors() {
    // get prof select by id
    const profSelect = document.getElementById('profSelect');
    // fetch prof from db
    fetch('/api/professor')
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
      .then((profSelection) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const professor of profSelection) {
          // create a option for every prof
          const profOption = document.createElement('option');
          // set value to prof id
          profOption.value = professor.lastName;
          // set text to last name
          profOption.text = `Professor ${professor.last_name}`;
          // add each prof
          profSelect.appendChild(profOption);
        }
      })
      // catch errors and show messages
      .catch((error) => {
        clearAlerts();
        showAlert(error.message);
      });
  }
  
  /** function to show error messages */
  function showAlert(alertText) {
    // create container to hold alerts
    const alertContainer = document.getElementById('alertContainer');
    // create alert div
    const alert = document.createElement('div');
    // add callout and warnings
    alert.classList.add('callout', 'warning');
    alert.innerText = alertText;
    // add alert to container
    alertContainer.appendChild(alert);
  }
  
  /** function to clear the alerts */
  function clearAlerts() {
    // make alert container to hold alerts
    const alertContainer = document.getElementById('alertContainer');
    // array to hold all alerts
    const children = [...alertContainer.children];
    // loop through the alerts
    // eslint-disable-next-line no-restricted-syntax
    for (const child of children) {
      // print error
      console.log(child);
      // remove the error
      alertContainer.removeChild(child);
    }
  }

  
  
  