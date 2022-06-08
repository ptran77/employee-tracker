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
  const sql = 'SELECT department.name as department FROM department';
  db.query(sql, (err,res) => {
    if(err) throw err;
    console.table('\nAll departments:', res);
  })
}

// display all roles
const viewAllRoles = () => {
  const sql = `SELECT role.title as role, role.salary, department.name AS department
    FROM role
    INNER JOIN department ON role.department_id = department.id`;
  db.query(sql, (err,res) => {
    if(err) throw err;
    console.table('\n All roles:',res);
  })
}

// to start the application
promptUser();