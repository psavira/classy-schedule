const sql = require("./db")
const validator = require("validator")

const Course = function (course) {
  this.class_num = course.class_num;
  this.dept_id = course.dept_id;
  this.class_name = course.class_name;
  this.capacity = course.capacity;
  this.credits = course.credits;
  this.is_lab = course.lab;
};

Course.create = function (course) {
  return sql
    .then(
      (conn) => {
        return new Promise((resolve, reject) => {
          conn.query(
            "insert into class set ?",
            course,
            function (err, results) {
              if (err) {
                reject(err)
              } else {
                resolve(results)
              }
            }
          )
        })
      }
    )
};

Course.isValid = function (course) {
  let invalid_fields = []

  // Validate class name
  if (validator.isEmpty(course.class_name)) {
    invalid_fields.push("Name empty")
  }


  // Validate department
  if (validator.isEmpty(course.dept_id)) {
    invalid_fields.push("Department empty")
  }

  // Validate class number
  if (validator.isEmpty(course.class_num)) {
    invalid_fields.push("Class number empty")
  }

  if (!validator.isInt(course.class_num)) {
    invalid_fields.push("Class number not integer")
  }

  // Validate capacity
  if (validator.isEmpty(course.capacity)) {
    invalid_fields.push("Capacity empty")
  }

  if (!validator.isInt(course.capacity)) {
    invalid_fields.push("Capacity not integer")
  }

  // Validate credits
  if (validator.isEmpty(course.credits)) {
    invalid_fields.push("Credits empty")
  }

  if (!validator.isInt(course.credits)) {
    invalid_fields.push("Credits not integer")
  }

  if (invalid_fields.length > 0) {
    return { valid: false, errors: invalid_fields }
  }
  return { valid: true, errors: undefined }
}

Course.getAll = function () {
  return sql
    .then(
      (conn) => {
        return new Promise((resolve, reject) => {
          conn.query(
            "select * from class",
            function (err, results) {
              if (err) {
                reject(err)
              } else {
                resolve(results.map((row) => {
                  return new Course(row)
                }))
              }
            }
          )
        })
      },
      (err) => {
        console.error(err)
      }
    )
}

module.exports = Course