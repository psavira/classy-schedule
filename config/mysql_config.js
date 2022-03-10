module.exports = {
  host: 'capstonedb01.mysql.database.azure.com',
  user: 'webdevteam',
  password: process.env.MYSQL_PWD,
  database: 'testdb',
  port: 3306,
  ssl: { ca: process.env.MYSQL_SSL }
}