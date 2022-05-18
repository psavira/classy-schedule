// Covers general purpose and legacy functions for the page

/**
 * Returns the department name based on deptID 
 */
function loadDepartment(deptID) {
  return dbToken.then((token) => {
    return fetch(
      'https://capstonedbapi.azurewebsites.net/' + 
      'department-management/departments/' + deptID,
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

/** 
 * Gets classes from the database and populates page elements 
 * with available class options 
 * @returns A promise that resolves when classes populated
 */
async function fetchClasses() {
  // gets class of classes
  const classSelect = document.getElementsByClassName('classSelection');
  // fetch the courses
  return dbToken.then(token => {
    return fetch('https://capstonedbapi.azurewebsites.net' + 
    '/class-management/classes',
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
            if(classes.is_lab == true){
              classOption.text = dept + ' ' + classes.class_num + '-' + "LAB";
            } else{
            classOption.text = dept + ' ' + classes.class_num + '-' + (i+1);
            }
          }).then(async ( dummy ) => {
            // Avoid race condition by waiting for room data
            await roomPromise

            var roomSelect = document.getElementById('roomSelect');
            // loop through the classes and append them to get all 
            // class options if it doesn't exist already
            for (let j = 0; j < classSelect.length; j += 1) {;
                // check capacity
                let currentIndex = roomSelect.selectedIndex
                let roomOp = roomSelect.options
                let roomCapacity = roomOp[currentIndex].getAttribute("data-cap")
                if (classes.capacity <= roomCapacity){
                  classSelect[j].appendChild(classOption.cloneNode(true));
                }
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

/** 
 * Gets room information from the database and populates page room options 
 * @returns A promise that resolves when rooms are populated
 */
async function fetchRooms() {
  // create an element to hold rooms
  const roomSelect = document.getElementById('roomSelect');
  // fetch rooms
  return dbToken.then((token) => {
    return fetch('https://capstonedbapi.azurewebsites.net' + 
      '/room-management/rooms', 
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
        // hold capacity value
        roomOption.dataset.cap = room.capacity;
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

/** funtion that makes a table holding all the classes entered. This 
 * will allow user to see what has been entered and what options 
 * they have for schedule 
 */
function makeInfoTable() {
  // get the courses
  dbToken.then(token => {
    return fetch('https://capstonedbapi.azurewebsites.net' + 
    '/class-management/classes',
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
    .then(async (classSelection) => {
      // get the table from id
      const table = document.getElementById('classtable');
      
      // loop through the classes
      for (let i = 0; i < classSelection.length; i += 1) {
        // make a row for each class
        const row = document.createElement('tr');

        let deptId = classSelection[i].dept_id
        let classNum = classSelection[i].class_num

        var currentClassValue = `${deptId}-${classNum}`;

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

        var styleSections = "";
        var styleCap = "";

        // sets background to red if no sections
        if ( classSelection[i].num_sections < 1 ){
          styleSections = "background: red;"
        } else {
          styleSections = ""
        }

        var roomSelect = document.getElementById('roomSelect');

        // Wait for room to avoid race condition
        await roomPromise

        //sets cap to red if class is too large for room
        let selectedRoom = roomSelect.selectedIndex
        let roomOpt = roomSelect.options
        let roomCapacity = roomOpt[selectedRoom].getAttribute("data-cap")
        if ( classSelection[i].capacity > roomCapacity){
          styleCap = "background: red;"
          //removeClassFromRoom(classSelection[i]);
        } else {
          styleCap = "";
        }

        // in each row along with dept we add class number
        // classname, capacity, and credits

        row.innerHTML += `<td> ${classSelection[i].class_num}</td>`;
        row.innerHTML += `<td> ${classSelection[i].class_name}</td>`;
        row.innerHTML += `<td 
                            style="${styleCap}"
                            > ${classSelection[i].capacity}</td>`;
        row.innerHTML += `<td>
                            <input 
                              type="number" 
                              name="sections" 
                              id="section${classSelection[i].class_num}" 
                              style="${styleSections}" 
                              value="${classSelection[i].num_sections}"
                              min = 0
                              max = 25 
                              onchange="
                              updateInfo(${classSelection[i].class_id},
                                        ${classSelection[i].class_num},
                                        ${classSelection[i].dept_id},
                                        '${classSelection[i].class_name}',
                                        ${classSelection[i].capacity},
                                        ${classSelection[i].credits},
                                        ${classSelection[i].is_lab},
                                        document.getElementById('
                                          section${classSelection[i].class_num}
                                        ').value);">
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

/** Updates section info in database */
function updateInfo(classID, classNum, deptID, 
                    className, cap, cred, isLab, sections) {

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
  
  putData = JSON.stringify(putData);

  // PUTs to database
  dbToken.then(token => {
    console.log(putData);
    return fetch('https://capstonedbapi.azurewebsites.net' + 
    '/class-management/classes/update/' + classID,
    {
      method: 'PUT',
      body: putData,
      headers: { 'Content-Type': 'application/json','Authorization': token },
    })
  })
  .then(() => {
    window.location.reload();
  })
}

function setRoom(){
  document.getElementById('roomSelect').value = localStorage.getItem("roomID");
  refresh();
}

/** Refreshes the info table on a room change */
function refresh(){
  // get table of classes
  var Parent = document.getElementById('classtable');
  //wipes table
  while(Parent.hasChildNodes())
  {
   Parent.removeChild(Parent.firstChild);
  }

  // Re-builds title bar
  tr = document.createElement('tr');

  for (i = 0 ; i<5 ; i++){
    var th = document.createElement('th');
    
    if ( i == 0 ){
      th.innerHTML = "<span title='Department of the course'>DEPT";
    } else if( i == 1 ){
      th.innerHTML = "<span title='Class Number'>CLASS #";
    } else if( i == 2 ){
      th.innerHTML = "<span title='Class Name'>CLASS NAME";
    } else if( i == 3 ){
      th.innerHTML = "<span title='Class Capacity'>CAP";
    } else if( i == 4 ){
      th.innerHTML = "<span title='Number of Sections'>SECTIONS";
    }
    tr.appendChild(th);
    Parent.appendChild(tr);
  }

  // gets all dropdowns
  var Parent = document.getElementsByClassName('classSelection');

  //wipes dropdowns ; leaves base option of 'Choose Class'
  for ( select of Parent ){
    while( select.options.length > 1 ){
      select.remove( select.options.length-1 );
    }
  }

  // refreshes table
  makeInfoTable();
  // refreshes dropdowns
  fetchClasses();
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

/**
 * Attaches events to the class selects
 */
function attachClassSelectEvents() {
  // Get the necessary elements
  let classSelects = document.querySelectorAll('select.classSelection')
  let roomSelect = document.querySelector('#roomSelect')

  // Attach a change event listener to each class select element
  for(let classSelect of classSelects) {
    classSelect.addEventListener('change', (event) => {

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

/**
 * Attaches events to the professor selects
 */
function attachProfessorSelectEvents() {
  let roomSelect = document.querySelector('#roomSelect')
  let professorSelects = document.querySelectorAll('.professorSelect')

  for(let professorSelect of professorSelects) {

    // Attach the change event to each professor select
    professorSelect.addEventListener('change', (event) => {
      // Save the room
      if(roomSelect.value != '') {
        saveRoom(roomSelect.value, getTable())
      }
    })
  }
}

/**
 * Attaches events to all table controls
 */
function attachControlEvents() {
  // Load Plan (DB) Button
  let loadPlanButton = document.querySelector('#pullButton');
  loadPlanButton.addEventListener('click', (event) => {
    // Disable all controls
    disableStorageControls()
    disableTableControls()
    // Load the table
    loadFromDB().then(() => {
      // Once finished, re-enable controls
      enableStorageControls()
      enableTableControls()
    })
  })

  // Save Plan (DB) Button
  let savePlanButton = document.querySelector('#pushButton');
  savePlanButton.addEventListener('click', (event) => {
    // Disable all controls
    disableStorageControls()
    disableTableControls()
    // Save the table
    saveToDB().then(() => {
      // Once finished, re-enable controls
      enableStorageControls()
      enableTableControls()
    })
  })

  // Get Algo Plan
  let algoButton = document.querySelector('#algoButton');
  algoButton.addEventListener('click', (event) => {
    loadAlgoSchedule()
  })
}