const express = require('express');
const router = express.Router();
const { signup, login, refreshToken, logout } = require('../controllers/authController');
const { getMyProfile, updateProfile, changePassword } = require('../controllers/userController');
const { validateSignup, validateLogin } = require('../middlewares/validation');
const { authenticateToken } = require('../middlewares/auth');

// 인증 관련
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticateToken, logout);

// 사용자 정보 관련
router.get('/me', authenticateToken, getMyProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, changePassword);

module.exports = router;