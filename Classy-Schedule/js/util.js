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
        fs.writeFile("classes.json", classString);

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
        headers: { 'Authorization': token }
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
        fs.writeFile("professors.json", profString);
      }
    })
    // catch errors and show messages
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });
}

function getProfClasses(profID) {
  var classes = [];

  dbToken.then((token) => {
    return fetch('https://capstonedbapi.azurewebsites.net//preference-management/class-preferences/can-teach/' + profID,
      {
        headers: { 'Authorization': token }
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




async function fetchProfessorsData() {
  let persons = [];
  // fetch prof from db
  return dbToken.then((token) => {
    return fetch('https://capstonedbapi.azurewebsites.net/professor-management/professors',
      {
        headers: { 'Authorization': token }
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
    .then(async (profData) => {
      let can_teach_map = {}
      let can_teach_promises = []
      for (const professor of profData) {
        
        let promise = getProfClasses(professor.professor_id)
        promise.then(can_teach => {
          can_teach_map[professor.professor_id] = can_teach
        })
        can_teach_promises.push(promise)
      }
      
      // Wait for all promises to complete
      await Promise.all(can_teach_promises)

      for (const professor of profData) {
        let can_teach = can_teach_map[professor.professor_id]
        let person = { 
          id: professor.professor_id, 
          name: professor.last_name, 
          classes: can_teach, 
          teach_load: professor.teach_load 
        };
        persons.push(person);
        
      }
      return persons
    })

    // catch errors and show messages
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });

}

async function getProfClasses(profID) {
  var classes = [];

  return dbToken.then((token) => {
    return fetch('https://capstonedbapi.azurewebsites.net//preference-management/class-preferences/can-teach/' + profID,
      {
        headers: { 'Authorization': token }
      })
  })
    // if response is good return it
    .then(async (response) => {
      if (response.ok) {
        return response.json();
      }
      if (response.status == 404) {
        return []
      }
      // else error
      const errorText = await response.text();
      throw new Error(errorText);
    })
    // loop through the classes
    .then((classSelection) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const possibleClass of classSelection) {
        if(possibleClass.can_teach == true) {
          classes.push(possibleClass.class_id);
        }
      }
      return classes;
    })
    //catch errors and show messages
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });
}


async function fetchRoomsData() {
  // get room select by id
  let rooms = [];
  let room;
  return dbToken.then((token) => {
    return fetch('https://capstonedbapi.azurewebsites.net/room-management/rooms',
      {
        headers: { 'Authorization': token }
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
    // loop through the rooms
    .then((roomData) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const room of roomData) {
        let ro = room.room_id;
        rooms.push(ro);

      }
      return rooms
    })
    // catch errors and show messages
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });
}

async function fetchClassesData() {
  // make classSelect by id
  let classes = [];
  // fetch courses from database
  return dbToken.then(token => {
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
    .then((classesData) => {
      for (const course of classesData) {
        cla = { 
          id: parseInt(course.class_id), 
          name: course.class_name, 
          sections: course.num_sections || 0 };
        classes.push(cla);
      }
      return classes
    })

    // catch errors and show message
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });

}


async function fetchTimesData() {
  // make classSelect by id
  let times = [];
  // fetch courses from database
  return dbToken.then(token => {
    return fetch('https://capstonedbapi.azurewebsites.net/time_slot-management/time_slots',
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
    .then((timeData) => {
      for (const time of timeData) {
        times.push(time.time_slot_id);
      }
      return times
    })

    // catch errors and show message
    .catch((error) => {
      clearAlerts();
      showAlert(error.message);
    });
}
