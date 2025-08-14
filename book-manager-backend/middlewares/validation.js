const validateSignup = (req, res, next) => {
  const { email, password, username } = req.body;
  const errors = [];

  // 이메일 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('유효한 이메일을 입력해주세요.');
  }

  // 비밀번호 검사 (최소 6자, 영문+숫자 포함)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  if (!password || !passwordRegex.test(password)) {
    errors.push('비밀번호는 최소 6자, 영문과 숫자를 포함해야 합니다.');
  }

  // 사용자명 검사 (2-20자, 영문/숫자/한글)
  if (!username || username.length < 2 || username.length > 20) {
    errors.push('사용자명은 2-20자 사이여야 합니다.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: '입력 데이터가 유효하지 않습니다.',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: '이메일과 비밀번호를 입력해주세요.'
    });
  }

  next();
};

module.exports = { validateSignup, validateLogin };