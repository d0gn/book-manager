// controllers/userBooksController.js
const UserBooks = require('../models/User-Books');

// 내 서재에 책 추가
exports.addBook = async (req, res, next) => {
  try {
    const { user_id, book_id, status, started_date, completed_date, progress, notes } = req.body;
    if (!user_id || !book_id) {
      return res.status(400).json({ message: 'user_id와 book_id는 필수입니다.' });
    }

    // 중복 체크
    const existing = await UserBooks.findByUserAndBook(user_id, book_id);
    if (existing) {
      return res.status(409).json({ message: '이미 내 서재에 존재하는 책입니다.' });
    }

    const newEntry = await UserBooks.add({ user_id, book_id, status, started_date, completed_date, progress, notes });
    res.status(201).json(newEntry);
  } catch (error) {
    next(error);
  }
};

// 내 서재에서 책 삭제
exports.deleteBook = async (req, res, next) => {
  try {
    const { user_id, book_id } = req.body;
    if (!user_id || !book_id) {
      return res.status(400).json({ message: 'user_id와 book_id는 필수입니다.' });
    }

    const deleted = await UserBooks.delete(user_id, book_id);
    if (!deleted) {
      return res.status(404).json({ message: '해당 책을 내 서재에서 찾을 수 없습니다.' });
    }

    res.json({ message: '내 서재에서 책이 삭제되었습니다.', deleted });
  } catch (error) {
    next(error);
  }
};

// 내 서재 책 상태 및 기타 정보 업데이트
exports.updateBook = async (req, res, next) => {
  try {
    const { user_id, book_id, status, started_date, completed_date, progress, notes } = req.body;
    if (!user_id || !book_id) {
      return res.status(400).json({ message: 'user_id와 book_id는 필수입니다.' });
    }

    const updated = await UserBooks.updateStatus({ user_id, book_id, status, started_date, completed_date, progress, notes });
    if (!updated) {
      return res.status(404).json({ message: '내 서재에서 해당 책을 찾을 수 없습니다.' });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// 내 서재 조회 (상태별 필터 가능)
exports.getUserBooks = async (req, res, next) => {
  try {
    const user_id = parseInt(req.query.user_id);
    const status = req.query.status; // 선택적

    if (!user_id) {
      return res.status(400).json({ message: 'user_id는 필수 쿼리 파라미터입니다.' });
    }

    const books = await UserBooks.findByUser(user_id, status);
    res.json(books);
  } catch (error) {
    next(error);
  }
};
