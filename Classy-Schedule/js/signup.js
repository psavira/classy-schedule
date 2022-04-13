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
      pass: pass,
      reenter_pass: reenter_pass,
    };

    console.log(postData);
    console.log("object made!");

    //let data = JSON.stringify(postData);  
    //fs.writeFileSync('file.json', data, finished);

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

  // Fail if any alerts
  if (alertContainer > 0) return false;
  return true;
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
