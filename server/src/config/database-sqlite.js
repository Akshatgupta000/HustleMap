const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Database file path
const dbPath = path.join(__dirname, '..', '..', 'job_tracker.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Helper function to execute queries
const query = async (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Database query error:', err);
        reject(err);
      } else {
        console.log('Executed query:', sql.substring(0, 50) + '...');
        resolve({ rows, rowCount: rows.length });
      }
    });
  });
};

// Helper function to execute single query
const queryOne = async (sql, params = []) => {
  return new Promise((resolve, reject) => {
    console.log('Executing queryOne:', sql, 'with params:', params);
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Database query error:', err);
        reject(err);
      } else {
        console.log('queryOne result:', row);
        resolve({ rows: [row].filter(Boolean), rowCount: row ? 1 : 0 });
      }
    });
  });
};

// Helper function to run multiple queries
const run = async (sql, params = []) => {
  return new Promise((resolve, reject) => {
    console.log('Running SQL query:', sql, 'with params:', params);
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Database run error:', err);
        reject(err);
      } else {
        console.log('Query executed successfully. Changes:', this.changes, 'Last ID:', this.lastID);
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

module.exports = {
  query,
  queryOne,
  run,
  db
};
