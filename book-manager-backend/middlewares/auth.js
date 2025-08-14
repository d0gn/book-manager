const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 토큰에서 사용자 ID 추출 (토큰 검증만, DB 조회 안 함)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '접근 토큰이 필요합니다.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 존재 여부 확인
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '존재하지 않는 사용자입니다.'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.',
        code: 'INVALID_TOKEN'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: '인증 처리 중 오류가 발생했습니다.'
    });
  }
};

// 선택적 인증 (토큰이 있으면 사용자 정보 추가, 없어도 통과)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // 토큰이 없어도 통과
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // 토큰이 잘못되어도 통과 (선택적이므로)
    next();
  }
};

// 관리자 권한 확인
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '로그인이 필요합니다.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '관리자 권한이 필요합니다.'
    });
  }

  next();
};

// 자신의 리소스만 접근 가능 (예: 자신의 프로필만 수정)
const requireOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '로그인이 필요합니다.'
    });
  }

  if (req.user.id != resourceUserId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '해당 리소스에 접근할 권한이 없습니다.'
    });
  }

  next();
};

// export에 추가
module.exports = { 
  authenticateToken, 
  optionalAuth, 
  requireAdmin, 
  requireOwnership 
};