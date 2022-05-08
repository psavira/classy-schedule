const express = require('express');
const router = express.Router();
const fs = require('fs')

const { AlgoTracker, ATStatusCodes, AlgoTrackerEntry, isAlgoInputValid, createAlgoProcess } = require('../models/algo');
const { algoRequest } = require('../middleware/algo');
router.use((req, res, next) => {
  // Custom middleware implementation
  next();
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
  const user_id = req.headers.user_id
  const userATEntry = AlgoTracker[user_id];
  
  // Returns if the user hasn't started the script
  if(!userATEntry) {
    res.status(403).send("No entry exists. Try generating a schedule first.")
    return
  }

  // Return error if script isn't done running
  if(!userATEntry.isFinished()) {
    res.status(403).send("Schedule is not done generating. Try again soon.")
    return
  }

  // Returns error if script has errored
  if(userATEntry.hasError()) {
    res.status(403).send("Schedule has errored out. Try generating a new one.")
    return
  }
  
  try {
    // Read the data as a utf-8 string
    const data = fs.readFileSync(`./scheduler-data/algo_data_user_${user_id}_out.json`, {encoding: "utf-8"})
    const jsonData = JSON.parse(data)
    res.status(200).send(jsonData)
    return
  } catch (err) {
    // Error handling
    console.log("getAlgoSchedule error: ", err)
    res.sendStatus(500)
    return
  }

})


module.exports = router;
