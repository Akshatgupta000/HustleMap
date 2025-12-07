const bcrypt = require('bcrypt');
const { query, execute } = require('../config/database-mysql');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create({ name, email, password }) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // mysql2 returns insertId
    const insertId = result.insertId;
    const res = await query('SELECT * FROM users WHERE id = ?', [insertId]);
    return new User(res.rows[0]);
  }

  static async findByEmail(email) {
    const res = await query('SELECT * FROM users WHERE email = ?', [email]);
    return res.rows.length > 0 ? new User(res.rows[0]) : null;
  }

  static async findById(id) {
    const res = await query('SELECT * FROM users WHERE id = ?', [id]);
    return res.rows.length > 0 ? new User(res.rows[0]) : null;
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

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
    await execute(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    const updated = await query('SELECT * FROM users WHERE id = ?', [this.id]);
    return new User(updated.rows[0]);
  }

  async delete() {
    await execute('DELETE FROM users WHERE id = ?', [this.id]);
    return true;
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;
