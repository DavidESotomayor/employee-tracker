const mysql = require('mysql')
const inquirer = require('inquirer')
const table = require('console.table')

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Luna",
    database: "employeeTracker_db"
})

const choices = [
    "View all departments",
    "View all roles",
    "Views all employees",
    "Add a department",
    "Add a role",
    "Add an employee",
    "Update employee role",
    "Exit"
]

connection.connect((err) => {
    if (err) throw err;
    start()
})

const start = () => {
    inquirer.prompt({
        name: "startChoices",
        type: "list",
        message: " What would you like to do?",
        choices: choices
    }).then(answer => {
        switch (answer.startChoices) {
            case choices[0]:
                console.log('choice 1');
                break;
            case choices[1]:
                console.log('choice 2');
                break;
            case choices[2]:
                console.log('choice 3');
                break;    
            case choices[3]:
                console.log('choice 4');
                break;
            case choices[4]:
                console.log('choice 5');
                break;

            case choices[5]:
                console.log('choice 6');
                break;
            case choices[6]:
                console.log('choice 7');
                break;
            default:
            console.log("Thanks for using the program. Goodbye :)");
            process.exit()
        }
    })
}

