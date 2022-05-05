/* function to get classes from database */
async function fetchClasses() {

    var fs = require('fs');

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
            const classSelect = {
                //doesn't exist yet
                "id": classes.class_id,

                "name": classes.class_name,
                
                //doesn't exist yet
                "sections": classes.sections,
            }
            console.log(classes.sections);

            var classString = JSON.stringify(classSelect);
            fs.writeFile("classes.json",classString);

        });
      })
      // catch errors and show message
      .catch((error) => {
        clearAlerts();
        showAlert(error.message);
      });
  
  }

  /** function to fetch profs from database */
// eslint-disable-next-line no-unused-vars

async function fetchProfessors() {
    
    var fs = require('fs');

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
          const profSelect = {
              "id": professor.professor_id,
              "name": professor.last_name + ', ' + professor.first_name,
              "classes": getProfClasses(profSelection.professor_id)
          }

          var profString = JSON.stringify(profSelect);
          fs.writeFile("professors.json",profString);
        }
      })
      // catch errors and show messages
      .catch((error) => {
        clearAlerts();
        showAlert(error.message);
      });
  }

  function getProfClasses(profID){
      var classes = [];

      dbToken.then((token) => {
        return fetch('https://capstonedbapi.azurewebsites.net//preference-management/class-preferences/can-teach/'+profID, 
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
          // loop through the classes
          .then((classSelection) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const possibleClass of classSelection) {
                //CLASS_ID NOT IMPLEMENTED YET IN DB
                classes.push(possibleClass.class_id);
            }

            return classes;
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