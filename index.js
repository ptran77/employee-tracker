const inquirer = require('inquirer');
const cTable = require('console.table');

// getting connection
const db = require('./db/connection');

// Prompt User for choices
const promptUser = () => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'What would you like to do',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
      ]
    }
  ])
  .then(answer => {
    const {choice} = answer;

    switch(choice) {
      case 'View all departments':
        viewAllDepartments();
        break;
      case 'View all roles':
        viewAllRoles();
        break;
      case 'View all employees':
        viewAllEmployees();
        break;
      case 'Add a department':
        addDeparment();
        break;
      case 'Add an employee':
        addEmployee();
        break;
      case 'Update an employee role':
        updateEmployeeRole();
        break;
      default:
        db.end();
        return;
    };

    promptUser();
  })
}

// displays all departments
const viewAllDepartments = () => {
  const sql = 'SELECT * FROM department';
  db.query(sql, (err,res) => {
    if(err) throw err;
    console.table('\nAll departments:', res);
  })
}

// display all roles
const viewAllRoles = () => {
  const sql = `SELECT role.id, role.title as role, role.salary, department.name AS department
    FROM role
    LEFT JOIN department ON role.department_id = department.id`;
  db.query(sql, (err,res) => {
    if(err) throw err;
    console.table('\n All roles:',res);
  })
}

// display all employees
const viewAllEmployees = () => {
  const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, department.name AS department, role.salary,
    IF(ISNULL(employee.manager_id)=1, 'null', CONCAT(manager.first_name, ' ', manager.last_name)) AS manager
    FROM employee
    LEFT JOIN role on employee.role_id = role.id
    LEFT JOIN department on role.department_id = department.id
    LEFT JOIN employee manager on manager.id = employee.manager_id`;
  db.query(sql, (err,res) => {
    if(err) throw err;
    console.table('\n All employees:',res);
  })
}

// to start the application
promptUser();
