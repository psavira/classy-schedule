/* Returns the department name based on deptID */
function loadDepartment(deptID) {
  return dbToken.then((token) => {
    return fetch(
      'https://capstonedbapi.azurewebsites.net/department-management/departments/' + deptID,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      }
    )
  })
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Department request failed.");
    }
  })
  .then((json) => {
    return json[0].dept_name;
  })
  .catch((error) => {
    console.log(error.message);
  })
}

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

          classOption.id = classes.class_id + ':' + i;

          // loads department from database
          loadDepartment(classes.dept_id).then(dept => {
            classOption.text = dept + ' ' + classes.class_num + '-' + (i+1);
          }).then(( dummy ) => {
            // loop through the classes and append them to get all class options if it doesn't exist already
            for (let j = 0; j < classSelect.length; j += 1) {
                classSelect[j].appendChild(classOption.cloneNode(true));
            }
          })
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

        var style = "";

        if(classSelection[i].num_sections < 1){
          style = "background:red;"
        }

        // in each row along with dept we add class number
        // classname, capacity, and credits

        row.innerHTML += `<td> ${classSelection[i].class_num}</td>`;
        row.innerHTML += `<td> ${classSelection[i].class_name}</td>`;
        row.innerHTML += `<td> ${classSelection[i].capacity}</td>`;
        row.innerHTML += `<td>
                            <input type="number" name="sections" id="section${classSelection[i].class_num}" style="${style}" 
                              value="${classSelection[i].num_sections}"
                              min = 0
                              max = 25 
                              onchange="updateInfo(${classSelection[i].class_id},
                                                  ${classSelection[i].class_num},
                                                  ${classSelection[i].dept_id},
                                                  '${classSelection[i].class_name}',
                                                  ${classSelection[i].capacity},
                                                  ${classSelection[i].credits},
                                                  ${classSelection[i].is_lab},
                                                  document.getElementById('section${classSelection[i].class_num}').value);">
                            </input>
                          </td>`;
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

// Updates section info in database
function updateInfo(classID, classNum, deptID, className, cap, cred, isLab, sections){

  // creates object
  var putData = {
    class_num: classNum,
    dept_id: deptID,
    class_name: className,
    capacity: cap,
    credits: cred,
    is_lab: isLab,
    num_sections: parseInt(sections)
  }

  // PUTs to database
  dbToken.then(token => {
    console.log(putData);
    fetch('https://capstonedbapi.azurewebsites.net/class-management/classes/update/' + classID,
    {
      method: 'PUT',
      body: JSON.stringify(putData),
      headers: { 'Content-Type': 'application/json','Authorization': token },
    })
  })

  if(sections > 0){
    document.getElementById('section'+classNum).style = "background: white;";
  }

  // Refresh table
  refreshTable();

  // Refresh classes
  refreshClasses();

}

function refreshTable(){
  for ( section of document.getElementsByName('sections') ){
    if ( section.value < 1 ){
      section.style = "background: red;"
    } else {
      section.style = "background: white;"
    }
  }
}

function refreshClasses(){
  // NOT SURE HOW TO DO THIS
}

// Fires when an option is selected from drop down on schedule page
function onSelectSchedule(num){
  value = document.getElementById(`classSelection${num}`).value;
  if(keyTracker["shiftDown"]) {
    if(num <= 23){
      autoFill(num);
    }else{
      autoFillTuesThurs(num);
    }
  }
}

/* Auto-fills Weds and Fri slots when Monday is selected :
   DOES NOT FILL IF CLASS HAS ALREADY BEEN SELECTED FOR WED/FRI */
function autoFill(num) {
  let monValue = document.getElementById(`classSelection${num}`).value;

  let wedElem = document.getElementById(`classSelection${num + 1}`)
  let friElem = document.getElementById(`classSelection${num + 2}`)

  wedElem.value = monValue;
  wedElem.dispatchEvent(new Event('change'))

  friElem.value = monValue;
  friElem.dispatchEvent(new Event('change'))
    
}

/* Auto-fills Thurs when Tues is selected
   DOES NOT FILL IF CLASS HAS ALREADY BEEN SELECTED FOR THURS */
function autoFillTuesThurs(num) {
  var tuesValue = document.getElementById(`classSelection${num}`).value;

  let thursElem = document.getElementById(`classSelection${num + 1}`)
  thursElem.value = tuesValue;
  thursElem.dispatchEvent(new Event('change'))

}

function attachClassSelectEvents() {
  // Get the necessary elements
  let classSelects = document.querySelectorAll('select.classSelection')
  let roomSelect = document.querySelector('#roomSelect')

  // Attach a change event listener to each class select element
  for(let classSelect of classSelects) {
    classSelect.addEventListener('change', (event) => {

      console.log("Change Event Fired")

      // Get the local professor dropdown
      let profSelect = event.target.parentNode.querySelector('.professorSelect')
      // profSelect.value = ''

      if(classSelect.value == '') {
        // If the selected class value is blank, clear the professor select
        profSelect.classList.add('hidden')
        profSelect.value = ''
      } else {
        // Ensure the professor select isn't hidden
        profSelect.classList.remove('hidden')
        
        // Disable and hide professor options that can't teach the new course
        $(profSelect).children().each((index, option) => {
          // Do nothing for the default option
          if(option.value == '') return

          // Reset the option's attributes
          option.disabled = true
          option.hidden = true

          // If the professor is not in the can teach map, disable it
          canTeachData
          .then((canTeachMap) => {
            if (!canTeachMap) return
            let class_id = parseInt(classSelect.value.split(':')[0])
            canTeachArray = canTeachMap[class_id]
            if(canTeachArray) {
              if(canTeachArray.indexOf(parseInt(option.value)) != -1) {
                option.disabled = false
                option.hidden = false
              }
            }
          })
        })

        // If the selected professor is not a viable option, reset to default
        if(classSelect.options[classSelect.selectedIndex].disabled) {
          profSelect.value = ''
        }
      }

      // Save the room
      if(roomSelect.value != '') {
        saveRoom(roomSelect.value, getTable())
      }
    });
  }
}