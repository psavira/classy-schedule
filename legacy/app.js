// used https://stackoverflow.com/questions/38757235/express-how-to-send-html-together-with-css-using-sendfile#:~:text=var%20app%20%3D%20require%20%28%27express%27%29%20%28%29%3B%20app.get%20%28%27%2F%27%2C,I%20need%20to%20send%20another%20css%20file%20%28style.css%29.

const express = require("express");
const app = express();
app.use(express.static("templates"));
const PORT = process.env.PORT || 3000;

app.get("/",(req, res) => {
    res.sendFile(index.html);
});

app.listen(PORT,() => {
    console.log('App up at port %s', PORT);
});