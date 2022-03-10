const express = require("express")
const router = express.Router()
const Course = require('../models/course.model')
const Department = require('../models/department.model')

router.use((req, res, next) => {
    console.log("API route accessed")
    next()
})

// courses

router.get("/courses", (req, res) => {
    console.log("getting courses...")
    Course.getAll().then(courses => {
        res.send(JSON.stringify(courses))
    })
    .catch((err) => {
        console.log(err.message)
        res.sendStatus(500)
    })
})

// departments

router.get("/departments", (req, res) => {
    Department.getAll().then(departments => {
        res.send(JSON.stringify(departments))
    })
    .catch((err) => {
        console.error(err.message)
        res.sendStatus(500)
    })
})

module.exports = router