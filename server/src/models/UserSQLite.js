const bcrypt = require('bcrypt');
const { query, queryOne, run } = require('../config/database-sqlite');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create({ name, email, password }) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const insertResult = await run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    const queryResult = await queryOne(
      'SELECT * FROM users WHERE id = ?',
      [insertResult.lastID]
    );
    
    if (!queryResult || !queryResult.rows || queryResult.rows.length === 0) {
      throw new Error('User creation failed');
    }
    
    return new User(queryResult.rows[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await queryOne(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Find user by ID
  static async findById(id) {
    const result = await queryOne(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Compare password
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Update user
  async update(updates) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'password') {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(value, saltRounds);
        fields.push(`${key} = ?`);
        values.push(hashedPassword);
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this;

    values.push(this.id);
    await run(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    const updated = await queryOne('SELECT * FROM users WHERE id = ?', [this.id]);
    return new User(updated.rows[0]);
  }

  // Delete user
  async delete() {
    await run('DELETE FROM users WHERE id = ?', [this.id]);
    return true;
  }

  // Get user data without password
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;
