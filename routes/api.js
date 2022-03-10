const express = require("express")
const router = express.Router()
const Course = require('../models/course.model')

router.use((req, res, next) => {
    console.log("API route accessed")
    next()
})

router.get("/courses", (req, res) => {
    console.log("getting courses...")
    Course.getAll().then(courses => {
        res.send(JSON.stringify(courses))
    })
    .catch((err) => {
        console.log(err)
        res.send("faile")
    })
})

console.log("Api imported")
module.exports = router