/* eslint-disable no-plusplus */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/** function to send entry to db */
// eslint-disable-next-line no-unused-vars
async function submitForm() {
  // Clear any alerts
  clearAlerts();
  // create form to hold room entry
  // eslint-disable-next-line camelcase
  const prof_form = document.forms.profForm;

  const professor_id = prof_form.profNum.value;
  const first_name = prof_form.firstName.value;
  const last_name = prof_form.lastName.value;
  const teach_load = prof_form.teachLoad.value;

  // if the entry is valid
  if (isValidForm(professor_id, first_name, last_name, teach_load)) {
    // hold info in post data
    const postData = {
      professor_id: professor_id,
      // eslint-disable-next-line object-shorthand
      first_name: first_name,
      last_name: last_name,
      teach_load: teach_load,
    };
    // fetch the rooms from database
    fetch('/api/professor', {
      // send to db
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    })
    // if response is good
      .then(async (response) => {
        if (response.ok) {
          clearAlerts();
          showAlert('Success!');

          // Clear form
          // eslint-disable-next-line camelcase
          prof_form.profNum.value = '';
          // eslint-disable-next-line camelcase
          prof_form.firstName.value = '';
          prof_form.lastName.value = '';
          prof_form.teachLoad.value = '';
        } else {
          // show alerts
          clearAlerts();
          const text = await response.text();
          showAlert(text);
        }
      })
    // catch errors and show messages
      .catch((error) => {
        clearAlerts();
        showAlert(error.message);
      });
    showAlert('Sending request...');
  }
}

/* function to check if class entry is valid */
// eslint-disable-next-line camelcase
function isValidForm(professor_id, first_name, last_name, teach_load ) {
  // counter for alerts
  let alertContainer = 0;

  // Validate class name if empty
  if (validator.isEmpty(professor_id)) {
    showAlert('empty profID.');
    alertContainer++;
  }

  // Validate department if empty
  if (validator.isEmpty(first_name)) {
    showAlert('empty firstName.');
    alertContainer++;
  }

  if (validator.isEmpty(last_name)) {
    showAlert('Empty lastName.');
    alertContainer++;
  }

  if (validator.isEmpty(teach_load)) {
    showAlert('Empty teachLoad');
    alertContainer++;
  }
  // validate room number if not integer
  if (!validator.isInt(teach_load)) {
    showAlert('teachLoad should be an integer.');
    alertContainer++;
  }

  if (!validator.isInt(professor_id)) {
    showAlert('profID should be an integer.');
    alertContainer++;
  }

  // validate capacity if not integer
  if (validator.isInt(last_name)) {
    showAlert('lastName should nto have ints.');
    alertContainer++;
  }

  if (validator.isInt(first_name)) {
    showAlert('firstName should nto have ints.');
    alertContainer++;
  }

  // Fail if any alerts
  if (alertContainer > 0) return false;
  return true;
}

/** function to fetch rooms from database */
// eslint-disable-next-line no-unused-vars
async function fetchProfessors() {
  // get room select by id
  const profSelect = document.getElementById('profSelect');
  // fetch rooms from db
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
    // loop through the rooms
    .then((profSelection) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const professor of profSelection) {
        // create a option for every room
        const profOption = document.createElement('option');
        // set value to room id
        profOption.value = professor.professor_id;
        // set text to room and number
        profOption.text = `Professor ${professor.last_name}`;
        // add each room
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
