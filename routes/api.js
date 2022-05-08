const express = require('express');
const router = express.Router();
const Course = require('../models/course.model');
const Department = require('../models/department.model');
const Room = require('../models/room.model');
const Professor = require('../models/professor.model');
const { AlgoTracker, ATStatusCodes, AlgoTrackerEntry, isAlgoInputValid, createAlgoProcess } = require('../models/algo');
const { algoRequest } = require('../middleware/algo');
const { user } = require('../config/mysql_config');

router.use((req, res, next) => {
  // Custom middleware implementation
  next();
});

/* -------------------------------------------------------------------------- */
/*                              Course API Routes                             */
/* -------------------------------------------------------------------------- */

router.get('/courses', (req, res) => {
  // Get all courses from database and return JSON string
  Course.getAll()
    .then((courses) => {
      res.send(JSON.stringify(courses));
    })
    .catch((error) => {
      console.log(error.message);
      res.sendStatus(500);
    });
});

router.post('/course', (req, res) => {
  const newCourse = req.body;

  // Check if the request body is valid for a course
  const { valid, errors } = Course.isValid(newCourse);

  if (valid) {
    // Attempt to insert course into database
    Course.create(newCourse)
      .then(() => {
        res.sendStatus(200);
      })
      .catch((error) => {
        console.error(error.message);
        res.sendStatus(500);
      });
  } else {
    // Form error response text and send to client
    res.statusCode = 407;
    let responseText = 'Malformed Request. Errors: ';
    errors.forEach((error) => {
      responseText += `${error}\n`;
    });
    res.send(responseText);
  }
});

/* -------------------------------------------------------------------------- */
/*                               Room API Routes                              */
/* -------------------------------------------------------------------------- */

router.get('/room', (req, res) => {
  // Get all rooms from database and send to client
  Room.getAll()
    .then((room) => {
      res.send(JSON.stringify(room));
    })
    .catch((err) => {
      console.log(err.message);
      res.sendStatus(500);
    });
});

router.post('/room', (req, res) => {
  const newRoom = req.body;

  // Check if room form data is valid
  const { valid, errors } = Room.isValid(newRoom);

  if (valid) {
    // Attempt to insert a new room in the database
    Room.create(newRoom)
      .then(() => {
        res.sendStatus(200);
      })
      .catch((error) => {
        console.error(error.message);
        res.sendStatus(500);
      });
  } else {
    // Form error response text and send to client
    res.statusCode = 407;
    let responseText = 'Malformed Request. Errors: ';
    errors.forEach((error) => {
      responseText += `${error}\n`;
    });
    res.send(responseText);
  }
});

/* -------------------------------------------------------------------------- */
/*                            Department API Routes                           */
/* -------------------------------------------------------------------------- */

router.get('/departments', (req, res) => {
  // Get a list of all departments from the database and send to client
  Department.getAll()
    .then((departments) => {
      res.send(JSON.stringify(departments));
    })
    .catch((error) => {
      console.error(error.message);
      res.sendStatus(500);
    });
});

/* -------------------------------------------------------------------------- */
/*                               Professor API Routes                              */
/* -------------------------------------------------------------------------- */

router.get('/professor', (req, res) => {
  // Get all rooms from database and send to client
  Professor.getAll()
    .then((professor) => {
      res.send(JSON.stringify(professor));
    })
    .catch((err) => {
      console.log(err.message);
      res.sendStatus(500);
    });
});

router.post('/professor', (req, res) => {
  const newProf = req.body;

  // Check if room form data is valid
  const { valid, errors } = Professor.isValid(newProf);

  if (valid) {
    // Attempt to insert a new room in the database
    Professor.create(newProf)
      .then(() => {
        res.sendStatus(200);
      })
      .catch((error) => {
        console.error(error.message);
        res.sendStatus(500);
      });
  } else {
    // Form error response text and send to client
    res.statusCode = 407;
    let responseText = 'Malformed Request. Errors: ';
    errors.forEach((error) => {
      responseText += `${error}\n`;
    });
    res.send(responseText);
  }
});

/* -------------------------------------------------------------------------- */
/*                               Algo API Route                               */
/* -------------------------------------------------------------------------- */

router.post('/generateSchedule', algoRequest, (req, res) => {
  const user_id = req.headers.user_id

  let userATEntry = AlgoTracker[user_id];
  
  // Check if user exists in tracker
  if(userATEntry) {
    // Make sure a schedule isn't already generating or creating
    if(userATEntry.isRunning()) {
      res.status(403).send("Schedule already generating");
      return;
    } else if (!userATEntry.isFinished()) {
      res.status(403).send("Too many schedule requests");
    }
  } else {
    // If no entry exists in the tracker, create a new entry for the user.
    userATEntry = new AlgoTrackerEntry(user_id);
    AlgoTracker[user_id] = userATEntry;
  }

  // INFO: By here, user entry exists and no generation running.

  // Validate body
  const body = req.body;

  // If body invalid, send an error response.
  if(!isAlgoInputValid(body)) {
    res.status(400).send("Input not valid for the algorithm");
    return;
  }

  // INFO: By here, request is valid

  // Send a successful response and start creating the algo process
  res.status(200).send();
  createAlgoProcess(userATEntry, body);

})

router.get('/getAlgoStatus', algoRequest, (req, res) => {
  const user_id = req.headers.user_id
  const userATEntry = AlgoTracker[user_id];

  if(!userATEntry) {
    res.status(403).send("No entry exists. Try generating a schedule first.")
    return;
  }
  res.status(200).send(`${userATEntry["status"]}`);
})

router.get('/getAlgoSchedule', algoRequest, (req, res) => {

})


module.exports = router;
