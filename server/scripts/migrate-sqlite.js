const fs = require('fs');
const path = require('path');
const { query, run } = require('../src/config/database-sqlite');

async function runMigration() {
  try {
    console.log('Starting SQLite database migration...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema-sqlite-simple.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim() && !statement.trim().startsWith('--')) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        try {
          await run(statement);
        } catch (error) {
          console.error('Error executing statement:', statement.substring(0, 100));
          console.error('Error:', error.message);
          // Continue with other statements
        }
      }
    }
    
    console.log('SQLite migration completed successfully!');
    console.log('Database file created at: job_tracker.db');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
