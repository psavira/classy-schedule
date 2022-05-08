/* eslint-disable no-undef */
/* javascript for login page */
// get login form
const loginForm = document.getElementById('login-form');
// get login button
const loginButton = document.getElementById('login-form-submit');
// get error messages
const loginErrorMsg = document.getElementById('login-error-msg');

// on clicking of login button
loginButton.addEventListener('click', (e) => {
  // avoid default answers to username nad password
  e.preventDefault();
  // get the entered username
  const username = loginForm.username.value;
  // get the entered password
  const password = loginForm.password.value;

  // setup request
  const body = {
    user: username,
    pass: password
  }

  // try to log in
  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  .then(async (response) => {
    if(response.ok) {
      // Login was successful
      // Send user info to localstorage
      window.localStorage.setItem("user", username)
      window.localStorage.setItem("pass", password)
      const json = await response.json()
      window.localStorage.setItem("user_id", json.user_id)
      window.location.href = "/"
    } else {
      // otherwise show an error message
      loginErrorMsg.style.opacity = 1;
    }
  })
});
