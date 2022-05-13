 var pref = [];    // holds canTeach preferences to send to database
 var prefer = [];  // holds preferTeach preferences to send to database

 /** function to fetch all professors in database**/
 function getProf(){
   //authorize
  dbToken.then((token) => {
    //fetching professors based on prof id chosen
    return fetch('https://capstonedbapi.azurewebsites.net//professor-management/professors/' 
    + sessionStorage.getItem('Prof'), 
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
    //display in dropdown by last name
    .then((prof) => {
      var profName = "Professor " + prof[0].last_name +
                      "\n" + document.title;
      var text = document.createElement('h1');

      text.innerHTML = profName;

      document.getElementById('div1').appendChild(text);
  
    })
 }

 /**updating checkboxes on submit for canTeach**/
 function testPrefUpdate(){
   //get the checkboxes
   var chkboxContainer = document.getElementsByName('checkbox');
   //loop through them
   for (chkbx of chkboxContainer){
    //get classID and push info to array of objects to send to db
    class_id = chkbx.value;
    pref.push({class_id: class_id, can_teach: chkbx.checked});
   }
   //call submit form to send to db
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
    // catch errors and show message
    .catch((error) => {
      clearAlerts();
      errorMessage = error.message;
      if(error.status='404'){
        errorMessage = 'No Preferences Saved For Professor';
      }
      showAlert(errorMessage);
    });
} 

/** function to get the id of a professor selected */
function getProfID(){
  var profSelect=document.getElementById('profSelect');
  var profID = profSelect.value;
  sessionStorage.setItem('Prof',profID);
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

/** function to create checkboxes dynamically */
function Createcheckbox(chkboxid) {
  //create checkbox and give it name and value
  var checkbox = document.createElement('input');
  checkbox.type = "checkbox";
  checkbox.name = "checkbox";
  checkbox.value = chkboxid;

  //fetch can teach based on chosen professor id
  dbToken.then((token) => {
    return fetch('https://capstonedbapi.azurewebsites.net/preference-management/class-preferences/can-teach/' 
    + sessionStorage.getItem('Prof'), 
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
            //make checkboxes clicked if prof can teach it already
            if(preference.class_id == chkboxid && preference.can_teach == true){
              checkbox.checked = true;
            }
          });
        })
         // catch errors and show message
        .catch((error) => {
          clearAlerts();
          errorMessage = error.message;
          if(error.status='404'){
            errorMessage = 'No Preferences Saved For Professor';
          }
          showAlert(errorMessage);
        });
  
  //update checkboxes
  checkbox.onclick = function(){
   this.onclick = null;
   var label = this.parentNode;
   label.checked;
   label.value = chkboxid;
   checkbox.value = chkboxid;
  };
  return checkbox;
}

/** fetching classes prof can teach and making checkboxes */
async function fetchClassesCanTeach() {
  //fetch all classes
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
    })
    // loop through courses
    .then((testclasses) => {
      testclasses.forEach((classes) => {
        // create element for each course
        const label = document.createElement('label');
        var br = document.createElement('br');
        //this makes checkbox for each class
        label.htmlFor = "lbl" + classes.class_id;
        label.appendChild(Createcheckbox(classes.class_id));
        label.appendChild(document.createTextNode(classes.class_name));
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

/** submit form for can teach classes */
async function submitForm() {
  clearAlerts();
  //if the form is valid
  if(isValidForm(1, true)){
    const postData = pref;
    //save updated professor can teach info
    dbToken.then((token) => {
      return fetch('https://capstonedbapi.azurewebsites.net/preference-management/class-preferences/can-teach/save/'
       + sessionStorage.getItem('Prof'), {
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

////////PREFER TO TEACH////////////////////////////////////////////////////////
//holds preferTeach info to send to bd
var preference = [];

/**fetch classes and create checkbox for all */
async function fetchClassesPreferTeach() {
    //fetch all classes
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
          //make a checkbox for each course
          label.htmlFor = "lbl" + classes.class_id;
          label.appendChild(CreatecheckboxPrefer(classes.class_id));
          label.appendChild(document.createTextNode(classes.class_name));
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
      /** checkbox function for preferTeach */
      function CreatecheckboxPrefer(chkboxid) {
        //create checkbox and give it name and value
        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = "check";
        checkbox.value = chkboxid;
        //fetch classes prof prefer to teach by id
        dbToken.then((token) => {
          return fetch('https://capstonedbapi.azurewebsites.net/'
          +'preference-management/class-preferences/prefer-to-teach/'
           + sessionStorage.getItem('Prof'), 
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
                  //if prof already prefers to teach that class - make it clicked
                  if(preference.class_id == chkboxid && preference.prefer_to_teach == true){
                    checkbox.checked = true;
                  }
                });
              })
               // catch errors and show message
              .catch((error) => {
                clearAlerts();
                errorMessage = error.message;
                if(error.status='404'){
                  errorMessage = 'No Preferences Saved For Professor';
                }
                showAlert(errorMessage);
              });
        //updates checkboxes
        checkbox.onclick = function(){
         this.onclick = null;
         var label = this.parentNode;
         label.checked;
         label.value = chkboxid;
         checkbox.value = chkboxid;
        };
        return checkbox;
      }
  
      /** submit for for preferTeach */
      async function submitFormPrefer() {
        clearAlerts();
        //if form is valid
        if(isValidForm(1, true)){
          const postData = preference;
          dbToken.then((token) => {
            //save arrray of objects to db
            return fetch('https://capstonedbapi.azurewebsites.net/'+
            'preference-management/class-preferences/prefer-to-teach/save/' 
            + sessionStorage.getItem('Prof'), {
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
  
      /** get updated checkbox info on submit */
      function testPrefUpdatePrefer(){
        // get all checkboxes
        var chkboxContainer = document.getElementsByName('check');
        //loop through them
        for (i = 0 ; i < chkboxContainer.length ; i ++){
          //get value and add to array
         var chkbx = chkboxContainer[i];
         class_id = chkbx.value;
         preference.push({class_id: class_id, prefer_to_teach: chkbx.checked});
        }
        // call function to submit form
        submitFormPrefer();
      }
    
////////////////Time OF Day////////////////////////////

/** get all time of day preferences */
async function fetchTimeOfDay() {
  dbToken.then(token => {
    return fetch(
      //get all time of day preferences by prof id
      'https://capstonedbapi.azurewebsites.net/'+
      'preference-management/time-of-day-preferences/' + sessionStorage.getItem('Prof'), {
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
    // go through preferences
    .then((day) =>{
      //if mor, aft, or eve are already true - make checkbox clicked
      if(day.prefer_morning == true){
        document.getElementById('mor').checked = true;
      }
      if(day.prefer_afternoon == true){
        document.getElementById('aft').checked = true;
      }
      if(day.prefer_evening == true){
        document.getElementById('eve').checked = true;
      }
    })
    // catch errors and show message
  .catch((error) => {
    clearAlerts();
    errorMessage = error.message;
    if(error.status='404'){
      errorMessage = 'No Preferences Saved For Professor';
    }
    showAlert(errorMessage);
  });
  }

  /** submit form for time of day */
  async function submitFormToD(preference) {
    clearAlerts();
    //if form is valid
    if(isValidForm(1, true)){
      const postData = preference;
      dbToken.then((token) => {
        //save array of objects to db
        return fetch('https://capstonedbapi.azurewebsites.net/' +
        'preference-management/time-of-day-preferences/save/' + sessionStorage.getItem('Prof'), {
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

  // Builds preference object
function testTimeOfDayUpdate(){
  //get all checkboxes for time of day
  var chkboxContainer = document.getElementsByName('checkbox');
  //see if they are checked or not
  var mor   = document.getElementById('mor').checked;
  var aft   = document.getElementById('aft').checked;
  var eve   = document.getElementById('eve').checked;

  //create object to store
  preference = {
    prefer_morning: mor, 
    prefer_afternoon: aft,
    prefer_evening: eve
  }
  //call submit for time of day to send to db
  submitFormToD(preference);
}
  



////////// DAY OF WEEK ///////////////////

/** function to get day of week preferences */
async function fetchDayOfWeek() {
  // fetch preferences from database
  dbToken.then(token => {
    return fetch(
      // get dow preferences by prof id
      'https://capstonedbapi.azurewebsites.net/'+
      'preference-management/day-of-week-preferences/' + sessionStorage.getItem('Prof'), {
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
  // go through pref
  .then((day) => {
    //if mon, tue, wed, thurs, fri are already prefered by prod - make checkbox clicked
      if(day.prefer_monday == true){
        document.getElementById('mon').checked = true;
      }
      
      if(day.prefer_tuesday == true){
        document.getElementById('tues').checked = true;
      }  

      if(day.prefer_wednesday == true){
        document.getElementById('wed').checked = true;
      }  

      if(day.prefer_thursday == true){
        document.getElementById('thurs').checked = true;
      }  

      if(day.prefer_friday == true){
        document.getElementById('fri').checked = true;
      }  
  })
  // catch errors and show message
  .catch((error) => {
    clearAlerts();
    errorMessage = error.message;
    if(error.status='404'){
      errorMessage = 'No Preferences Saved For Professor';
    }
    showAlert(errorMessage);
  });
}

/** submit form for dow */
async function submitFormDoW(preference) {
  clearAlerts();
  // if form is valid
  if(isValidForm(1, true)){
    const postData = preference;
    dbToken.then((token) => {
      //save array of objects to db
      return fetch('https://capstonedbapi.azurewebsites.net/' +
      'preference-management/day-of-week-preferences/save/' + sessionStorage.getItem('Prof'), {
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

// Builds preference object
function testDayOfWeekUpdate(){
  //get all checkboxes
  var chkboxContainer = document.getElementsByName('checkbox');
  //see if true or false
  var mon   = document.getElementById('mon').checked;
  var tues  = document.getElementById('tues').checked;
  var wed   = document.getElementById('wed').checked;
  var thurs = document.getElementById('thurs').checked;
  var fri   = document.getElementById('fri').checked;
  //create object to store info
  preference = {
    prefer_monday: mon, 
    prefer_tuesday: tues,
    prefer_wednesday: wed,
    prefer_thursday: thurs,
    prefer_friday: fri
  }
  // call sumbit dow too send to db
  submitFormDoW(preference);
}


/////// TIME SLOT //////

//array to store timeslot pref data
var timeSlotPref = [];

/** creates checkboxes dynamically for timeslot */
function CreatecheckboxTimeSlot(chkboxid) {
  //create checkbox and give name and value
  var checkbox = document.createElement('input');
  checkbox.type = "checkbox";
  checkbox.name = "timeBox";
  checkbox.value = chkboxid;

  dbToken.then((token) => {
    //get all timeslot pref a prof can teach
    return fetch('https://capstonedbapi.azurewebsites.net/' + 
    'preference-management/time-slot-preferences/can-teach/' + sessionStorage.getItem('Prof'), 
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
        // loop through preferences
        .then((testpreferences) => {
          testpreferences.forEach((preference) => {
            //if prof already wants that time slot make checkbox clicked
            if(preference.time_slot_id == chkboxid && preference.can_teach == true){
              checkbox.checked = true;
            }
          });
        })
         // catch errors and show message
        .catch((error) => {
        clearAlerts();
        errorMessage = error.message;
        if(error.status='404'){
          errorMessage = 'No Preferences Saved For Professor';
        }
        showAlert(errorMessage);
      });
  // update checkboxes
  checkbox.onclick = function(){
   this.onclick = null;
   var label = this.parentNode;
   label.checked;
   label.value = chkboxid;
   checkbox.value = chkboxid;
  };
  return checkbox;
}

/** get timeslots on prof id */
async function fetchTimeSlots() {
  // fetch time slots from database
  dbToken.then(token => {
    return fetch(
        'https://capstonedbapi.azurewebsites.net/time_slot-management/time_slots',
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
    // loop through timeslots
    .then((timeSlots) => {
      for(time of timeSlots){
        // create element for each pref
        const label = document.createElement('label');
        var br = document.createElement('br');
        //display checkbox
        label.htmlFor = "lbl" + time.time_slot_id;
        label.appendChild(CreatecheckboxTimeSlot(time.time_slot_id));
        label.appendChild(document.createTextNode(time.start_time + ' - ' + time.end_time));
        label.appendChild(br);
        document.getElementById('div2').appendChild(label);
      }
    })
    
    // catch errors and show message
    .catch((error) => {
      clearAlerts();
      errorMessage = error.message;
      if(error.status='404'){
        errorMessage = 'No Preferences Saved For Professor';
      }
      showAlert(errorMessage);
    });

}

/** submit for time slot */
async function submitFormTimeSlot() {
  clearAlerts();
  //if valid
  if(isValidForm(1, true)){
    const postData = timeSlotPref;
    dbToken.then((token) => {
      // send array of object to db
      return fetch('https://capstonedbapi.azurewebsites.net/' + 
      'preference-management/time-slot-preferences/can-teach/save/' + sessionStorage.getItem('Prof'), {
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

// starter function to submit form: creates preference sent to db
function testTimeSlotUpdate(){
  //get all checkboxes for time slot
  var chkboxContainer = document.getElementsByName('timeBox');
  //loop through them
  for (chkbx of chkboxContainer){
    //save object to array
   id = chkbx.value;
   timeSlotPref.push({time_slot_id: parseInt(id), can_teach: chkbx.checked});
  }
  //call function to submit
  submitFormTimeSlot();
}