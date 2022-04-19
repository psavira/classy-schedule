/* ---------------------------- Environment Setup --------------------------- */
// Engine imports
const express = require("express");
const hbs = require('express-hbs');
const cookieParser = require('cookie-parser')
// Process Running
const { spawn } = require('child_process');

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

// Spawn a new process running the python script
let python_script = spawn('python', ['./python/test_script.py'])

// Print python output from node
python_script.stdout.on('data', (chunk) => {
    console.log(`${chunk}`);
})

// When the python script exists, log the exit code
python_script.on('exit', (code, signal) => {
    console.log(`Python script exited with code ${code}`);
})

module.exports = app;