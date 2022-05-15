/**
 * Displays an alert box to the user
 * @param alertText Text that appears in the alert box
 */
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

/** Clears all current alerts */
function clearAlerts() {
  // make a container to hold alerts
  const alertContainer = document.getElementById('alertContainer');
  // array of alerts
  const children = [...alertContainer.children];
  // eslint-disable-next-line no-restricted-syntax
  // loop through the alerts
  children.forEach((child) => {
    // remove the alerts
    alertContainer.removeChild(child);
  });
}