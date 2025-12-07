const fs = require('fs');
const path = require('path');
const { execute } = require('../src/config/database-mysql');

async function runMigration() {
  try {
    console.log('Starting MySQL database migration...');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema-mysql.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
      try {
        console.log('Executing:', stmt.substring(0, 80) + '...');
        await execute(stmt);
      } catch (err) {
        console.error('Error executing statement:', err.message || err);
      }
    }

    console.log('MySQL migration completed!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
