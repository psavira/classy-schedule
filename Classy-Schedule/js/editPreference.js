 var pref = [];

 function testPrefUpdate(){
   var chkboxContainer = document.getElementsByName('checkbox');

   console.log(chkboxContainer);

   for (i=0 ; i < chkboxContainer.length ; i++){
    var chkbx = chkboxContainer[i];
    
    class_id = chkbx.value;
    
    pref.push({class_id: class_id, can_teach: chkbx.checked});
   }

   submitForm();
 }

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

function getProfID(){
  var profSelect=document.getElementById('profSelect');
  var profID = profSelect.value;
  sessionStorage.setItem('Prof',profID);
}


async function fetchCanTeach(profID) {
  // make classSelect by id
  //const classSelect = document.getElementById('testCan');
  // fetch courses from database
  dbToken.then((token) => {
return fetch('https://capstonedbapi.azurewebsites.net/preference-management/class-preferences/can-teach/'+profID, 
{
headers: {'Authorization': token}
})
})
  // if response okay return response
    .then(async (response) => {
      if (response.ok) {
        //console.log(response.json());
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
        const label = document.createElement('label');
        var br = document.createElement('br');
        //var alabel = document.getElementById('div1');
        //var last = alabel[alabel.length - 1];
        label.value = preference.class_id;
        label.htmlFor = "lbl"+preference.class_id;
        label.appendChild(Createcheckbox('test' + preference.class_id));
        label.appendChild(document.createTextNode('ClassID: ' + preference.class_id));
        label.appendChild(br);
        document.getElementById('div1').appendChild(label);
        //classSelect.appendChild(label);
      });
    })
     //catch errors and show message
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

function Createcheckbox(chkboxid) {
  var checkbox = document.createElement('input');
  checkbox.type = "checkbox";
  checkbox.name = "checkbox";
  checkbox.value = chkboxid;

  dbToken.then((token) => {
    return fetch('https://capstonedbapi.azurewebsites.net/preference-management/class-preferences/can-teach/'+sessionStorage.getItem('Prof'), 
    {
    headers: {'Authorization': token}
    })
    })
      // if response okay return response
        .then(async (response) => {
          if (response.ok) {
            //console.log(response.json());
            return response.json();
            
          }
          // otherwise error
          const errorText = await response.text();
          throw new Error(errorText);
        })
        // loop through courses
        .then((testpreferences) => {
          testpreferences.forEach((preference) => {
            if(preference.class_id==chkboxid && preference.can_teach==true){
              checkbox.checked = true;
            }
          });
        })
         //catch errors and show message
        .catch((error) => {
          clearAlerts();
          showAlert(error.message);
        });

  checkbox.onclick = function(){
   this.onclick = null;
   var label = this.parentNode;
   label.checked;
   label.value = chkboxid;
   checkbox.value = chkboxid;
  };
  return checkbox;
}

async function fetchClasses() {
  // make classSelect by id
  //const classSelect = document.getElementById('testclasses');
  // fetch courses from database
  dbToken.then(token => {
    return fetch(
      'https://capstonedbapi.azurewebsites.net/class-management/classes',
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
        const label = document.createElement('label');
        var br = document.createElement('br');
        //var alabel = document.getElementById('div2');
        //var last = alabel[alabel.length - 1];
        label.htmlFor = "lbl"+classes.class_id;
        label.appendChild(Createcheckbox(classes.class_id));
        label.appendChild(document.createTextNode('ClassID: ' + classes.class_id));
        label.appendChild(br);
        document.getElementById('div2').appendChild(label);
      });
    })
    
    // catch errors and show message
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });

}

async function submitForm() {
  clearAlerts();

  if(isValidForm(1, true)){
    const postData = pref;
    console.log(postData);
    dbToken.then((token) => {
      return fetch('https://capstonedbapi.azurewebsites.net/preference-management/class-preferences/can-teach/save/'+sessionStorage.getItem('Prof'), {
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

        //teach_form.label.value = '';
      } else {
        clearAlerts();
        const text = await response.text();
        showAlert(text);
      }
    })
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });
    showAlert('Sending request...');
  }
}

/* function to check if prof entry is valid */
// eslint-disable-next-line camelcase
function isValidForm(class_id, can_teach ) {
  // counter for alerts
  let alertContainer = 0;

  // Fail if any alerts
  if (alertContainer > 0) return false;
  return true;
}

//disables button
function disableButton(button){
  document.getElementById(button).disabled = true;
}