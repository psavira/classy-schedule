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
        roomOption.value = 'Room '+room.room_num;
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

        var currentClassValue = `${classSelection[i].dept_id}-${classSelection[i].class_num}`;

        // adds id to each row
        row.id = 'R'+currentClassValue;
        
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
        row.innerHTML += 
          `<input
            class="section"
            type="number"
            name="section"
            id=SR${currentClassValue}
            placeholder="1"
            value = "1"
            pattern="\d*"
            min="0"
            max="99"
            maxlength="2"
            onkeyup="if(this.value<0){this.value= this.value * -1}"
            oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"
            onchange=checkSectionCount(${classSelection[i].dept_id},${classSelection[i].class_num});
            step="1"
            />`;
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

function saveTable(prev) {
  // test to make sure button is working when being clicked
  console.log('button clicked');
  // array to save dropdown values into
  const data = [prev];

  // loop through all dropdown menus (hard coded since we know exact # of them)
  for (let i = 0; i < 36; i += 1) {
    // temp string to access each menu
    let tempstr = 'classSelection';
    let temptimestr;
    let finalstr = '{ ';
    // classSelection + 0 = classSelection0
    tempstr += i;
    // get the dropdown
    const dropdownMenu = document.querySelector(`#${tempstr}`);
    
    // get dropdown value
    let dropdownValue = dropdownMenu.options[dropdownMenu.selectedIndex].text;


    let schedule = getSchedule();
    let scheduleJSON = JSON.stringify(schedule);

    /*let day = dropdownMenu.parentNode.dataset.day;
    let time = dropdownMenu.parentNode.parentNode.dataset.time;

    // if no class is selected just put 'none'
    if (dropdownValue === 'Choose Class') {
      temptimestr = '';
      dropdownValue = '';
    }


    finalstr += '"day": ' + day + ', "time": ' + time + ', "class": ' + dropdownValue + ' }';
    finalstr += '\n';*/
    // push its value to data[]
    data.push(scheduleJSON);
  }

  data.join(' ');
  // make a blob from data[], set file to plaintext
  const textToBLOB = new Blob(data, { type: 'text/plain' });
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

/**
 * Gets the schedule as an object
 * @returns The current schedule as an object
 */
function getSchedule() {
  let schedule = {}

  // Iterate through selects in schedule
  let selects = document.querySelectorAll("table select.classSelection");
  selects.forEach((select) => {
    // Get the select value
    let selectedClass = select.value;
    // Find the time block and the day
    let day = select.parentNode.dataset.day;
    let time = select.parentNode.parentNode.dataset.time;

    // Check that the appropriate day exists. If not, create one
    if(schedule[day] === undefined) {
      schedule[day] = {};
    }
    schedule[day][time] = selectedClass;
  });

  return schedule;
}

/**
 * Sets the visual schedule to the values saved in the given schedule parameter
 * @param schedule The schedule object to put into the table
 */
function setSchedule(schedule) {
  // Iterate through selects in schedule
  let selects = document.querySelectorAll("table select.classSelection");
  selects.forEach((select) => {
    // Find the time block and the day
    let day = select.parentNode.dataset.day;
    let time = select.parentNode.parentNode.dataset.time;

    // Check that the appropriate day exists. If not, create one
    if(schedule[day] === undefined) {
      throw new Error(`Couldn't find day [${day}] in parameter schedule`);
    }

    if(schedule[day][time] === undefined) {
      throw new Error(`Couldn't find time [${time}] for day [${day}] in parameter schedule`);
    }
    select.value = schedule[day][time];
  });
}

// Fires when an option is selected from drop down on schedule page
function onSelectSchedule(num){
  value = document.getElementById(`classSelection${num}`).value;

  if(num<=23){
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
  let wedValue = document.getElementById(`classSelection${num+1}`).value;
  let friValue = document.getElementById(`classSelection${num+2}`).value;

  if(monValue != 'Choose Class'){
    if(wedValue == 'Choose Class'){
      document.getElementById(`classSelection${num+1}`).value = monValue;
    }
    if(friValue == 'Choose Class'){
      document.getElementById(`classSelection${num+2}`).value = monValue;
    }
  }
}

/* Auto-fills Thurs when Tues is selected
   DOES NOT FILL IF CLASS HAS ALREADY BEEN SELECTED FOR THURS */
function autoFillTuesThurs(num) {
  var tuesValue = document.getElementById(`classSelection${num}`).value;
  var thursValue = document.getElementById(`classSelection${num+1}`).value;

  if(tuesValue != 'Choose Class'){
    if (thursValue == 'Choose Class'){
      document.getElementById(`classSelection${num+1}`).value = tuesValue;
    }
  }
}

/* Will update table when class section is scheduled :
   When Sections=0, that class will be made unavailable to schedule */
function updateTable(num){
  var currentClassValue = document.getElementById(`classSelection${num}`).value;
  var sectionID = 'SR'+currentClassValue;
  document.getElementById(sectionID).value = parseInt(document.getElementById(sectionID).value,10)-1;

  if(document.getElementById(sectionID).value <= 0){
    document.getElementById(sectionID).value = 0;
    document.getElementById('R'+currentClassValue).style.background = 'red';
    document.getElementById('SR'+currentClassValue).style.color = 'red';
    removeClass(currentClassValue);
  }
}

// Will remove room from dropdown
function removeClass(currentClassValue){
  for (let i=0; i<36; i++){
    if(document.querySelector(`#classSelection${i} option[value=`+"'"+currentClassValue+"'"+']') != null && document.getElementById(`classSelection${i}`).value != currentClassValue){
      document.querySelector(`#classSelection${i} option[value=`+"'"+currentClassValue+"'"+']').remove();
    }
  }
}

// Saves current schedule for room when new room is selected;
// Removes class from dropdown if necessary
function resetRoom(){
  for (let i=0; i<36; i++){
    var currentClassValue = document.getElementById(`classSelection${i}`).value;
  
    if(document.getElementById('SR'+currentClassValue) != null && document.getElementById('S'+currentClassValue).value == 0){
      removeClass(currentClassValue);
    }
  
    document.getElementById(`classSelection${i}`).value = 'Choose Class';
  }
}

//changes background color to green-ish or red depending on section count
function checkSectionCount(deptID,classNum){
  var currentClassValue = deptID+"-"+classNum;  
  console.log(currentClassValue);
  if(document.getElementById('SR'+currentClassValue).value > 0){
    document.getElementById('R'+currentClassValue).style.background = '#AAC705';
    document.getElementById('SR'+currentClassValue).style.color = 'black';
  }else{
    document.getElementById('SR'+currentClassValue).value = 0;
    document.getElementById('R'+currentClassValue).style.background = 'red';
    document.getElementById('SR'+currentClassValue).style.color = 'red';
  }
}