const mysql = require('mysql')
const inquirer = require('inquirer')

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
                viewAllDepartments()
                break;
            case choices[1]:
                viewAllRoles()
                break;
            case choices[2]:
                viewAllEmployees()
                break;    
            case choices[3]:
                addDepartment()
                break;
            case choices[4]:
                addRole()
                break;
            case choices[5]:
                addEmployee()
                break;
            case choices[6]:
                updateEmployeeRole()
                break;
            default:
            console.log("Thanks for using the program. Goodbye :)");
            process.exit()
        }
    })
}

const viewAllDepartments = () => {
    const query = "SELECT * FROM department";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log(`\nDEPARTMENTS:\n`);
        res.forEach((department) => {
            console.table(`ID: ${department.id} | ${department.department_name}`);
        })
        console.log(`\n<------------------------------>\n`);
        start()
    })
}

const viewAllRoles = () => {
    const query = "SELECT * FROM role";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log(`\nROLES:\n`);
        res.forEach((role) => {
            console.table(`ID: ${role.id} | Title: ${role.title} | Salary: ${role.salary}`);
        })
        console.log(`\n<------------------------------>\n`);
        start()
    })
}

const viewAllEmployees = () => {
    const query = `SELECT e.id, e.first_name, e.last_name, r.title, d.department_name AS department, r.salary, CONCAT(m.first_name, ' ',m.last_name) AS manager 
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON d.id = r.department_id
    LEFT JOIN employee m ON m.id = e.manager_id`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log(`\nEMPLOYEES:\n`);
        console.table(res)
        console.log(`\n<------------------------------>\n`);
        start()
    })
}

const addDepartment = () => {
    inquirer.prompt({
        name: "addDepartment",
        type: "input",
        message: "What is the name of the department you would like to add?"
    }).then(answer => {
        const query = "INSERT INTO department (department_name) VALUES (?)"
        connection.query(query, answer.addDepartment, (err, res) => {
            if (err) throw err;
            console.log(`${answer.addDepartment} has been added.`);
        })
        console.log(`\n<------------------------------>\n`);
        viewAllDepartments()
    })
}

const addRole = () => {
    const query = "SELECT * FROM department"
    connection.query(query, (err, res) => {
        if (err) throw err;
        const departmentChoices = res.map(({ id, department_name}) => ({
            value: id,
            department: department_name
        }))
        console.table(departmentChoices);

        inquirer.prompt([
            {
                name: "roleTitle",
                type: "input",
                message: "What is the title of the new role?"
            },
            {
                name: "roleSalary",
                type: "input",
                message: "What is the salary of the new role?"
            },
            {
                name: "roleDepartment",
                type: "list",
                message: "Which department does this role fall under?",
                choices: departmentChoices
            }
        ]).then(answer => {
            const query = "INSERT INTO role SET ?"
            connection.query(query, 
                {
                    title: answer.roleTitle,
                    salary: answer.roleSalary,
                    department_id: answer.roleDepartment
                }),
                (err, res) => {
                    if (err) throw err;
                }
                console.log(`\n${answer.roleTitle} role created`);
                console.log(`\n<------------------------------>\n`);
                viewAllRoles()
        })
    })
}

const addEmployee = () => {
    let departmentArray = []
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
        res.forEach(department => {
            departmentArray.push(`${department.id} ${department.department_name}`)
        })

        let roleArray = []
        connection.query("SELECT id, title FROM role", (err, res) => {
            if (err) throw err;

            res.forEach(role => {
                roleArray.push(`${role.id} ${role.title}`)
            })
        })

        let managerArray = []
        connection.query(`SELECT id, first_name, last_name FROM employee`, (err, res) => {
            if (err) throw err;

            res.forEach(employee => {
                managerArray.push(`${employee.id} ${employee.first_name} ${employee.last_name}`)
            })
            inquirer.prompt([
                {
                    name: "firstName",
                    type: "input",
                    message: "Enter employee's first name:"
                },
                {
                    name: "lastName",
                    type: "input",
                    message: "Enter employee's last name:"
                },
                {
                    name: "department",
                    type: "list",
                    message: "Choose employee's department:",
                    choices: departmentArray
                },
                {
                    name: "role",
                    type: "list",
                    message: "Choose employee's role:",
                    choices: roleArray
                },
                {
                    name: "manager",
                    type: "list",
                    message: "Choose employee's manager:",
                    choices: managerArray
                }
            ]).then(response => {
                console.log(response)
                let roleNumber = parseInt(response.role)
                let managerNumber = parseInt(response.manager)
                connection.query("INSERT INTO employee SET ?",
                {
                    first_name: response.firstName,
                    last_name: response.lastName,
                    role_id: roleNumber,
                    manager_id: managerNumber
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`\n${res.affectedRows} employee created`)
                    console.log(`\n<------------------------------>\n`);
                    viewAllEmployees()
                })
            })
        })
    })
}

const updateEmployeeRole = () => {
    let employee = []
    connection.query("SELECT id, first_name, last_name FROM employee", (err, res) => {
        if (err) throw err;
        
        res.forEach( e => {
            employee.push(`${e.id} ${e.first_name} ${e.last_name}`)
        })

        let newRole = []
        connection.query("SELECT id, title FROM role", (err, res) => {
            if (err) throw err;

            res.forEach( r => {
                newRole.push(`${r.id} ${r.title}`)
            })

            inquirer.prompt([
                {
                    name: "updateEmployee",
                    type: "list",
                    message: "Choose the employee whose role will be updated:",
                    choices: employee
                },
                {
                    name: "role",
                    type: "list",
                    message: "Choose the employee's new role position:",
                    choices: newRole
                }
            ]).then(response => {
                let employeeID = parseInt(response.updateEmployee)
                let roleID = parseInt(response.role)
                connection.query(`UPDATE employee SET role_id = ${roleID} WHERE id = ${employeeID}`,
                (err, res) => {
                    if (err) throw err;
                    console.log(`\nEmployee role updated`);
                    console.log(`\n<------------------------------>\n`);
                    start()
                })
            })
        })
    })
}