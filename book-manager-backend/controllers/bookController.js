// controllers/bookController.js
const { searchGoogleBooks } = require('../utils/googleBooks');
const Book = require('../models/Books');

// Google Books API 검색
exports.searchBooks = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: '검색어(q)는 필수입니다.' });
    }

    const results = await searchGoogleBooks(query);
    res.json(results);
  } catch (error) {
    next(error);
  }
};

// Google Books API 검색 + DB 저장
exports.searchAndSaveBooks = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: '검색어(q)는 필수입니다.' });
    }

    const apiResults = await searchGoogleBooks(query);
    const savedBooks = [];

    for (const bookData of apiResults) {
      const saved = await Book.createOrUpdate(bookData);
      savedBooks.push(saved);
    }

    res.json(savedBooks);
  } catch (error) {
    next(error);
  }
};
