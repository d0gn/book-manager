// utils/googleBooks.js
const axios = require('axios');
const Book = require('../models/Books');

const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Google Books API 검색
 * @param {string} query - 검색어
 * @param {number} maxResults - 최대 결과 수
 */
async function searchGoogleBooks(query, maxResults = 10) {
  const response = await axios.get(GOOGLE_BOOKS_BASE_URL, {
    params: {
      q: query,
      key: process.env.GOOGLE_BOOKS_API_KEY,
      maxResults
    }
  });

  // API 결과 → Book 모델 형식으로 변환
  return response.data.items.map(item => Book.fromGoogleBooksAPI(item));
}

module.exports = { searchGoogleBooks };
