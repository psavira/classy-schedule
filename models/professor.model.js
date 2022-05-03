const sql = require("./db")
const validator = require("validator")

const Professor = function(professor) {
    this.first_name = professor.first_name;
    this.last_name = professor.last_name;
    this.teach_load = professor.teach_load;
    this.user_email = professor.user_email;
    this.professor_id = professor.professor_id
}

Professor.create = function(professor) {
    return sql
    .then(
        (conn) => {
            return new Promise((resolve, reject) => {
                conn.query(
                    "insert into professor set ?",
                    professor,
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

Professor.isValid = function(professor) {
    let invalid_fields = []



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

    if(validator.isEmpty(professor.user_email)){
        invalid_fields.push("user email empty")
    }
    if (invalid_fields.length > 0) {
        return { valid: false, errors: invalid_fields }
    }
    return { valid: true, errors: undefined }
}

Professor.getAll = function() {
    return sql
    .then(
        (conn) => {
            return new Promise((resolve, reject) => {
                conn.query(
                    "select * from professor",
                    function(err, results) {
                        if(err) {
                            reject(err)
                        } else {
                            resolve(results.map((row) => {
                                return new Professor(row)
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

module.exports = Professor