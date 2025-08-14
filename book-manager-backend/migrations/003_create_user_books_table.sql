-- 독서 상태 ENUM 타입 생성
CREATE TYPE reading_status AS ENUM ('want_to_read', 'reading', 'completed');

CREATE TABLE IF NOT EXISTS user_books (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    status reading_status NOT NULL DEFAULT 'want_to_read',
    started_date DATE,
    completed_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 한 사용자가 같은 책을 중복으로 추가할 수 없도록
    UNIQUE(user_id, book_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_books_user_id ON user_books(user_id);
CREATE INDEX IF NOT EXISTS idx_user_books_book_id ON user_books(book_id);
CREATE INDEX IF NOT EXISTS idx_user_books_status ON user_books(status);

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_user_books_updated_at BEFORE UPDATE
    ON user_books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 완료 날짜 자동 설정 트리거
CREATE OR REPLACE FUNCTION set_completed_date()
RETURNS TRIGGER AS $$
BEGIN
    -- 상태가 completed로 변경되면 completed_date 자동 설정
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_date = CURRENT_DATE;
    END IF;
    
    -- 상태가 reading으로 변경되고 started_date가 없으면 자동 설정
    IF NEW.status = 'reading' AND OLD.status = 'want_to_read' AND NEW.started_date IS NULL THEN
        NEW.started_date = CURRENT_DATE;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_user_books_dates BEFORE UPDATE
    ON user_books FOR EACH ROW EXECUTE FUNCTION set_completed_date();