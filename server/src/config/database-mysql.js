const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'job_tracker',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(() => console.log('Connected to MySQL database'))
  .catch((err) => {
    console.error('MySQL connection error:', err.message || err);
    // do not exit here, let the server handle connection attempts at runtime
  });

async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return { rows, rowCount: Array.isArray(rows) ? rows.length : rows.affectedRows };
}

async function execute(sql, params = []) {
  // Use execute for statements that return result info (insertId, affectedRows)
  const [result] = await pool.execute(sql, params);
  return result;
}

module.exports = {
  pool,
  query,
  execute,
};
