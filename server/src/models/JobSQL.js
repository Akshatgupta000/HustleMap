const { query } = require('../config/database');
const Job = require('../models/JobSQLite');

class Job {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.company = data.company;
    this.position = data.position;
    this.status = data.status;
    this.date_applied = data.date_applied;
    this.notes = data.notes;
    this.application_source = data.application_source;
    this.last_follow_up = data.last_follow_up;
    this.next_follow_up = data.next_follow_up;
    this.interview_date = data.interview_date;
    this.response_received = data.response_received;
    this.priority = data.priority;
    this.salary = data.salary;
    this.location = data.location;
    this.job_url = data.job_url;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new job
  static async create(jobData) {
    const {
      user_id, company, position, status = 'Saved', date_applied,
      notes, application_source = 'Other', priority = 'Medium',
      salary, location, job_url, last_follow_up, next_follow_up,
      interview_date, response_received = false
    } = jobData;

    const result = await query(
      `INSERT INTO jobs (
        user_id, company, position, status, date_applied, notes,
        application_source, priority, salary, location, job_url,
        last_follow_up, next_follow_up, interview_date, response_received
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        user_id, company, position, status, date_applied, notes,
        application_source, priority, salary, location, job_url,
        last_follow_up, next_follow_up, interview_date, response_received
      ]
    );

    return new Job(result.rows[0]);
  }

  // Find jobs by user ID
  static async findByUserId(userId) {
    const result = await query(
      'SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return result.rows.map(row => new Job(row));
  }

  // Find job by ID and user ID (for security)
  static async findByIdAndUserId(jobId, userId) {
    const result = await query(
      'SELECT * FROM jobs WHERE id = $1 AND user_id = $2',
      [jobId, userId]
    );

    return result.rows.length > 0 ? new Job(result.rows[0]) : null;
  }

  // Update job
  async update(updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        // Handle date fields
        if (['date_applied', 'last_follow_up', 'next_follow_up', 'interview_date'].includes(key) && value) {
          fields.push(`${key} = $${paramCount}`);
          values.push(new Date(value));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    }

    if (fields.length === 0) return this;

    values.push(this.id);
    const result = await query(
      `UPDATE jobs SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return new Job(result.rows[0]);
  }

  // Delete job
  async delete() {
    await run('DELETE FROM jobs WHERE id = ?', [this.id]);
    return true;
  }

  // Get job statistics for a user
  static async getStatsByUserId(userId) {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Saved' THEN 1 END) as saved,
        COUNT(CASE WHEN status = 'Applied' THEN 1 END) as applied,
        COUNT(CASE WHEN status = 'Interview' THEN 1 END) as interview,
        COUNT(CASE WHEN status = 'Offer' THEN 1 END) as offer,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected
      FROM jobs 
      WHERE user_id = $1
    `, [userId]);

    return result.rows[0];
  }

  // Get recent jobs for a user
  static async getRecentJobs(userId, limit = 5) {
    const result = await query(
      'SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );

    return result.rows.map(row => new Job(row));
  }

  // Get jobs by status
  static async findByUserIdAndStatus(userId, status) {
    const result = await query(
      'SELECT * FROM jobs WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC',
      [userId, status]
    );

    return result.rows.map(row => new Job(row));
  }

  // Search jobs
  static async search(userId, searchTerm) {
    const result = await query(
      `SELECT * FROM jobs 
       WHERE user_id = $1 
       AND (company ILIKE $2 OR position ILIKE $2 OR notes ILIKE $2)
       ORDER BY created_at DESC`,
      [userId, `%${searchTerm}%`]
    );

    return result.rows.map(row => new Job(row));
  }
}

module.exports = Job;
