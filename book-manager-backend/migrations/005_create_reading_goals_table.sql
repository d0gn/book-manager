-- 독서 목표 테이블 (추가 기능)
CREATE TABLE IF NOT EXISTS reading_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    target_books INTEGER NOT NULL CHECK (target_books > 0),
    current_books INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 한 사용자당 연도별로 하나의 목표만
    UNIQUE(user_id, year)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_reading_goals_user_year ON reading_goals(user_id, year);

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_reading_goals_updated_at BEFORE UPDATE
    ON reading_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();