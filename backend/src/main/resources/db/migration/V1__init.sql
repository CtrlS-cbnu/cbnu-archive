-- ============================================================
-- V1__init.sql  :  cbnu-archive 초기 스키마
-- ============================================================

-- ── users ──────────────────────────────────────────────────
CREATE TABLE users (
    id             BIGSERIAL    PRIMARY KEY,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    name           VARCHAR(100) NOT NULL,
    student_number VARCHAR(50)  UNIQUE,
    role           VARCHAR(20)  NOT NULL DEFAULT 'USER',
    status         VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email  ON users (email);
CREATE INDEX idx_users_status ON users (status);

-- ── projects ───────────────────────────────────────────────
CREATE TABLE projects (
    id           BIGSERIAL    PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    summary      TEXT,
    description  TEXT,
    readme       TEXT,
    project_year INTEGER,
    semester     VARCHAR(20),
    difficulty   VARCHAR(20),
    domain       VARCHAR(100),
    is_team      BOOLEAN,
    status       VARCHAR(30)  NOT NULL DEFAULT 'PENDING_APPROVAL',
    visibility   VARCHAR(30),
    author_id    BIGINT       NOT NULL REFERENCES users (id),
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_author_id    ON projects (author_id);
CREATE INDEX idx_projects_status       ON projects (status);
CREATE INDEX idx_projects_project_year ON projects (project_year);
CREATE INDEX idx_projects_domain       ON projects (domain);

-- ── project_tech_stack ─────────────────────────────────────
CREATE TABLE project_tech_stack (
    project_id BIGINT       NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    tech_stack VARCHAR(100) NOT NULL
);

CREATE INDEX idx_pts_project_id ON project_tech_stack (project_id);

-- ── project_files ──────────────────────────────────────────
CREATE TABLE project_files (
    id          BIGSERIAL    PRIMARY KEY,
    file_name   VARCHAR(255) NOT NULL,
    file_type   VARCHAR(20)  NOT NULL,
    size        BIGINT       NOT NULL,
    storage_key VARCHAR(500) NOT NULL UNIQUE,
    uploaded_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    project_id  BIGINT       NOT NULL REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX idx_project_files_project_id ON project_files (project_id);

-- ── audit_logs ─────────────────────────────────────────────
CREATE TABLE audit_logs (
    id            BIGSERIAL    PRIMARY KEY,
    actor_user_id BIGINT,
    action        VARCHAR(100) NOT NULL,
    entity_type   VARCHAR(100),
    entity_id     BIGINT,
    detail        VARCHAR(1000),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs (actor_user_id);
CREATE INDEX idx_audit_logs_created_at    ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_entity        ON audit_logs (entity_type, entity_id);

-- ── 초기 ADMIN 계정 ─────────────────────────────────────────
-- password: admin1234  (BCrypt $2a$10$ 해시)
-- 운영 배포 전 반드시 비밀번호를 변경하세요.
INSERT INTO users (email, password, name, student_number, role, status, created_at, updated_at)
VALUES (
    'admin@cbnu.ac.kr',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOwhFZ0.m/DM8DjKMGZ5r6j3Ky7.iy5mS',
    '시스템 관리자',
    NULL,
    'ADMIN',
    'ACTIVE',
    NOW(),
    NOW()
);
