/**
 * Fetch data about professors
 * @returns Promise resolving to professor data objects
 */
async function fetchProfessorsData() {
  let persons = [];
  // fetch prof from db
  return dbToken.then((token) => {
    return fetch('https://capstonedbapi.azurewebsites.net' + 
      '/professor-management/professors',
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

/**
 * Get the classes a professor can teach
 * @param {*} profID ID of professor
 * @returns Promise resolving to an array of classes the professor can teach
 */
async function getProfClasses(profID) {
  var classes = [];

  return dbToken.then((token) => {
    return fetch('https://capstonedbapi.azurewebsites.net' + 
      '/preference-management/class-preferences/can-teach/' + profID,
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

/**
 * Fetches data about the rooms from the database
 * @returns Promise resolving to an data object of rooms
 */
async function fetchRoomsData() {
  let rooms = [];
  return dbToken.then((token) => {
    return fetch('https://capstonedbapi.azurewebsites.net' + 
    '/room-management/rooms',
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
        let ro = {
          "id": room.room_id,
          "capacity": room.capacity
        }
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

/**
 * Fetches data about classes from the database
 * @returns Promise resolving to a list of class objects
 */
async function fetchClassesData() {
  // make classSelect by id
  let classes = [];
  // fetch courses from database
  return dbToken.then(token => {
    return fetch('https://capstonedbapi.azurewebsites.net' + 
      '/class-management/classes',
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
          sections: course.num_sections || 0,
          capacity: parseInt(course.capacity),
        };
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

/**
 * Fetches data about times from the database
 * @returns Promise resolving to list of data objects of times from the database
 */
async function fetchTimesData() {
  // make classSelect by id
  let times = [];
  // fetch courses from database
  return dbToken.then(token => {
    return fetch('https://capstonedbapi.azurewebsites.net' + 
      '/time_slot-management/time_slots',
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
