// used https://stackoverflow.com/questions/38757235/express-how-to-send-html-together-with-css-using-sendfile#:~:text=var%20app%20%3D%20require%20%28%27express%27%29%20%28%29%3B%20app.get%20%28%27%2F%27%2C,I%20need%20to%20send%20another%20css%20file%20%28style.css%29.

// imports
const express = require("express");

// environment variables setup
require('dotenv').config()

// router imports
const apiRouter = require("./routes/api")

// express app setup
const app = express();

// express middleware
app.use(express.json())

// express static paths
app.use(express.static("Classy-Schedule"));
// app.use("/Classy-Schedule", express.static("Classy-Schedule"));
const PORT = process.env.PORT || 3000;

// routes
app.use('/api', apiRouter)

app.get("/",(req, res) => {
    res.sendFile(index.html);
});

app.listen(PORT,() => {
    console.log('App up at port %s', PORT);
});

module.exports = app;