const sql = require("./db")

const Course = function(course) {
    this.class_id = course.class_id
    this.class_name = course.class_name
    this.capacity = course.capacity
    this.course_number = course.course_number 
    this.department = course.department
}

Course.getAll = function() {
    return sql
    .then(
        (conn) => {
            return new Promise((resolve, reject) => {
                conn.query(
                    "select * from class",
                    function(err, results) {
                        if(err) {
                            reject(err)
                        } else {
                            resolve(results.map((row) => {
                                return new Course(
                                    {
                                        class_id: row.ClassID,
                                        class_name: row.ClassName,
                                        capacity: row.Capacity,
                                        course_number: row.CourseNumber,
                                        department: row.department

                                    }
                                )
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