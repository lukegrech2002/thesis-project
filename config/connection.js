const mysql = require('mysql');
require('dotenv').config();
let DB_HOST = process.env.DB_HOST;
let DB_USER = process.env.DB_USER;
let DB_PASSWORD = process.env.DB_PASSWORD;
let DB_DBNAME = process.env.DB_DBNAME;

const con = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DBNAME,
    multipleStatements: true
});

console.log('Connected To Database');

module.exports = con;