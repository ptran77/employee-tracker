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

      // Continue the prompt to ask for department choice
      inquirer.prompt([
        {
          type: 'list',
          name: 'dept',
          message: 'Which department does the role belong to?',
          choices: deptChoice
        }
      ])
      .then(deptAnswer => {

        // Getting the department information that corresponds with user input
        const {dept} = deptAnswer;
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

// Add an employee
const addEmployee = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: "What is the employee's first name?",
      validate: fnInput => {
        if(fnInput) return true;
        else {
          console.log("You need to enter the employee's first name.")
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'last_name',
      message: "What is the employee's last name?",
      validate: lnInput => {
        if(lnInput) return true;
        else {
          console.log("You need to enter the employee's last name.")
          return false;
        }
      }
    }
  ])
  .then(employeeName => {
    const {first_name, last_name} = employeeName;
    

    // Getting all roles into choices
    db.query('SELECT * FROM role', (err,roleTable) => {
      if(err) throw err;
      const roleChoice = [];
      roleTable.forEach(roleInfo => roleChoice.push(roleInfo.title));

      // Continue prompt to select role
      inquirer.prompt([
        {
          type: 'list',
          name: 'role',
          message: "What is the employee's role?",
          choices: roleChoice
        }
      ])
      .then(roleAnswer => {
        // Getting all role info about the corresponding input
        const {role} = roleAnswer;
        const targetRole = roleTable.filter(roleInfo => roleInfo.title === role);

        // Get all current employees to ask user to select manager
        db.query('SELECT * FROM employee', (err,empTable) => {
          if(err) throw err;
          
          // Make managerChoice array
          const managerChoice = [];
          empTable.forEach(empInfo => managerChoice.push(empInfo.first_name + ' ' + empInfo.last_name));
          managerChoice.push("None")

          // Prompt the user to ask for manager
          inquirer.prompt([
            {
              type: 'list',
              name: 'manager',
              message: "Who is the employee's manager?",
              choices: managerChoice
            }
          ])
          .then(managerAnswer => {
            // Get Manager info from employee table
            const {manager} = managerAnswer;
            let manager_id = null;
            if(manager !== 'None') {
              const targetManager = empTable.filter(empInfo => empInfo.first_name === manager.split(' ')[0] && empInfo.last_name === manager.split(' ')[1]);
              manager_id = targetManager[0].id;
            }


            // Add the employee to the database
            const addSql = `INSERT INTO employee(first_name, last_name, role_id, manager_id)
              VALUES (?,?,?,?)`;
            const params = [first_name, last_name, targetRole[0].id, manager_id];
            db.query(addSql, params, (err,res) => {
              if(err) throw err;
              
              console.log(`Added ${first_name} ${last_name} to the database.`);
              promptUser();
            })
          })
        })
      })
    })
  })
}

// Update Employee role
const updateEmployeeRole = () => {
  // Get all employees from database
  db.query('SELECT id,first_name, last_name FROM employee', (err, empTable) => {
    if(err) throw err;

    // make employee choice list
    const empChoice = [];
    empTable.forEach(empInfo => empChoice.push(empInfo.first_name + ' ' + empInfo.last_name));

    // Prompt User to select employee to update
    inquirer.prompt([
      {
        type: 'list',
        name: 'employee',
        message: "Which employee's role do you want to update?",
        choices: empChoice
      }
    ])
    .then(empAnswer => {
      // Get name and split into first and last names
      const {employee} = empAnswer;
      const [first_name, last_name] = employee.split(' ');
      // Get target employee data to change from table
      const targetEmp = empTable.filter(empInfo => empInfo.first_name === first_name && empInfo.last_name === last_name);
      const targetEmpId = targetEmp[0].id;

      // Get all roles from database
      db.query('SELECT id, title FROM role', (err,roleTable) => {
        if(err) throw err;

        // Make role choice list
        const roleChoice = [];
        roleTable.forEach(roleInfo => roleChoice.push(roleInfo.title));

        // Prompt user to role to choose
        inquirer.prompt([
          {
            type: 'list',
            name: 'role',
            message: `Which role do you want to assign to ${employee}?`,
            choices: roleChoice
          }
        ])
        .then(roleAnswer => {
          const {role} = roleAnswer;
          // find corresponding role info and get id
          const targetRole = roleTable.filter(roleInfo => roleInfo.title === role);
          const targetRoleId = targetRole[0].id;

          // Update database with employee's new role
          const updateSQL = `Update employee
            SET role_id = ?
            WHERE id = ?`;
          const params = [targetRoleId, targetEmpId];
          db.query(updateSQL, params, (err,res) => {
            if(err) throw err;
            console.log(`Updated ${employee}'s role in the database.`);
            promptUser();
          })
        })
      })

    })
  })
}

// to start the application
promptUser();
