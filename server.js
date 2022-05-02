/* ---------------------------- Environment Setup --------------------------- */
// Engine imports
const express = require("express");
const hbs = require('express-hbs');
const cookieParser = require('cookie-parser')

// Process Running
const { spawn } = require('child_process');

// Filesystem access
const fs = require('fs')

// Import environment variables from .env
require('dotenv').config()

/* -------------------------------------------------------------------------- */
/*                                Express Setup                               */
/* -------------------------------------------------------------------------- */

const app = express();

// Set view engine to Handlebars
app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// Initialize cookie and json parsing middleware
app.use(express.json())
const cookieSecret = process.env.COOKIE_SECRET || "dev"
app.use(cookieParser(cookieSecret))

// Declare static path for web resources
app.use(express.static("Classy-Schedule"));

/* ----------------------------- Request Routing ---------------------------- */

// Handle all API requests in the API router file
const apiRouter = require("./routes/api")
app.use('/api', apiRouter)

// Import auth middleware and apply authLocals
const mainRouter = require("./routes/main")
app.use('/', mainRouter)


/* ------------------------------- App Launch ------------------------------- */
// Launch the app and start listening for requests on the given port

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('App up at port %s', PORT);
});

/* ------------------------------- Test Python ------------------------------ */

// Make some fake data
let fake_data = {
    'name': 'bob',
    'age': '25'
}

// write the fake data to a file
fs.writeFileSync('./scheduler-data/testin.json', JSON.stringify(fake_data), {flag: 'w+'})

// Spawn a new process running the python script
console.log('Spawning python process...');
let python_script = spawn('python', ['./python/test_rw.py'])

// Print python output from node
python_script.stdout.on('data', (chunk) => {
    console.log(`python stdin: ${chunk}`);
})

python_script.stderr.on('data', (chunk) => {
    console.error(`python stderr: ${chunk}`);
})

// When the python script exists, log the exit code
python_script.on('exit', (code, signal) => {
    console.log(`Python script exited with code ${code}`);
    // output fake data if error code good
    if (code == 0) {
        let testout = JSON.parse(fs.readFileSync('./scheduler-data/testout.json'));
        console.log(testout);
    } else {
        console.error('Python script didn\'t exit properly');
    }

})

module.exports = app;