const express = require('express');
const router = express.Router();
const fetch = require('node-fetch')

const { authLocals, isAuthorized } = require('../middleware/auth')

/* ------------------------------- Home Routes ------------------------------ */
// Routes that anyone can access

router.get("/", authLocals, (req, res) => {
    res.render('index')
});

router.get('/about', authLocals, (req, res) => {
    res.render('about')
})

router.get('/help', authLocals, (req, res) => {
    res.render('help')
})

/* ---------------------------------- Auth ---------------------------------- */
// Routes related to user authentication

router.get('/signup', authLocals, isAuthorized, (req, res) => {
    res.render('signup')
})

router.get('/login', authLocals, (req, res) => {
    res.render('login')
})

router.post('/login', async (req, res) => {
    const submission = req.body;
    const user = submission.user;
    const pass = submission.pass;

    // Check that submission is a valid pair
    // DEV IMPLEMENTATION
    // if (user === 'user' && pass == 'web_dev') {
    //     // 1000 * 60 * 60 * 24 * 7 == 7 days in milliseconds
    //     res.cookie('token', 'webdevteam', { maxAge: 1000 * 60 * 60 * 24 * 7, signed: true })
    //     res.sendStatus(200);
    //     return;
    // }

    // TRUE IMPLEMENTATION
    await fetch("https://capstonedbapi.azurewebsites.net/user-management/admin/authenticate",
    {
        "method": "POST",
        "headers": {
        "Content-Type": "application/json"
        },
        "body": JSON.stringify({
            username: user,
            password: pass
        }),
    }).then((response) => {
        if(response.ok) {
            return response.json()
        } else {
            throw new Error("noauth")
        }
    }).then((json) => {
        res.cookie('token', 'webdevteam', { maxAge: 1000 * 60 * 60 * 24 * 7, signed: true })
        res.status(200).send({user_id: json.user_id});

    }).catch((error) => {
        if(error.message == "noauth") {
            res.status(400).send("User not authorized")
        } else {
            res.sendStatus(500)
        }
    })

})

router.get('/logout', (req, res) => {
    // Reset the user's token cookie
    res.cookie('token', '', { maxAge: -1, signed: true });
    // Send the user to the home page
    res.redirect('/');
})

/* ---------------------------- Restricted Routes --------------------------- */
// All routes within this category require the user to be logged in.
// Login status is verified using the isAuthorized middleware function.

router.get('/schedule', authLocals, isAuthorized, (req, res) => {
    res.render('schedule');
})

router.get('/addClass', authLocals, isAuthorized, (req, res) => {
    res.render('addClass');
})

router.get('/addProfessor', authLocals, isAuthorized, (req, res) => {
    res.render('addProfessor');
})

router.get('/addRoom', authLocals, isAuthorized, (req, res) => {
    res.render('addRoom');
})

router.get('/editPreferences', authLocals, isAuthorized, (req, res) => {
    res.render('editPreferences');
})

router.get('/scheduleGeneration', authLocals, isAuthorized, (req, res) => {
    res.render('scheduleGeneration');
})

module.exports = router