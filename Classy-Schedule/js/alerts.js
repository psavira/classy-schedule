/**
 * Displays an alert box to the user
 * @param alertText Text that appears in the alert box
 */
 function showAlert(alertText) {
    // get alert container to hold alerts
    const alertContainer = document.getElementById('alertContainer');
    // make alert container to hold alerts
    const alert = document.createElement('div');
    // add callouts and warnings to alert
    alert.classList.add('callout', 'warning');
    alert.innerText = alertText;
    // add alert to container
    alertContainer.appendChild(alert);
  }
  
  /** Clears all current alerts */
  function clearAlerts() {
    // get alert container to hold alerts
    const alertContainer = document.getElementById('alertContainer');
    // assing children of alert
    const children = [...alertContainer.children];
    // loop through alerts
    children.forEach((child) => {
      // print out alerts
      console.log(child);
      // remove alert that got printed
      alertContainer.removeChild(child);
    });
  }