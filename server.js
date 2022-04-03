/* ---------------------------- Environment Setup --------------------------- */
// Engine imports
const express = require("express");
const hbs = require('express-hbs');
const cookieParser = require('cookie-parser')

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

/* -------------------------------------------------------------------------- */
/*                               Request Routing                              */
/* -------------------------------------------------------------------------- */

// Handle all API requests in the API router file
const apiRouter = require("./routes/api")
app.use('/api', apiRouter)

/* ------------------------------- Home Routes ------------------------------ */
// Routes that anyone can access

app.get("/", (req, res) => {
    res.render('index')
});

app.get('/about', (req, res) => {
    res.render('about')
})

app.get('/help', (req, res) => {
    res.render('help')
})

/* ---------------------------------- Auth ---------------------------------- */
// Routes related to user authentication

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    const submission = req.body;
    const user = submission.user;
    const pass = submission.pass;

    // Check that submission is a valid pair
    // DEV IMPLEMENTATION
    if (user === 'user' && pass == 'web_dev') {
        // 1000 * 60 * 60 * 24 * 7 == 7 days in milliseconds
        res.cookie('token', 'webdevteam', { maxAge: 1000 * 60 * 60 * 24 * 7, signed: true })
        res.sendStatus(200);
        return;
    }
    res.sendStatus(400)
})

/* ---------------------------- Restricted Routes --------------------------- */
// All routes within this category require the user to be logged in.
// Login status is verified using the isAuthorized middleware function.

const { isAuthorized } = require('./middleware/auth')

app.get('/schedule', isAuthorized, (req, res) => {
    res.render('schedule')
})

app.get('/addClass', isAuthorized, (req, res) => {
    res.render('addClass');
})

app.get('/addProfessor', isAuthorized, (req, res) => {
    res.render('addProfessor');
})

app.get('/addRoom', isAuthorized, (req, res) => {
    res.render('addRoom');
})

/* ------------------------------- App Launch ------------------------------- */
// Launch the app and start listening for requests on the given port

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('App up at port %s', PORT);
});

module.exports = app;