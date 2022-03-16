const sql = require("./db")
const validator = require("validator")

const Room = function(room) {
    this.room_num = room.room_num;
    this.capacity = room.capacity;
}

Room.create = function(room) {
    return sql
    .then(
        (conn) => {
            return new Promise((resolve, reject) => {
                conn.query(
                    "insert into room set ?",
                    room,
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

Room.isValid = function(room) {
    let invalid_fields = []


    
    if (!validator.isInt(room.room_num)) {
        invalid_fields.push("Class number not integer")
    }

    // Validate capacity
    if (validator.isEmpty(room.capacity)) {
        invalid_fields.push("Capacity empty")
    }

    if (!validator.isInt(room.capacity)) {
        invalid_fields.push("Capacity not integer")
    } 


    if (invalid_fields.length > 0) {
        return { valid: false, errors: invalid_fields }
    }
    return { valid: true, errors: undefined }
}

Room.getAll = function() {
    return sql
    .then(
        (conn) => {
            return new Promise((resolve, reject) => {
                conn.query(
                    "select * from room",
                    function(err, results) {
                        if(err) {
                            reject(err)
                        } else {
                            resolve(results.map((row) => {
                                return new Room(row)
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

module.exports = Room