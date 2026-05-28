-- ============================================================
-- V2__add_vector_store.sql  :  pgvector 확장 및 벡터 저장소 테이블
-- ============================================================
-- 사전 조건: PostgreSQL 서버에 pgvector 확장이 설치되어 있어야 합니다.
--   설치 명령: CREATE EXTENSION vector;  (슈퍼유저 권한 필요)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- 프로젝트 임베딩 벡터 저장 테이블
-- dimension: 384  (sentence-transformers/all-MiniLM-L6-v2 기본값)
-- AI 서비스 모델 변경 시 dimension을 맞춰 새 마이그레이션 작성 필요
CREATE TABLE project_vectors (
    project_id BIGINT  PRIMARY KEY REFERENCES projects (id) ON DELETE CASCADE,
    embedding  vector(384)          NOT NULL,
    metadata   JSONB
);

-- HNSW 인덱스 (코사인 유사도 기준, pgvector 0.5.0 이상 필요)
-- 소규모 데이터셋에서는 인덱스 없이도 동작하므로 서버 버전 확인 후 적용
CREATE INDEX idx_project_vectors_hnsw
    ON project_vectors
    USING hnsw (embedding vector_cosine_ops);
