const mysql = require('mysql')
const inquirer = require('inquirer')
require('console.table')

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Luna",
    database: "employeeTracker_db"
})

connection.connect((err) => {
    if (err) throw err;
})