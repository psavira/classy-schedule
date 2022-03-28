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
  // if entered info matches correct usrname and passwrd
  if (username === 'user' && password === 'web_dev') {
    // go to the home page
    window.location.href = 'indexAfterlogin.html';
  } else {
    // otherwise show an error message
    loginErrorMsg.style.opacity = 1;
  }
});
