const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT 토큰 생성 함수
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' }, 
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
    { expiresIn: '30d' }
  );
};

// 회원가입
const signup = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // 이메일 중복 체크
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: '이미 사용 중인 이메일입니다.'
      });
    }

    // 사용자명 중복 체크
    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({
        success: false,
        message: '이미 사용 중인 사용자명입니다.'
      });
    }

    // 사용자 생성
    const newUser = await User.create({ email, password, username });

    // JWT 토큰 생성
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username
        },
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};


// 로그인 함수 수정 (refresh token도 함께 발급)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 잘못되었습니다.'
      });
    }

    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 잘못되었습니다.'
      });
    }

    // Access Token과 Refresh Token 생성
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Refresh Token을 데이터베이스에 저장 (선택적)
    await User.saveRefreshToken(user.id, refreshToken);

    res.status(200).json({
      success: true,
      message: '로그인이 완료되었습니다.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 토큰 갱신
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token이 필요합니다.'
      });
    }

    // Refresh Token 검증
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 refresh token입니다.'
      });
    }

    // 사용자 확인 및 저장된 토큰과 비교
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '존재하지 않는 사용자입니다.'
      });
    }

    const isValidRefreshToken = await User.verifyRefreshToken(user.id, refreshToken);
    if (!isValidRefreshToken) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 refresh token입니다.'
      });
    }

    // 새로운 Access Token 발급
    const newAccessToken = generateToken(user.id);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token이 만료되었습니다. 다시 로그인해주세요.'
      });
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: '토큰 갱신 중 오류가 발생했습니다.'
    });
  }
};

// 로그아웃 (refresh token 무효화)
const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.removeRefreshToken(userId);

    res.json({
      success: true,
      message: '로그아웃되었습니다.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: '로그아웃 처리 중 오류가 발생했습니다.'
    });
  }
};

// export 업데이트
module.exports = { 
  signup, 
  login, 
  refreshToken, 
  logout, 
  generateToken, 
  generateRefreshToken 
};