// Contains global data for all schedule scripts

/* -------------------------------------------------------------------------- */
/*                               Professor Data                               */
/* -------------------------------------------------------------------------- */

/**
 * Loads professor data from the database
 * @returns A promise resolving to the data
 */
function loadProfessorsData() {
  return dbToken
    .then((token) => {
      return fetch(
        'https://capstonedbapi.azurewebsites.net/professor-management/professors',
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
        throw new Error("Professors request failed.");
      }
    })
    .then((json) => {
      return json;
    })
    .catch((error) => {
      console.log(error.message);
    })
}

let professorsData = loadProfessorsData();

/* -------------------------------------------------------------------------- */
/*                                Classes Data                                */
/* -------------------------------------------------------------------------- */

/**
 * Loads class cdata from the database
 * @returns A promise resolving to the data
 */
function loadClassesData() {
  return dbToken
    .then((token) => {
      return fetch(
        'https://capstonedbapi.azurewebsites.net/class-management/classes',
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
        throw new Error("Classes request failed.");
      }
    })
    .then((json) => {
      return json;
    })
    .catch((error) => {
      console.log(error.message);
    })
}

let classesData = loadClassesData();

/* -------------------------------------------------------------------------- */
/*                               Can Teach Data                               */
/* -------------------------------------------------------------------------- */

function loadCanTeachData() {
  let courses
  let canTeach = {}

  return classesData
    .then((data) => {
      courses = data;
      return dbToken
    })
    .then((token) => {
      // For each course, get the teaching professors and add to canTeach map
      let promises = []
      for (let course of courses) {
        promises.push(
          fetch(
            'https://capstonedbapi.azurewebsites.net' +
            '/preference-management/class-preferences/can-teach' +
            `/by-class/${course['class_id']}`,
            {
              headers: {
                'Authorization': token
              }
            }
          )
            .then((response) => {
              if (response.ok) {
                return response.json()
              } else {
                throw new Error("No teacher can teach")
              }
            })
            .then((json) => {
              let teachers = []
              for (let teacher of json) {
                teachers.push(teacher['professor_id'])
              }
              return {
                class_id: course['class_id'],
                teachers: teachers
              }
            })
            .catch((error) => {
              // Do nothing, it's okay :)
              // Endpoint responds 404 for no class with id
              // Or for classes with no teacher that can teach
              // No way to distinguish the two from the response
            })
        )
      }
      return Promise.all(promises)
    })
    .then((values) => {
      console.log(values)
      // For each promise value, add to the class map
      for (let value of values) {
        if (value != undefined) {
          canTeach[value['class_id']] = value['teachers']
        }
      }
      return canTeach
    })
}

let canTeachData = loadCanTeachData()

/* -------------------------------------------------------------------------- */
/*                               Keystroke Data                               */
/* -------------------------------------------------------------------------- */

let keyTracker = {}

keyTracker["shiftDown"] = false

$(document)
.keydown((event) => {
  if(event.key == 'Shift'){
    keyTracker["shiftDown"] = true
  }
})
.keyup((event) => {
  if(event.key == 'Shift'){
    keyTracker["shiftDown"] = false
  }
})
