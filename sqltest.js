const mysql = require('mysql');
const fs = require('fs');

var config =
{
    host: 'capstonedb01.mysql.database.azure.com',
    user: 'webdevteam',
    password: 'webdevpass',
    database: 'classyschedule',
    port: 3306,
    //ssl: {ca: fs.readFileSync("C:/Users/btbor/Web Dev/sqltest/DigiCertGlobalRootCA.crt.pem")}
};

const conn = new mysql.createConnection(config);

conn.connect(
    function (err) { 
    if (err) { 
        console.log("!!! Cannot connect !!! Error:");
        throw err;
    }
    else
    {
       console.log("Connection established.");
      queryDatabase();
    }
});

function queryDatabase(){

  conn.query('DESCRIBE class_preference', function(err, results, fields) {
  if(err) throw err;
      console.log(JSON.stringify(results));
  })
}