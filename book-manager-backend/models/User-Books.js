const pool = require('../config/database'); // pg.Pool 인스턴스

class UserBooks {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.book_id = data.book_id;
    this.status = data.status; // 'want_to_read', 'reading', 'completed'
    this.started_date = data.started_date;
    this.completed_date = data.completed_date;
    this.progress = data.progress;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // 사용자-책 관계 생성 (책 추가)
  static async add({ user_id, book_id, status = 'want_to_read', started_date = null, completed_date = null, progress = 0, notes = null }) {
    const result = await pool.query(
      `INSERT INTO user_books 
       (user_id, book_id, status, started_date, completed_date, progress, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [user_id, book_id, status, started_date, completed_date, progress, notes]
    );
    return new UserBooks(result.rows[0]);
  }

  // 특정 user_id, book_id에 해당하는 관계 조회
  static async findByUserAndBook(user_id, book_id) {
    const result = await pool.query(
      `SELECT * FROM user_books WHERE user_id = $1 AND book_id = $2 LIMIT 1`,
      [user_id, book_id]
    );
    return result.rows.length ? new UserBooks(result.rows[0]) : null;
  }

  // 상태, 진행률, 노트 등 업데이트
  static async updateStatus({ user_id, book_id, status, started_date = null, completed_date = null, progress = null, notes = null }) {
    // 동적 쿼리를 위해 간단히 작성 (필요하면 고도화 가능)
    const fields = [];
    const values = [];
    let idx = 1;

    if (status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }
    if (started_date !== undefined) {
      fields.push(`started_date = $${idx++}`);
      values.push(started_date);
    }
    if (completed_date !== undefined) {
      fields.push(`completed_date = $${idx++}`);
      values.push(completed_date);
    }
    if (progress !== undefined) {
      fields.push(`progress = $${idx++}`);
      values.push(progress);
    }
    if (notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      values.push(notes);
    }
    fields.push(`updated_at = NOW()`);

    values.push(user_id);
    values.push(book_id);

    const setClause = fields.join(', ');

    const result = await pool.query(
      `UPDATE user_books SET ${setClause} WHERE user_id = $${idx++} AND book_id = $${idx} RETURNING *`,
      values
    );
    return result.rows.length ? new UserBooks(result.rows[0]) : null;
  }

  // 내 서재 책 목록 조회 (status 필터링 가능)
  static async findByUser(user_id, status = null) {
    let query = `SELECT * FROM user_books WHERE user_id = $1`;
    const values = [user_id];

    if (status) {
      query += ` AND status = $2`;
      values.push(status);
    }

    query += ` ORDER BY updated_at DESC`;

    const result = await pool.query(query, values);
    return result.rows.map(row => new UserBooks(row));
  }

  // 내 서재에서 책 삭제
  static async delete(user_id, book_id) {
    const result = await pool.query(
      `DELETE FROM user_books WHERE user_id = $1 AND book_id = $2 RETURNING *`,
      [user_id, book_id]
    );
    return result.rows.length ? new UserBooks(result.rows[0]) : null;
  }
  
  static async getStats(userId) {
    const monthlyResult = await pool.query(
      `SELECT TO_CHAR(DATE_TRUNC('month', completed_date), 'YYYY-MM') AS month,
              COUNT(*) AS books_read
      FROM user_books
      WHERE user_id = $1
        AND status = 'completed'
        AND completed_date IS NOT NULL
      GROUP BY month
      ORDER BY month ASC`,
      [userId]
    );

    const yearlyResult = await pool.query(
      `SELECT EXTRACT(YEAR FROM completed_date)::int AS year,
              COUNT(*) AS books_read
      FROM user_books
      WHERE user_id = $1
        AND status = 'completed'
        AND completed_date IS NOT NULL
      GROUP BY year
      ORDER BY year ASC`,
      [userId]
    );

    const dailyResult = await pool.query(
      `SELECT completed_date::date AS date,
              COUNT(*) AS books_read
      FROM user_books
      WHERE user_id = $1
        AND status = 'completed'
        AND completed_date IS NOT NULL
      GROUP BY completed_date::date
      ORDER BY date ASC`,
      [userId]
    );

    return {
      monthly: monthlyResult.rows,
      yearly: yearlyResult.rows,
      daily: dailyResult.rows
    };
  }
}

module.exports = UserBooks;
