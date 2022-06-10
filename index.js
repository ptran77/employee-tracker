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
      message: 'What would you like to do?',
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
    };
  })
}

// displays all departments
const viewAllDepartments = () => {
  const sql = 'SELECT * FROM department';
  db.query(sql, (err,res) => {
    if(err) throw err;
    console.table('\nAll departments:', res);
    promptUser();
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
    promptUser();
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
    promptUser();
  })
}

const addDeparment = () => {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'department',
      message: 'What is the name of the department? ',
      validate: departmentInput => {
        if(departmentInput) return true;
        else {
          console.log("You need to enter the department's name.");
          return false;
        }
      }
    }
  ])
  .then(answer => {
    const {department} = answer;
    const sql = 'SELECT * FROM department where name = ?';
    db.query(sql, department, (err,res) => {
      if(err) throw err;
      if(res.length) {
        console.log(`There is already a department call ${department}`);
        promptUser();
      }
      else {
        const add = `INSERT INTO department(name)
          VALUES (?)`;
        db.query(add, department, (err,res) => {
          if(err) throw err;
          console.log(`Added ${department} to the database`);
          promptUser();
        })
      }
    })
  })
}

// to start the application
promptUser();
