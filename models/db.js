const mysql = require("promise-mysql")
const mysql_config = require("../config/mysql_config")

const mysql_conn = new mysql.createConnection(mysql_config);

module.exports = mysql_conn