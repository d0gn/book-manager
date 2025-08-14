// models/Review.js
const pool = require('../config/database'); // pg.Pool 인스턴스

class Review {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.book_id = data.book_id;
    this.rating = data.rating;
    this.title = data.title;
    this.content = data.content;
    this.is_spoiler = data.is_spoiler;
    this.helpful_count = data.helpful_count;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // 모든 리뷰 가져오기 (필터 가능)
  static async getAll({ user_id, book_id } = {}) {
    let query = 'SELECT * FROM reviews';
    const params = [];
    const conditions = [];

    if (user_id) {
      params.push(user_id);
      conditions.push(`user_id = $${params.length}`);
    }
    if (book_id) {
      params.push(book_id);
      conditions.push(`book_id = $${params.length}`);
    }
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
    return rows.map(row => new Review(row));
  }

  // ID로 리뷰 조회
  static async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM reviews WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows.length ? new Review(rows[0]) : null;
  }

  // 리뷰 생성
  static async create({ user_id, book_id, rating, title, content, is_spoiler }) {
    const query = `
      INSERT INTO reviews (user_id, book_id, rating, title, content, is_spoiler)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      user_id,
      book_id,
      rating,
      title || null,
      content || null,
      is_spoiler || false
    ];
    const { rows } = await pool.query(query, values);
    return new Review(rows[0]);
  }

  // 리뷰 수정
  static async update(id, { rating, title, content, is_spoiler }) {
    const query = `
      UPDATE reviews
      SET rating = $1,
          title = $2,
          content = $3,
          is_spoiler = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `;
    const values = [rating, title, content, is_spoiler || false, id];
    const { rows } = await pool.query(query, values);
    return rows.length ? new Review(rows[0]) : null;
  }

  // 리뷰 삭제
  static async delete(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM reviews WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }

  // 도움이 돼요 수 증가
  static async incrementHelpfulCount(id) {
    const query = `
      UPDATE reviews
      SET helpful_count = helpful_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows.length ? new Review(rows[0]) : null;
  }
}

module.exports = Review;
