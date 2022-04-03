const e = require("express");

// Current auth method insecure. Fine for now, but valid tokens should eventually be stored in db
const AUTH_TOKEN_DEV = 'webdevteam'

module.exports.isAuthorized = function(req, res, next) {
    if(res.locals.loggedIn) {
        next();
        return;
    }

    res.redirect('/login');
}

module.exports.authLocals = function(req, res, next) {
    const token = req.signedCookies.token
    if(token === AUTH_TOKEN_DEV) {
        res.locals.loggedIn = true;
    } else {
        res.locals.loggedIn = false;
    }
    next();
}