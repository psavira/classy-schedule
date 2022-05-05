const sql = require("./db")
const validator = require("validator")

const class_preference = function(classpreference) {
    this.class_num = classpreference.class_num;
    this.dept_id = classpreference.dept_id;
    this.is_lab = classpreference.is_lab;
    this.professor_id = classpreference.professor_id;
    this.can_teach = classpreference.can_teach;
    this.prefer_to_teach = classpreference.prefer_to_teach;
}

class_preference.create = function(classpreference) {
    return sql
    .then(
        (conn) => {
            return new Promise((resolve, reject) => {
                conn.query(
                    "insert into class_preference set ?",
                    classpreference,
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
}

class_preference.isValid = function(class_num, dept_id, is_lab, professor_id, can_teach, prefer_to_teach) {
    let invalid_fields = []

    
   /* if (!validator.isInt(professor.professor_id)) {
        invalid_fields.push("Prof ID not integer")
    }

    // Validate capacity
    if (validator.isEmpty(professor.professor_id)) {
        invalid_fields.push("ID empty")
    }
    */
/*
    if (validator.isInt(professor.first_name)) {
        invalid_fields.push("first name not integer")
    } 

    if (validator.isEmpty(professor.first_name)) {
        invalid_fields.push("first name empty")
    }

    if (validator.isInt(professor.last_name)) {
        invalid_fields.push("last name not integer")
    } 

    if (validator.isEmpty(professor.last_name)) {
        invalid_fields.push("last name empty")
    }

    if (!validator.isInt(professor.teach_load)) {
        invalid_fields.push("teach load not integer")
    }

    if (validator.isEmpty(professor.teach_load)) {
        invalid_fields.push("teach load empty")
    }

    if (invalid_fields.length > 0) {
        return { valid: false, errors: invalid_fields }
    }
    return { valid: true, errors: undefined }
}
*/

class_preference.getAll = function() {
    return sql
    .then(
        (conn) => {
            return new Promise((resolve, reject) => {
                conn.query(
                    "select * from class_preference",
                    function(err, results) {
                        if(err) {
                            reject(err)
                        } else {
                            resolve(results.map((row) => {
                                return new class_preference(row)
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

module.exports = class_preference;
}