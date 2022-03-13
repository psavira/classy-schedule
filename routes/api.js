const { response } = require("express")
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

router.post("/course", (req, res) => {
    const new_course = req.body
    const { valid, errors } = Course.isValid(new_course)
    if (valid) {
        Course.create(new_course)
        .then(() => {
            res.sendStatus(200)
        })
        .catch(error => {
            console.error(error.message)
            res.sendStatus(500)
        })
    } else {
        res.statusCode = 407
        let response_text = "Malformed Request. Errors: ";
        errors.forEach(error => {
            response_text += error + "\n"
        })
}

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

Course.getAll().then(function(courses){
    console.log(courses);
});

// to add a course. comment this out so we don't add a class everytime we do npm start
// const new_course = {
//     class_num: 1,
//     dept_id: 1,
//     class_name: "something",
//     capacity: 10,
//     credits: 2
// }

// Course.create(new_course)
// .then(
//     Course.getAll().then(function (courses) {
//         console.log(courses)
//     })
// )

module.exports = router