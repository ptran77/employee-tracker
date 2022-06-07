const mysql = require('mysql2');

// access to .env file
require('dotenv').config();

// Connect to employee database
const db = mysql.createConnection(
  {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_PORT
  },
  console.log('Connected to the employee database.')
)

module.exports = db;