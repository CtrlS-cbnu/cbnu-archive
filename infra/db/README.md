# DB Sample Data

PostgreSQL + pgvector 기반 로컬 DB 검증을 위한 샘플 데이터입니다.

## 실행 전 조건

- Docker Compose로 PostgreSQL 컨테이너가 실행되어 있어야 합니다.
- Spring Boot 백엔드를 prod 프로필로 실행하여 Flyway 마이그레이션이 적용되어 있어야 합니다.
- 기본 관리자 계정 `admin@cbnu.ac.kr`이 존재해야 합니다.

## 실행 방법

CMD에서 실행하는 경우:

```cmd
docker exec -i ctrls-postgres psql -U postgres -d ctrls_archive < infra/db/sample_data.sql
```

PowerShell에서 리다이렉션이 동작하지 않는 경우:

```powershell
Get-Content infra/db/sample_data.sql | docker exec -i ctrls-postgres psql -U postgres -d ctrls_archive
```

## 확인 쿼리

프로젝트 기본 데이터 확인:

```sql
SELECT id, title, project_year, semester, domain, status, visibility, author_id
FROM projects;
```

프로젝트 기술스택 확인:

```sql
SELECT p.id, p.title, pts.tech_stack
FROM projects p
JOIN project_tech_stack pts
ON p.id = pts.project_id
ORDER BY p.id;
```

프로젝트 파일 메타데이터 확인:

```sql
SELECT pf.id, pf.file_name, pf.file_type, pf.size, p.title
FROM project_files pf
JOIN projects p
ON pf.project_id = p.id;
```

pgvector 유사도 검색 확인:

```sql
SELECT
    project_id,
    metadata,
    embedding <=> ('[' || array_to_string(array_fill(0.01::float, ARRAY[384]), ',') || ']')::vector AS distance
FROM project_vectors
ORDER BY distance
LIMIT 3;
```