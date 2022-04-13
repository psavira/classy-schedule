/* eslint-disable no-plusplus */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/** function to send entry to db */
// eslint-disable-next-line no-unused-vars
async function submitForm() {
  // Clear any alerts
  clearAlerts();

  roomForm.roomNum.classList.remove('error');
  roomForm.capacity.classList.remove('error');

  // create form to hold room entry
  // eslint-disable-next-line camelcase
  const room_form = document.forms.roomForm;
  // get room num
  // eslint-disable-next-line camelcase
  const room_num = room_form.roomNum.value;
  // get capacity
  // eslint-disable-next-line camelcase
  const capacity = room_form.capacity.value;

  // if the entry is valid
  if (isValidForm(room_num, capacity)) {
    // hold info in post data
    const postData = {
      room_num: room_num,
      // eslint-disable-next-line object-shorthand
      capacity: capacity,
    };
    // fetch the rooms from database
    dbToken.then((token) => {
      return fetch('https://capstonedbapi.azurewebsites.net/room-management/room/create', {
      // send to db
      method: 'POST',
      headers: { 'Content-Type': 'application/json','Authorization': token },
      body: JSON.stringify(postData),
    })
    })
    // if response is good
      .then(async (response) => {
        if (response.ok) {
          clearAlerts();
          showAlert('Success!');

          // Clear form
          // eslint-disable-next-line camelcase
          room_form.roomNum.value = '';
          // eslint-disable-next-line camelcase
          room_form.capacity.value = '';
        } else {
          // show alerts
          clearAlerts();
          const text = await response.text();
          showAlert(text);
        }
      })
    // catch errors and show messages
      .catch((error) => {
        clearAlerts();
        showAlert(error.message);
      });
    showAlert('Sending request...');
  }
  addRoom('ROOM '+room_num);
}

/* function to check if class entry is valid */
// eslint-disable-next-line camelcase
function isValidForm(room_num, capacity) {
  // counter for alerts
  let alertContainer = 0;

  // Validate class name if empty
  if (validator.isEmpty(room_num)) {
    showAlert('Please enter a room number.');
    document.forms.roomForm.roomNum.classList.add('error');
    alertContainer++;
  }


  // Validate department if empty
  if (validator.isEmpty(capacity)) {
    showAlert('Please enter a room capacity.');
    document.forms.roomForm.capacity.classList.add('error');
    alertContainer++;
  }
  // validate room number if not integer
  if (!validator.isInt(room_num)) {
    showAlert('Room number should be an integer.');
    document.forms.roomForm.roomNum.classList.add('error');
    alertContainer++;
  }
  // validate capacity if not integer
  if (!validator.isInt(capacity)) {
    showAlert('Room capacity should be an integer.');
    document.forms.roomForm.capacity.classList.add('error');
    alertContainer++;
  }

  // Fail if any alerts
  if (alertContainer > 0) return false;
  return true;
}

/** function to fetch rooms from database */
// eslint-disable-next-line no-unused-vars
async function fetchRooms() {
  // get room select by id
  const roomSelect = document.getElementById('roomSelect');
  // fetch rooms from db
  fetch('/api/room')
    // if response is good return it
    .then(async (response) => {
      if (response.ok) {
        return response.json();
      }
      // else error
      const errorText = await response.text();
      throw new Error(errorText);
    })
    // loop through the rooms
    .then((roomSelection) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const room of roomSelection) {
        // create a option for every room
        const roomOption = document.createElement('option');
        // set value to room id
        roomOption.value = room.room_id;
        // set text to room and number
        roomOption.text = `ROOM ${room.room_num}`;
        // add each room
        roomSelect.appendChild(roomOption);
      }
    })
    // catch errors and show messages
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });
}

/* method to show the alerts that pop when filling room entry form */
function showAlert(alertText, alertClass) {
  // if defined, use parameter alert class. Otherwise, use 'alert'
  alertClass = alertClass || 'alert';
  // container to hold alerts
  const alertContainer = document.getElementById('alertContainer');
  // make alert a div element
  const alert = document.createElement('div');
  // add callout and alert class to alert
  alert.classList.add('callout', alertClass);
  alert.innerText = alertText;
  // add alert to alert container
  alertContainer.appendChild(alert);
}

/* function to remove alerts */
function clearAlerts() {
  // make a container to hold alerts
  const alertContainer = document.getElementById('alertContainer');
  // array of alerts
  const children = [...alertContainer.children];
  // eslint-disable-next-line no-restricted-syntax
  // loop through the alerts
  children.forEach((child) => {
    // print out alert
    console.log(child);
    // remove the alerts
    alertContainer.removeChild(child);
  });
}

function addRoom(roomValue){
  var newRoom = document.createElement('option');
  newRoom.text = roomValue;
  document.getElementById('roomSelect').appendChild(newRoom);
}