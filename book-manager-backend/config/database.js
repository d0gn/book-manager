require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 연결 테스트 (앱 시작 시 1회만)
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('DB 연결 성공:', res.rows[0]);
  } catch (err) {
    console.error('DB 연결 실패:', err);
    process.exit(1); // 연결 실패 시 앱 종료
  }
})();

module.exports = pool;