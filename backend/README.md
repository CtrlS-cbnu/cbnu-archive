# CBNU Archive - Backend

CBNU ARCHIVE 백엔드 서버
---

## 🛠 기술 스택

- **Language**: Java 21
- **Framework**: Spring Boot 3.5.x
- **Build**: Gradle
- **Persistence**: Spring Data JPA, H2 (개발), PostgreSQL (운영 예정)
- **Security**: Spring Security, JWT (jjwt 0.12.5)
- **API Docs**: springdoc-openapi (Swagger UI)
- **External (예정)**: MinIO (파일 저장), OpenSearch (검색), Claude API (LLM), FastAPI (임베딩)

---

## 🏗 아키텍처

**헥사고날(Port-Adapter) 아키텍처**를 적용해 외부 의존성(DB, AI, 검색엔진, 파일스토리지)을 모두 인터페이스로 추상화했습니다.
이를 통해 실제 구현체가 미정인 상태에서도 Mock 어댑터로 전체 흐름을 검증할 수 있으며, 추후 PostgreSQL/OpenSearch/Claude 등 확정 시 어댑터만 교체하면 됩니다.

### Port (인터페이스)
- `FileStoragePort` - 파일 업로드/다운로드
- `ProjectSearchPort` - 키워드 기반 검색
- `VectorSearchPort` - 임베딩 기반 유사도 검색
- `EmbeddingPort` - 텍스트 → 벡터 변환
- `AiRecommendationPort` - 자연어 질의 → RAG 추천
- `AiSummaryPort` - 프로젝트 자동 요약

### Adapter
- 현재: Mock 어댑터 (인메모리, 더미 데이터)
- 추후: MinIO / OpenSearch / Claude / FastAPI 어댑터

---

## 📁 패키지 구조
com.ctrl.cbnu_archive
├── auth/          # 회원가입, 로그인, JWT
├── user/          # 사용자 정보, 마이페이지
├── project/       # 프로젝트 CRUD, 검색, AI 추천
│   └── service/
│       ├── port/      # 외부 의존성 인터페이스
│       └── adapter/   # 구현체 (mock/실제)
├── file/          # 파일 업로드/다운로드
├── admin/         # 관리자 기능 (예정)
└── global/        # 공통 영역
├── config/        # Spring 설정 (Security, Swagger, CORS 등)
├── exception/     # 커스텀 예외, GlobalExceptionHandler
├── response/      # ApiResponse 공통 응답
├── security/      # JWT 필터, UserDetails
└── common/        # BaseTimeEntity 등

---

## 🚀 실행 방법

### 1. 사전 요구사항
- Java 21 이상
- Gradle (포함된 wrapper 사용 권장)

### 2. 클론 및 실행

```bash
git clone <repo-url>
cd cbnu-archive/backend

# 컴파일
./gradlew compileJava

# 서버 실행 (기본 포트 8080)
./gradlew bootRun
```

### 3. 접속

| 항목 | URL |
|---|---|
| Swagger API 문서 | http://localhost:8080/swagger-ui/index.html |
| H2 DB 콘솔 | http://localhost:8080/h2-console |
| API Base | http://localhost:8080/api/v1 |

H2 콘솔 접속 시:
- JDBC URL: 서버 로그의 `jdbc:h2:mem:xxxxx` 그대로 입력
- Username: `sa`
- Password: (비워둠)

---

## ⚙️ 환경 설정

`application.yml`의 주요 설정:

```yaml
app:
  adapter:
    storage: mock          # mock | minio
    search: mock           # mock | opensearch
    vector: mock           # mock | qdrant
    embedding: mock        # mock | fastapi
    ai-recommendation: mock # mock | claude
    ai-summary: mock       # mock | claude

jwt:
  secret: <Base64 인코딩된 시크릿 키>
  access-token-expiry: 1800000      # 30분
  refresh-token-expiry: 1209600000  # 14일
```

각 어댑터를 `mock` → 실제 값으로 바꾸면 운영 환경으로 전환됩니다.

---

## 📡 주요 API

### Auth
- `POST /api/v1/auth/signup` - 회원가입
- `POST /api/v1/auth/login` - 로그인 (JWT 발급)
- `POST /api/v1/auth/reissue` - 토큰 재발급

### User
- `GET /api/v1/users/me` - 내 정보
- `PATCH /api/v1/users/me` - 내 정보 수정
- `PATCH /api/v1/users/me/password` - 비밀번호 변경
- `GET /api/v1/users/me/projects` - 내가 올린 프로젝트

### Project
- `GET /api/v1/projects` - 프로젝트 목록 검색
- `GET /api/v1/projects/{id}` - 프로젝트 상세
- `POST /api/v1/projects` - 프로젝트 등록
- `PATCH /api/v1/projects/{id}` - 프로젝트 수정
- `DELETE /api/v1/projects/{id}` - 프로젝트 삭제
- `POST /api/v1/projects/recommend` - 자연어 기반 AI 추천 (RAG)

### File
- `POST /api/v1/files/projects/{projectId}/upload` - 파일 업로드
- `GET /api/v1/files/projects/{projectId}` - 프로젝트의 파일 목록
- `GET /api/v1/files/{fileId}/download` - 다운로드 URL 발급
- `DELETE /api/v1/files/{fileId}` - 파일 삭제

자세한 요청/응답 스펙은 Swagger UI에서 확인할 수 있습니다.

---

## 🔐 인증

JWT 기반 stateless 인증입니다.

1. `/api/v1/auth/login` 으로 로그인 → `accessToken`, `refreshToken` 받음
2. 이후 요청 시 헤더에 `Authorization: Bearer <accessToken>` 추가
3. Swagger UI에서 우측 상단 **Authorize** 버튼 클릭 후 토큰 입력하면 자동 적용
