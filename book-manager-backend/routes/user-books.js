const express = require('express');
const router = express.Router();
const userBooksController = require('../controllers/userBooksController');
const { authenticateToken } = require('../middlewares/auth');

router.post('/add', authenticateToken, userBooksController.addBook);
router.delete('/delete', authenticateToken, userBooksController.deleteBook);
router.patch('/update', authenticateToken, userBooksController.updateBook);
router.get('/read', authenticateToken, userBooksController.getUserBooks);

module.exports = router;
