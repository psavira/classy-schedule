const express = require('express');
const router = express.Router();
const Course = require('../models/course.model');
const Department = require('../models/department.model');
const Room = require('../models/room.model');
const Professor = require('../models/professor.model');

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


module.exports = router;
