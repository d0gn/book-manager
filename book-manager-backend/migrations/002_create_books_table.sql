CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    google_books_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    authors TEXT[], -- PostgreSQL 배열 타입
    description TEXT,
    published_date DATE,
    page_count INTEGER,
    image_url TEXT,
    isbn_10 VARCHAR(10),
    isbn_13 VARCHAR(13),
    language VARCHAR(10) DEFAULT 'en',
    publisher VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_books_google_id ON books(google_books_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_books_updated_at BEFORE UPDATE
    ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();