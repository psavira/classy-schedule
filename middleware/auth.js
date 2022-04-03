// Current auth method insecure. Fine for now, but valid tokens should eventually be stored in db
const AUTH_TOKEN_DEV = 'webdevteam'

module.exports.isAuthorized = function(req, res, next) {
    const token = req.signedCookies.token
    if(token === AUTH_TOKEN_DEV) {
        next();
        return;
    }

    res.redirect('/login');
}