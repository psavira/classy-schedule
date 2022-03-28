/* eslint-disable no-plusplus */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/** function to send entry to db */
// eslint-disable-next-line no-unused-vars
async function submitForm() {
  // Clear any alerts
  clearAlerts();
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
      room_num: roomNum,
      // eslint-disable-next-line object-shorthand
      capacity: capacity,
    };
    // fetch the rooms from database
    fetch('/api/room', {
      // send to db
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
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
}

/* function to check if class entry is valid */
// eslint-disable-next-line camelcase
function isValidForm(room_num, capacity) {
  // counter for alerts
  let alertContainer = 0;

  // Validate class name if empty
  if (validator.isEmpty(room_num)) {
    showAlert('Please enter a room number.');
    alertContainer++;
  }

  // Validate department if empty
  if (validator.isEmpty(capacity)) {
    showAlert('Please enter a room capacity.');
    alertContainer++;
  }
  // validate room number if not integer
  if (!validator.isInt(room_num)) {
    showAlert('Room number should be an integer.');
    alertContainer++;
  }
  // validate capacity if not integer
  if (!validator.isInt(capacity)) {
    showAlert('Room capacity should be an integer.');
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
