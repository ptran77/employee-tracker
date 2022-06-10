const mysql = require('mysql2');

// access to .env file
require('dotenv').config();

// Connect to employee database
const db = mysql.createConnection(
  {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'employee_db'
  },
  console.log('=================\n\nEmployee Mananger\n\n=================')
)
module.exports = db;