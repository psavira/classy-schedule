/** Gets classes from the database and populates page elements with available class options */
async function fetchClasses() {
  // gets class of classes
  const classSelect = document.getElementsByClassName('classSelection');
  // fetch the courses
  dbToken.then(token => {
    return fetch('https://capstonedbapi.azurewebsites.net/class-management/classes',
    {
      headers: {
        'Authorization': token
      }
    })
  })
  // if it works correctly
    .then(async (response) => {
      if (response.ok) {
        return response.json();
      }
      // throw an error if response is not okay
      const errorText = await response.text();
      throw new Error(errorText);
    })
    // loop through the classes
    .then((classSelection) => {
      classSelection.forEach((classes) => {
        for(let i = 0; i < classes['num_sections']; i++) {
          // create an element for options
          const classOption = document.createElement('option');

          // Store class id and section number in value
          classOption.value = classes.class_id + ':' + i;

          // set the options to department id 1 for cisc otherwise stat
          if (classes.dept_id === 1) {
            classOption.text = `CISC ${classes.class_num}-${i+1}`;
          } else {
            classOption.text = `STAT ${classes.class_num}-${i+1}`;
          }
          // loop through the classes and append them to get all class options
          for (let j = 0; j < classSelect.length; j += 1) {
            classSelect[j].appendChild(classOption.cloneNode(true));
          }

        }
      });
    })
    // showing errors
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });
}

/** Gets room information from the database and populates page room options */
async function fetchRooms() {
  // create an element to hold rooms
  const roomSelect = document.getElementById('roomSelect');
  // fetch rooms
  dbToken.then((token) => {
    return fetch('https://capstonedbapi.azurewebsites.net/room-management/rooms', 
      {
        headers: {'Authorization': token}
      })
    })
    // check for errors if okay
    .then(async (response) => {
      // if the response is good
      if (response.ok) {
        return response.json();
      }
      // if error - throw it
      const errorText = await response.text();
      throw new Error(errorText);
    })
    // go through the rooms
    .then((roomSelection) => {
      // loop through the rooms
      roomSelection.forEach((room) => {
        // create an element to hold room options
        const roomOption = document.createElement('option');
        // set value to room id
        roomOption.value = room.room_id;
        // roomOption hold room number
        roomOption.text = `Room ${room.room_num}`;
        // append child to get all room options
        roomSelect.appendChild(roomOption);
      });
    })
    // show errors or success
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });
}

/* funtion that makes a table holding all the classes entered. This will allow user
to see what has been entered and what options they have for schedule */
function makeInfoTable() {
  // get the courses
  dbToken.then(token => {
    return fetch('https://capstonedbapi.azurewebsites.net/class-management/classes',
    {
      headers: {
        'Authorization': token
      }
    })
  })
    // if response is good, move on
    .then(async (response) => {
      if (response.ok) {
        return response.json();
      }
      // otherwise throw some errors
      const errorText = await response.text();
      throw new Error(errorText);
    })
    .then((classSelection) => {
      // get the table from id
      const table = document.getElementById('classtable');
      
      // loop through the classes
      for (let i = 0; i < classSelection.length; i += 1) {
        // make a row for each class
        const row = document.createElement('tr');

        var currentClassValue = `${classSelection[i].dept_id}-${classSelection[i].class_num}`;

        // adds id to each row
        row.id = 'R' + currentClassValue;
        
        // if dept_id for class is 1 = cisc
        // these will be the  data in each row
        if (classSelection[i].dept_id === 1) {
          row.innerHTML += '<td>CISC</td>';
        // else its STAT
        } else {
          row.innerHTML += '<td>STAT</td>';
        }
        // in each row along with dept we add class number
        // classname, capacity, and credits

        row.innerHTML += `<td> ${classSelection[i].class_num}</td>`;
        row.innerHTML += `<td> ${classSelection[i].class_name}</td>`;
        row.innerHTML += `<td> ${classSelection[i].capacity}</td>`;
        // add row to table
        table.appendChild(row);
      }
    })
    // show errors or success
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });
}

// Fires when an option is selected from drop down on schedule page
function onSelectSchedule(num){
  value = document.getElementById(`classSelection${num}`).value;

  if(num <= 23){
    autoFill(num);
  }else{
    autoFillTuesThurs(num);
  }
  updateTable(num);
}

/* Auto-fills Weds and Fri slots when Monday is selected :
   DOES NOT FILL IF CLASS HAS ALREADY BEEN SELECTED FOR WED/FRI */
function autoFill(num) {
  let monValue = document.getElementById(`classSelection${num}`).value;
  let wedValue = document.getElementById(`classSelection${num + 1}`).value;
  let friValue = document.getElementById(`classSelection${num + 2}`).value;

  if(monValue != ''){
    if(wedValue == ''){
      document.getElementById(`classSelection${num + 1}`).value = monValue;
      updateTable(num + 1)
    }
    if(friValue == ''){
      document.getElementById(`classSelection${num + 2}`).value = monValue;
      updateTable(num + 2)
    }
  }
}

/* Auto-fills Thurs when Tues is selected
   DOES NOT FILL IF CLASS HAS ALREADY BEEN SELECTED FOR THURS */
function autoFillTuesThurs(num) {
  var tuesValue = document.getElementById(`classSelection${num}`).value;
  var thursValue = document.getElementById(`classSelection${num + 1}`).value;

  if(tuesValue != ''){
    if (thursValue == ''){
      document.getElementById(`classSelection${num + 1}`).value = tuesValue;
      updateTable(num + 1)
    }
  }
}

/* Will update table when class section is scheduled :
   When Sections=0, that class will be made unavailable to schedule */
function updateTable(num){
  var currentClassElem = document.getElementById(`classSelection${num}`);
  var currentClassValue = currentClassElem.value;

  // If val is not none, 
  // set the only visible options to be those prof can teach
  let professorSelect = currentClassElem.parentNode.querySelector(".professor-select")
  
  if(currentClassValue != '') {

  }

}

function attachClassSelectEvents() {
  let classSelects = document.querySelectorAll('select.classSelection')
  let roomSelect = document.querySelector('#roomSelect')

  for(let classSelect of classSelects) {
    classSelect.addEventListener('change', (event) => {
      let day = classSelect.closest('td').dataset['day']
      let timecode = classSelect.closest('tr').dataset['timeCode']
      if(roomSelect.value != '') {
        saveRoom(roomSelect.value, getTable())
      }
    });
  }
}