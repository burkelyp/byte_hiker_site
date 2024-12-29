// ./database/db-connector.js

require('dotenv').config();
const db_password = process.env.db_password

// Get an instance of mysql we can use in the app
var mysql = require('mysql')

// Create a 'connection pool' using the provided credentials
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'ldblm.cx08ssagc8t0.us-east-1.rds.amazonaws.com',
    port            : 3306,
    user            : 'admin',
    password        : db_password,
    database        : 'byte_hikers'
})

/*
// Local database
// Create a 'connection pool' using the provided credentials
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'burkely',
    database        : 'byte_hikers'
})
*/


// Export it for use in our applicaiton
module.exports.pool = pool;