const e = require("express");

module.exports.algoRequest = function(req, res, next) {
    const user_id = req.headers.user_id

    // Make sure user_id is included in headers
    if(!user_id) {
      res.status(400).send("User ID not found in request headers.");
      return;
    } else {
        next();
    }
}