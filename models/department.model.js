const sql = require("./db")

const Department = function(dept) {
    this.dept_id = dept.dept_id
    this.dept_name = dept.dept_name
}

Department.getAll = function() {
    return sql
    .then(
        (conn) => {
            return new Promise((resolve, reject) => {
                conn.query(
                    "select * from department",
                    function(err, results) {
                        if(err) {
                            reject(err)
                        } else {
                            resolve(results.map((row) => {
                                return new Department(
                                    {
                                        dept_id: row.dept_id,
                                        dept_name: row.dept_name

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

module.exports = Department