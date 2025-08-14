require('dotenv').config();
const pool = require('./database'); // DB 모듈 불러오기

(async () => {
  try {
    const res = await pool.query('SELECT * FROM books'); // 쿼리 사용
    console.log(res.rows);
  } catch (err) {
    console.error('쿼리 실행 실패:', err);
  }
})();

// pool.end()는 절대 여기서 호출하지 않음!
// 앱 종료 시 (예: SIGINT) 이벤트에서 호출
process.on('SIGINT', async () => {
  await pool.end();
  console.log('DB 연결 종료');
  process.exit();
});
