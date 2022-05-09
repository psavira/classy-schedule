/** function to fetch profs from database */
// eslint-disable-next-line no-unused-vars
async function fetchProfessors() {
  // get prof select by id
  const profSelect = document.getElementById('profSelect');
  // fetch prof from db
  dbToken.then((token) => {
  return fetch('https://capstonedbapi.azurewebsites.net/professor-management/professors', 
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
    .then((profSelection) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const professor of profSelection) {
        // create a option for every prof
        const profOption = document.createElement('option');
        // set value to prof id
        profOption.value = professor.professor_id;
        // set text to last name
        profOption.text = `Professor ${professor.last_name} ${professor.professor_id}`;
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
/*
function getProfID(){
  var select = document.getElementById('profSelect');
  var value  = select.options[select.selectedIndex].value;

  return value;
}


async function fetchCanTeach() {
  // make classSelect by id
  const classSelect = document.getElementById('testCan');
  // fetch courses from database
  dbToken.then((token) => {
return fetch('https://capstonedbapi.azurewebsites.net/preference-management/class-preferences/can-teach/1'+getProfID(), 
{
headers: {'Authorization': token}
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

}*/
