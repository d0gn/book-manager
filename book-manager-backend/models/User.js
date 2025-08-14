const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create({ email, password, username }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (email, password, username)
      VALUES ($1, $2, $3)
      RETURNING id, email, username, created_at
    `;
    
    const result = await pool.query(query, [email, hashedPassword, username]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, password, email, username, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
  static async deleteByEmail(email) {
    const query = 'DELETE FROM users WHERE email = $1';
    await pool.query(query, [email]);
  }
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
    }
  static async updateProfile(userId, updates) {
    const { username } = updates;
    const query = `
      UPDATE users 
      SET username = COALESCE($1, username), updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, username, created_at, updated_at
    `;
    
    const result = await pool.query(query, [username, userId]);
    return result.rows[0];
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const query = `
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    
    await pool.query(query, [hashedPassword, userId]);
  }

  static async saveRefreshToken(userId, refreshToken) {
    const query = `
      UPDATE users 
      SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await pool.query(query, [refreshToken, userId]);
  }

  static async verifyRefreshToken(userId, refreshToken) {
    const query = 'SELECT refresh_token FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    
    if (!result.rows[0] || !result.rows[0].refresh_token) {
      return false;
    }
    
    return result.rows[0].refresh_token === refreshToken;
  }

  static async removeRefreshToken(userId) {
    const query = `
      UPDATE users 
      SET refresh_token = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await pool.query(query, [userId]);
  }
}

module.exports = User;