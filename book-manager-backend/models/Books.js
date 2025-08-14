// models/Book.js
const pool = require('../config/database'); // pg.Pool 인스턴스


function parsePublishedDate(dateStr) {
  if (!dateStr) return null;
  if (/^\d{4}$/.test(dateStr)) {
    // 연도만 있으면 1월 1일로 변환
    return `${dateStr}-01-01`;
  }
  return dateStr; // YYYY-MM-DD 혹은 그 외 포맷은 그대로
}


class Book {
    constructor(data) {
        this.id = data.id;
        this.google_books_id = data.google_books_id;
        this.title = data.title;
        this.authors = data.authors;
        this.description = data.description;
        this.published_date = data.published_date;
        this.page_count = data.page_count;
        this.image_url = data.image_url;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Google Books API → Book 데이터 변환
    static fromGoogleBooksAPI(googleBookItem) {
        const volumeInfo = googleBookItem.volumeInfo || {};
        const imageLinks = volumeInfo.imageLinks || {};

        return {
            google_books_id: googleBookItem.id,
            title: volumeInfo.title || 'Unknown Title',
            authors: volumeInfo.authors || [],
            description: volumeInfo.description || null,
            published_date: volumeInfo.publishedDate || null,
            page_count: volumeInfo.pageCount || null,
            image_url: imageLinks.thumbnail || imageLinks.smallThumbnail || null
        };
    }

    // Google Books ID로 찾기
    static async findByGoogleId(googleBooksId) {
        const result = await pool.query(
            'SELECT * FROM books WHERE google_books_id = $1 LIMIT 1',
            [googleBooksId]
        );
        return result.rows.length ? new Book(result.rows[0]) : null;
    }

    // 제목 검색
    static async searchByTitle(title, limit = 10, offset = 0) {
        const result = await pool.query(
            `SELECT * FROM books 
             WHERE title ILIKE $1
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
            [`%${title}%`, limit, offset]
        );
        return result.rows.map(row => new Book(row));
    }

    // 생성 또는 업데이트
    static async createOrUpdate(bookData) {
        const existing = await this.findByGoogleId(bookData.google_books_id);
        const authors = bookData.authors || [];
        const publishedDate = parsePublishedDate(bookData.published_date);

        if (existing) {
            const updated = await pool.query(
                `UPDATE books 
                SET title = $1, authors = $2, description = $3, 
                    published_date = $4, page_count = $5, image_url = $6, updated_at = NOW()
                WHERE google_books_id = $7
                RETURNING *`,
                [
                    bookData.title,
                    authors,  // 배열 그대로 넘김
                    bookData.description,
                    publishedDate,
                    bookData.page_count,
                    bookData.image_url,
                    bookData.google_books_id
                ]
            );
            return new Book(updated.rows[0]);
        } else {
            const inserted = await pool.query(
                `INSERT INTO books 
                (google_books_id, title, authors, description, published_date, page_count, image_url, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                RETURNING *`,
                [
                    bookData.google_books_id,
                    bookData.title,
                    authors,  // 배열 그대로 넘김
                    bookData.description,
                    publishedDate,
                    bookData.page_count,
                    bookData.image_url
                ]
            );
            return new Book(inserted.rows[0]);
        }
    }
}

module.exports = Book;
