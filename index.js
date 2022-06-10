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
        addDepartment();
        break;
      case 'Add a role':
        addRole();
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

// Add a department
const addDepartment = () => {
  inquirer.prompt([
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
    
    // Checking to see if department exists in database already
    db.query(sql, department, (err,res) => {
      if(err) throw err;

      // Department already exists
      if(res.length) {
        console.log(`There is already a department call ${department}`);
        promptUser();
      }
      // Department doesn't exist
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

// Add a role
const addRole = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'role',
      message: 'What is the name of the role? ',
      validate: roleInput => {
        if(roleInput) return true;
        else {
          console.log("You need to enter the role's name.");
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'salary',
      message: 'What is the salary of the role? ',
      validate: salaryInput => {
        if(salaryInput && !isNaN(salaryInput)) return true;
        else {
          console.log("You need input a salary");
          return false;
        }
      }
    }
  ])
  .then(roleData => {
    const {role, salary} = roleData;
    
    // Getting department names from database into a list for the user to choose
    const deptSql  = 'SELECT * FROM department';
    db.query(deptSql, (err,deptTable) => {
      if(err) throw err;
      const deptChoice = [];
      deptTable.forEach(deptInfo => deptChoice.push(deptInfo.name));

      inquirer.prompt([
        {
          type: 'list',
          name: 'dept',
          message: 'Which department does the role belong to?',
          choices: deptChoice
        }
      ])
      .then(deptChoice => {

        // Getting the department information that corresponds with user input
        const {dept} = deptChoice;
        const targetDept = deptTable.filter(deptInfo => deptInfo.name === dept);

        // Checking to see if there is already a role with the same title, salary, and department id
        const roleSql = `SELECT * FROM role WHERE title = ? AND salary = ? AND department_id = ?`;
        const params = [role, salary, targetDept[0].id];
        db.query(roleSql, params, (err,res) => {
          if(err) throw err;

          // There is already a role with same title, salary, and department id
          if(res.length) {
            console.log(`There is already a role called ${role} with a salary of ${salary} in the ${dept} department.`);
            promptUser();
          }
          // The role wasn't found, so add to the database
          else {
            const addSql = `INSERT INTO role(title, salary, department_id)
              VALUES(?,?,?)`;
            db.query(addSql, params, (err, res) => {
              if(err) throw err;

              console.log(`Added ${role} to the database.`);
              promptUser();
            })
          }
        })
      })
    })
  })
}

// to start the application
promptUser();
