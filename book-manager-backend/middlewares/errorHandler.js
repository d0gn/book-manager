// 404 에러 핸들러
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `경로 ${req.originalUrl}를 찾을 수 없습니다.`
  });
};

// 글로벌 에러 핸들러
const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // JWT 에러 처리
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: '토큰이 만료되었습니다.'
    });
  }

  // 데이터베이스 에러 처리
  if (error.code === '23505') { // PostgreSQL unique constraint
    return res.status(409).json({
      success: false,
      message: '중복된 데이터입니다.'
    });
  }

  if (error.code === '23503') { // PostgreSQL foreign key constraint
    return res.status(400).json({
      success: false,
      message: '참조 무결성 위반입니다.'
    });
  }

  // 기본 500 에러
  res.status(error.status || 500).json({
    success: false,
    message: error.message || '서버 내부 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = { notFoundHandler, errorHandler };