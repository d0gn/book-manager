const express = require('express');
const router = express.Router();
const { searchBooks, searchAndSaveBooks } = require('../controllers/bookController');
const { validateSignup, validateLogin } = require('../middlewares/validation');
const { authenticateToken } = require('../middlewares/auth');

router.get('/search', searchBooks);
router.get('/search/save', authenticateToken, searchAndSaveBooks);

module.exports = router;
