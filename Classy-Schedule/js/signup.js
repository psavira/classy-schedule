/* eslint-disable no-plusplus */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/** function to send entry to db */
// eslint-disable-next-line no-unused-vars
async function submitForm() {
  // Clear any alerts
  clearAlerts();
  // create form to hold prof entry
  // eslint-disable-next-line camelcase
  const signup_form = document.forms.signupForm;
  // vars from form
  const username = signup_form.username.value;
  const pass = signup_form.password.value;
  const reenter_pass = signup_form.reenterPassword.value;

  // if the entry is valid
  if (isValidForm(username, pass, reenter_pass)) {
    // hold info in post data
    const postData = {
      // eslint-disable-next-line object-shorthand
      username: username,
      // pass: pass,
      password: pass,
    }; console.log(postData);
    // fetch the profs from database
    dbToken.then((token) => {
      return fetch('https://capstonedbapi.azurewebsites.net/user-management/admin/create', {
        // send to db
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token},
        body: JSON.stringify(postData),
      })
      })
    // if response is good
      .then(async (response) => {
        if (response.ok) {
          clearAlerts();
          showAlert('Success!');

          // Clear form
          signup_form.username.value = '';
          signup_form.password.value = '';
          signup_form.reenterPassword.value = '';
        } else {
          // show alerts
          clearAlerts();
          const json = await response.json();
          showAlert(json.title);
        }
      })
    // catch errors and show messages
      .catch((error) => {
        clearAlerts();
        showAlert(`error2:${error.message}`);
      });
    showAlert('Sending request...');
  }
}

/* function to check if prof entry is valid */
// eslint-disable-next-line camelcase
function isValidForm(username, pass, reenter_pass) {
  // counter for alerts
  let alertContainer = 0;

  // Validate username if empty
  if (validator.isEmpty(username)) {
    showAlert('empty Username.');
    alertContainer++;
  }
  // Validate password if empty
  if (validator.isEmpty(pass)) {
    showAlert('empty Password.');
    alertContainer++;
  }
  // Validate re-enter password if empty
  if (validator.isEmpty(reenter_pass)) {
    showAlert('empty Re-enter Password.');
    alertContainer++;
  }

  // Validate if password and re-enter password are the same
  if (pass != reenter_pass) {
    showAlert('password is different from re-enter password.');
    alertContainer++;
  }

  // Validate if password is between 6-50 char long
  if (pass.length < 6) {
    showAlert('password is too short.');
    alertContainer++;
  }
  if (pass.length > 50) {
    showAlert('password is too long.');
    alertContainer++;
  }

  // Validate if password contain at least one number
  if (pass.search(/\d/) == -1) {
    showAlert('password must contain at least one number.');
    alertContainer++;
  }

  // Validate is email is valid
  if(!isValidEmail(username)) {
    showAlert('username(email) must be valid.');
    alertContainer++;
  }

  // Validate if password contain at least one character
  if (pass.search(/[a-zA-Z]/) == -1) {
    showAlert('password must contain at least one character.');
    alertContainer++;
  }
  
  // password may contain special characters like !@#$%^&*()_+
  if (pass.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+]/) != -1) {
    showAlert('password cannot contain special characters other than !@#$%^&*()_+');
    alertContainer++;
  }

  // Fail if any alerts
  if (alertContainer > 0) return false;
  return true;
}

/** function checks if email is valid */
function isValidEmail(mail) {
  // valid format of an email
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  // if email matches the valid format, return true
  if (mail.match(mailformat)) {
    return (true)
  }
  // else return false
  return (false)
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
