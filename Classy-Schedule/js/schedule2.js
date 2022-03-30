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

/** Gets classes from the database and populates page elements with available class options */
async function fetchClasses() {
  // gets class of classes
  const classSelect = document.getElementsByClassName('classSelection');
  // fetch the courses
  fetch('/api/courses')
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
        // create an element for options
        const classOption = document.createElement('option');
        // set the options to department id 1 for cisc otherwise stat
        classOption.value = classes.dept_id + '-' + classes.class_num;
        if (classes.dept_id === 1) {
          classOption.text = `CISC ${classes.class_num}`;
        } else {
          classOption.text = `STAT ${classes.class_num}`;
        }
        // loop through the classes and append them to get all class options
        for (let i = 0; i < classSelect.length; i += 1) {
          classSelect[i].appendChild(classOption.cloneNode(true));
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
  fetch('/api/room')
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
        roomOption.text = `ROOM ${room.room_num}`;
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
function makeTable() {
  // get the courses
  fetch('/api/courses')
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
      // print makeTable
      console.log('makeTable()');
      // loop through the classes
      for (let i = 0; i < classSelection.length; i += 1) {
        // make a row for each class
        const row = document.createElement('tr');
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
        row.innerHTML += `<td> ${classSelection[i].credits}</td>`;
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

/** Sets the table to an empty configuration */
function clearTable() {
  // get the table
  const tableSelects = document.querySelectorAll('#table select');
  // for each row in table - clear it
  tableSelects.forEach((tableSelect) => {
    tableSelect.value = '';
  });
}

function saveTable() {
  // test to make sure button is working when being clicked
  console.log('button clicked');
  // array to save dropdown values into
  const data = [];

  // loop through all dropdown menus (hard coded since we know exact # of them)
  for (let i = 0; i < 36; i += 1) {
    // temp string to access each menu
    let tempstr = 'classSelection';
    // classSelection + 0 = classSelection0
    tempstr += i;
    // get the dropdown
    const dropdownMenu = document.getElementById(tempstr);
    // push its value to data[]
    data.push(dropdownMenu.options[dropdownMenu.selectedIndex].text);
  }
  // make a blob from data[], set file to plaintext
  const textToBLOB = new Blob([data], { type: 'text/plain' });
  // The file to save the data.
  const sFileName = 'formData.txt';
  // make invisible download link
  const newLink = document.createElement('a');
  // set links download to our file
  newLink.download = sFileName;
  if (window.webkitURL != null) {
    newLink.href = window.webkitURL.createObjectURL(textToBLOB);
  } else {
    newLink.href = window.URL.createObjectURL(textToBLOB);
    newLink.style.display = 'none';
    document.body.appendChild(newLink);
  }

  // call the link download
  newLink.click();
}

// Auto-fills Weds and Fri slots when Monday is selected
function autoFill(num) {
  if(document.getElementById(`classSelection${num}`).value != 'Choose Class'){
    document.getElementById(`classSelection${num+1}`).value = document.getElementById(`classSelection${num}`).value;
    document.getElementById(`classSelection${num+2}`).value = document.getElementById(`classSelection${num}`).value;
  }
}

// Auto-fills Thurs when Tues is selected
function autoFillTuesThurs(num) {
  if(document.getElementById(`classSelection${num}`).value != 'Choose Class'){
    document.getElementById(`classSelection${num+1}`).value = document.getElementById(`classSelection${num}`).value;
  }
}