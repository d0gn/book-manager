// routes/reviews.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken, requireOwnership } = require('../middlewares/auth');

// 📌 전체 리뷰 or 필터링 조회
router.get('/', reviewController.getAllReviews);

// 📌 특정 리뷰 조회
router.get('/:id', reviewController.getReviewById);

// 📌 리뷰 작성
router.post('/', authenticateToken, reviewController.createReview);

// 📌 리뷰 수정
router.put('/:id', authenticateToken, requireOwnership, reviewController.updateReview);

// 📌 리뷰 삭제
router.delete('/:id', authenticateToken, requireOwnership, reviewController.deleteReview);

// 📌 도움이 돼요 증가
router.post('/:id/helpful', authenticateToken, reviewController.incrementHelpfulCount);

module.exports = router;
