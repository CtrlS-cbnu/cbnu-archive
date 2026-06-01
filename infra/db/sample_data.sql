-- CBNU Archive sample seed data
-- 실행 전 Flyway 마이그레이션으로 기본 테이블이 생성되어 있어야 한다.

INSERT INTO projects (
    title,
    summary,
    description,
    readme,
    project_year,
    semester,
    difficulty,
    domain,
    is_team,
    status,
    visibility,
    author_id,
    created_at,
    updated_at
)
SELECT
    'CBNU Archive',
    '충북대학교 학생 프로젝트 산출물을 저장하고 검색하는 아카이브 서비스',
    '프로젝트 파일, README, 기술스택, 메타데이터를 저장하고 자연어 기반 검색과 추천 기능을 제공하는 웹 서비스이다.',
    '# CBNU Archive

React, Spring Boot, FastAPI, PostgreSQL, pgvector를 활용한 프로젝트 아카이브 시스템입니다.',
    2026,
    '1학기',
    'MEDIUM',
    'Web/AI',
    TRUE,
    'APPROVED',
    'PUBLIC',
    1,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE title = 'CBNU Archive'
);

INSERT INTO project_tech_stack (project_id, tech_stack)
SELECT p.id, v.tech_stack
FROM projects p
CROSS JOIN (
    VALUES
    ('React'),
    ('Spring Boot'),
    ('FastAPI'),
    ('PostgreSQL'),
    ('pgvector')
) AS v(tech_stack)
WHERE p.title = 'CBNU Archive'
AND NOT EXISTS (
    SELECT 1
    FROM project_tech_stack pts
    WHERE pts.project_id = p.id
    AND pts.tech_stack = v.tech_stack
);

INSERT INTO project_files (
    file_name,
    file_type,
    size,
    storage_key,
    uploaded_at,
    project_id
)
SELECT
    'cbnu-archive-report.pdf',
    'PDF',
    1024000,
    'projects/1/cbnu-archive-report.pdf',
    NOW(),
    p.id
FROM projects p
WHERE p.title = 'CBNU Archive'
ON CONFLICT (storage_key) DO NOTHING;

INSERT INTO project_vectors (
    project_id,
    embedding,
    metadata
)
SELECT
    p.id,
    ('[' || array_to_string(array_fill(0.01::float, ARRAY[384]), ',') || ']')::vector,
    '{"title": "CBNU Archive", "domain": "Web/AI", "year": 2026}'::jsonb
FROM projects p
WHERE p.title = 'CBNU Archive'
ON CONFLICT (project_id) DO NOTHING;