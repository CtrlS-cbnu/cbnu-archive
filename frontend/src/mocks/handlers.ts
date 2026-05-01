import { http, HttpResponse } from 'msw'
import type { BackendProjectResponse, BackendPage } from '@/types/project'

// ---------------------------------------------------------------------------
// Helper: wrap data in the same ApiResponse envelope that the real backend sends
// ---------------------------------------------------------------------------
function ok<T>(data: T) {
  return HttpResponse.json({ success: true, message: 'OK', data, errorCode: null })
}

// ---------------------------------------------------------------------------
// Shared mock data  — shaped as BackendProjectResponse (backend's actual DTO)
// ---------------------------------------------------------------------------

const MOCK_BACKEND: BackendProjectResponse[] = [
  {
    id: 1,
    title: 'React 기반 강의 평가 플랫폼',
    summary: '학생들이 익명으로 강의를 평가하고 정보를 공유하는 웹 서비스',
    description: 'React와 Spring Boot를 사용하여 제작한 강의 평가 플랫폼입니다.',
    readme: '',
    year: 2024,
    semester: 'FIRST',
    techStacks: ['React', 'TypeScript', 'Spring Boot', 'MySQL'],
    difficulty: '중급',
    domain: '웹프로그래밍',
    authorId: 1,
    authorName: '코딩마스터즈',
    createdAt: '2024-06-01T12:00:00Z',
    updatedAt: '2024-06-01T12:00:00Z',
  },
  {
    id: 2,
    title: 'FastAPI + PyTorch 감성 분석 API',
    summary: '한국어 리뷰 텍스트의 긍/부정을 분류하는 REST API 서버',
    description: 'HuggingFace BERT 기반 한국어 감성분석 모델을 FastAPI로 서빙합니다.',
    readme: '',
    year: 2024,
    semester: 'FIRST',
    techStacks: ['Python', 'FastAPI', 'PyTorch', 'HuggingFace'],
    difficulty: '고급',
    domain: '인공지능',
    authorId: 2,
    authorName: '이서연',
    createdAt: '2024-06-10T09:00:00Z',
    updatedAt: '2024-06-10T09:00:00Z',
  },
  {
    id: 3,
    title: '모바일 캘린더 + Todo 앱',
    summary: '일정 관리와 할일 목록을 통합한 React Native 모바일 앱',
    description: 'React Native와 Expo를 사용하여 제작한 일정/할일 통합 앱입니다.',
    readme: '',
    year: 2023,
    semester: 'SECOND',
    techStacks: ['React Native', 'Expo', 'Firebase'],
    difficulty: '초급',
    domain: '모바일프로그래밍',
    authorId: 3,
    authorName: '넷이서하나',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 4,
    title: 'Spring Boot + PostgreSQL 도서관 관리 시스템',
    summary: '도서 대출/반납, 회원 관리, 연체료 계산 기능을 갖춘 관리 시스템',
    description: 'Spring Boot와 PostgreSQL을 사용한 도서관 관리 시스템입니다.',
    readme: '',
    year: 2024,
    semester: 'SECOND',
    techStacks: ['Spring Boot', 'Java', 'PostgreSQL', 'Thymeleaf'],
    difficulty: '중급',
    domain: '데이터베이스',
    authorId: 4,
    authorName: '쿼리마스터',
    createdAt: '2024-12-10T08:00:00Z',
    updatedAt: '2024-12-10T08:00:00Z',
  },
  {
    id: 5,
    title: 'YOLOv8 기반 교내 마스크 착용 감지 시스템',
    summary: '실시간 CCTV 영상에서 마스크 미착용자를 감지하고 알림을 전송하는 AI 시스템',
    description: 'YOLOv8과 OpenCV를 사용한 실시간 마스크 감지 시스템입니다.',
    readme: '',
    year: 2023,
    semester: 'FIRST',
    techStacks: ['Python', 'YOLOv8', 'OpenCV', 'FastAPI'],
    difficulty: '고급',
    domain: '컴퓨터비전',
    authorId: 5,
    authorName: '비전팀',
    createdAt: '2023-06-20T14:00:00Z',
    updatedAt: '2023-06-20T14:00:00Z',
  },
  {
    id: 6,
    title: 'Next.js + Supabase 중고 거래 플랫폼',
    summary: '교내 학생 간 중고 물품 거래를 위한 실시간 채팅 포함 마켓플레이스',
    description: 'Next.js와 Supabase를 사용한 중고 거래 플랫폼입니다.',
    readme: '',
    year: 2025,
    semester: 'FIRST',
    techStacks: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    difficulty: '중급',
    domain: '캡스톤디자인',
    authorId: 6,
    authorName: '마켓팀',
    createdAt: '2025-06-05T10:00:00Z',
    updatedAt: '2025-06-05T10:00:00Z',
  },
  {
    id: 7,
    title: 'Flutter 헬스케어 걸음수 트래커',
    summary: '걸음수, 칼로리, 이동 경로를 기록하고 주간 리포트를 제공하는 크로스플랫폼 앱',
    description: 'Flutter와 Firebase를 사용한 헬스케어 트래커 앱입니다.',
    readme: '',
    year: 2024,
    semester: 'SECOND',
    techStacks: ['Flutter', 'Dart', 'Firebase', 'Google Maps API'],
    difficulty: '중급',
    domain: '모바일프로그래밍',
    authorId: 7,
    authorName: '박지훈',
    createdAt: '2024-12-18T09:30:00Z',
    updatedAt: '2024-12-18T09:30:00Z',
  },
  {
    id: 8,
    title: 'GPT-4 활용 코드 리뷰 자동화 도구',
    summary: 'GitHub PR에 올라온 코드를 자동으로 분석하여 리뷰 코멘트를 생성하는 CLI 도구',
    description: 'OpenAI GPT-4를 활용한 자동 코드 리뷰 도구입니다.',
    readme: '',
    year: 2025,
    semester: 'FIRST',
    techStacks: ['Python', 'OpenAI API', 'GitHub Actions', 'Click'],
    difficulty: '중급',
    domain: '소프트웨어공학',
    authorId: 8,
    authorName: 'AutoReview',
    createdAt: '2025-05-30T11:00:00Z',
    updatedAt: '2025-05-30T11:00:00Z',
  },
  {
    id: 9,
    title: 'Vue.js + Django 교내 동아리 모집 게시판',
    summary: '동아리 정보 조회, 모집 공고 등록, 지원서 제출을 처리하는 원스톱 웹 서비스',
    description: 'Vue.js와 Django를 사용한 동아리 모집 게시판입니다.',
    readme: '',
    year: 2023,
    semester: 'SECOND',
    techStacks: ['Vue.js', 'Django', 'SQLite', 'Bootstrap'],
    difficulty: '초급',
    domain: '웹프레임워크',
    authorId: 9,
    authorName: '동아리팀',
    createdAt: '2023-12-05T13:00:00Z',
    updatedAt: '2023-12-05T13:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// MSW request handlers — all paths match /api/v1/... to mirror the real backend
// ---------------------------------------------------------------------------

export const handlers = [
  // GET /api/v1/projects — keyword search + filtering
  http.get('/api/v1/projects', ({ request }) => {
    const url = new URL(request.url)
    const keyword = (url.searchParams.get('keyword') ?? '').toLowerCase()
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)

    const filtered = keyword
      ? MOCK_BACKEND.filter(
          (p) =>
            p.title.toLowerCase().includes(keyword) ||
            p.summary.toLowerCase().includes(keyword) ||
            p.techStacks.some((t) => t.toLowerCase().includes(keyword)),
        )
      : MOCK_BACKEND

    const pageData: BackendPage<BackendProjectResponse> = {
      content: filtered.slice(page * size, (page + 1) * size),
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      number: page,
      size,
    }
    return ok(pageData)
  }),

  // GET /api/v1/projects/:id
  http.get('/api/v1/projects/:id', ({ params }) => {
    const id = Number(params.id)
    const found = MOCK_BACKEND.find((p) => p.id === id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return ok(found)
  }),

  // POST /api/v1/projects/recommend — natural language search mock
  http.post('/api/v1/projects/recommend', async ({ request }) => {
    const body = (await request.json()) as { query: string }
    const q = (body.query ?? '').toLowerCase()
    const matched = MOCK_BACKEND.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.techStacks.some((t) => t.toLowerCase().includes(q)),
    ).slice(0, 5)
    const results = matched.length > 0 ? matched : MOCK_BACKEND.slice(0, 5)
    return ok({
      query: body.query,
      count: results.length,
      results: results.map((p, i) => ({
        project_id: p.id,
        title: p.title,
        topic: p.domain,
        tech_stack: p.techStacks,
        keywords: [],
        difficulty: p.difficulty,
        project_type: '팀 프로젝트',
        rank: i + 1,
        final_score: parseFloat((0.95 - i * 0.08).toFixed(2)),
        reasons: [`${p.techStacks[0] ?? '관련 기술'} 사용 프로젝트`, `${p.domain} 과목 수행`],
      })),
      llm_answer: `"${body.query}"에 관련된 ${results.length}개의 프로젝트를 찾았습니다. (MSW 목 응답)`,
    })
  }),

  // POST /api/v1/auth/login
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }

    if (!body.email || !body.password) {
      return HttpResponse.json(
        { success: false, message: '이메일과 비밀번호를 입력해주세요.', data: null, errorCode: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }

    // Build a minimal mock JWT: header.payload.signature (not cryptographically valid but decodable)
    const isAdmin = body.email === 'admin@cbnu.ac.kr' && body.password === 'admin1234'
    const userId = isAdmin ? 999 : 1
    const role = isAdmin ? 'ADMIN' : 'USER'
    const payload = btoa(JSON.stringify({ sub: String(userId), email: body.email, role }))
    const mockAccessToken = `eyJhbGciOiJIUzI1NiJ9.${payload}.mock-signature`

    return ok({
      accessToken: mockAccessToken,
      refreshToken: 'mock-refresh-token',
      tokenType: 'Bearer',
    })
  }),

  // POST /api/v1/auth/reissue
  http.post('/api/v1/auth/reissue', async ({ request }) => {
    const body = (await request.json()) as { refreshToken: string }
    if (!body.refreshToken) {
      return HttpResponse.json(
        { success: false, message: '리프레시 토큰이 없습니다.', data: null, errorCode: 'INVALID_TOKEN' },
        { status: 401 },
      )
    }
    const payload = btoa(JSON.stringify({ sub: '1', email: 'user@cbnu.ac.kr', role: 'USER' }))
    return ok({
      accessToken: `eyJhbGciOiJIUzI1NiJ9.${payload}.mock-signature-refreshed`,
      refreshToken: 'mock-refresh-token',
      tokenType: 'Bearer',
    })
  }),

  // --------------------------------------------------------------------------
  // AI 서비스 mock — localhost:8000이 미실행 상태일 때 MSW가 대신 응답
  // --------------------------------------------------------------------------
  http.post('http://localhost:8000/search', async ({ request }) => {
    const body = (await request.json()) as { query: string; top_k?: number }
    const q = (body.query ?? '').toLowerCase()
    const topK = body.top_k ?? 5

    const matched = MOCK_BACKEND.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.techStacks.some((t) => t.toLowerCase().includes(q)),
    ).slice(0, topK)
    const results = matched.length > 0 ? matched : MOCK_BACKEND.slice(0, topK)

    return HttpResponse.json({
      query: body.query,
      count: results.length,
      results: results.map((p, i) => ({
        project_id: p.id,
        title: p.title,
        topic: p.domain,
        tech_stack: p.techStacks,
        keywords: [],
        difficulty: p.difficulty,
        project_type: '팀 프로젝트',
        rank: i + 1,
        final_score: parseFloat((0.95 - i * 0.08).toFixed(2)),
        reasons: [
          `${p.techStacks[0] ?? '관련 기술'} 사용 프로젝트`,
          `${p.domain} 과목 수행`,
        ],
      })),
      llm_answer: `"${body.query}"에 관련된 ${results.length}개의 프로젝트를 찾았습니다. (MSW 목 응답)`,
    })
  }),
]
