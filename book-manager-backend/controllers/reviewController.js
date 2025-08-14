// controllers/reviewController.js
const Review = require('../models/Reviews');

exports.getAllReviews = async (req, res) => {
  try {
    const { user_id, book_id } = req.query;
    const reviews = await Review.getAll({
      user_id: user_id ? parseInt(user_id, 10) : undefined,
      book_id: book_id ? parseInt(book_id, 10) : undefined
    });
    res.json(reviews);
  } catch (err) {
    console.error('리뷰 목록 조회 오류:', err);
    res.status(500).json({ error: '리뷰 목록을 가져오는데 실패했습니다.' });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: '리뷰를 찾을 수 없습니다.' });
    }
    res.json(review);
  } catch (err) {
    console.error('리뷰 조회 오류:', err);
    res.status(500).json({ error: '리뷰를 가져오는데 실패했습니다.' });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { user_id, book_id, rating, title, content, is_spoiler } = req.body;

    if (!user_id || !book_id || !rating) {
      return res.status(400).json({ error: 'user_id, book_id, rating은 필수입니다.' });
    }

    const review = await Review.create({
      user_id,
      book_id,
      rating,
      title,
      content,
      is_spoiler
    });

    res.status(201).json(review);
  } catch (err) {
    console.error('리뷰 생성 오류:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: '이미 해당 책에 대한 리뷰를 작성했습니다.' });
    }
    res.status(500).json({ error: '리뷰 작성에 실패했습니다.' });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, title, content, is_spoiler } = req.body;
    const updatedReview = await Review.update(req.params.id, {
      rating,
      title,
      content,
      is_spoiler
    });

    if (!updatedReview) {
      return res.status(404).json({ error: '리뷰를 찾을 수 없습니다.' });
    }
    res.json(updatedReview);
  } catch (err) {
    console.error('리뷰 수정 오류:', err);
    res.status(500).json({ error: '리뷰 수정에 실패했습니다.' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const success = await Review.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: '리뷰를 찾을 수 없습니다.' });
    }
    res.json({ message: '리뷰가 삭제되었습니다.' });
  } catch (err) {
    console.error('리뷰 삭제 오류:', err);
    res.status(500).json({ error: '리뷰 삭제에 실패했습니다.' });
  }
};

exports.incrementHelpfulCount = async (req, res) => {
  try {
    const updatedReview = await Review.incrementHelpfulCount(req.params.id);
    if (!updatedReview) {
      return res.status(404).json({ error: '리뷰를 찾을 수 없습니다.' });
    }
    res.json(updatedReview);
  } catch (err) {
    console.error('도움이 돼요 증가 오류:', err);
    res.status(500).json({ error: '도움이 돼요 증가에 실패했습니다.' });
  }
};

// module.exports = {
//     getAllReviews,
//     getReviewById,
//     createReview,
//     updateReview,
//     deleteReview,
//     incrementHelpfulCount
// };