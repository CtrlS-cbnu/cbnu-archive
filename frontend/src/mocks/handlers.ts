import { http, HttpResponse } from 'msw'
import type { ProjectSummary, ProjectDetail } from '@/types/project'
import type { PagedResponse } from '@/types/project'

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

const MOCK_PROJECTS: ProjectSummary[] = [
  {
    id: 1,
    title: 'React 기반 강의 평가 플랫폼',
    summary: '학생들이 익명으로 강의를 평가하고 정보를 공유하는 웹 서비스',
    year: 2024,
    semester: 1,
    subjectName: '웹프로그래밍',
    teamName: '코딩마스터즈',
    techStacks: ['React', 'TypeScript', 'Spring Boot', 'MySQL'],
    tags: ['웹', '평가', '익명'],
    status: 'APPROVED',
    viewCount: 142,
    downloadCount: 23,
    createdAt: '2024-06-01T12:00:00Z',
  },
  {
    id: 2,
    title: 'FastAPI + PyTorch 감성 분석 API',
    summary: '한국어 리뷰 텍스트의 긍/부정을 분류하는 REST API 서버',
    year: 2024,
    semester: 1,
    subjectName: '인공지능',
    teamName: '',
    techStacks: ['Python', 'FastAPI', 'PyTorch', 'HuggingFace'],
    tags: ['NLP', '감성분석'],
    status: 'APPROVED',
    viewCount: 88,
    downloadCount: 17,
    createdAt: '2024-06-10T09:00:00Z',
  },
  {
    id: 3,
    title: '모바일 캘린더 + Todo 앱',
    summary: '일정 관리와 할일 목록을 통합한 React Native 모바일 앱',
    year: 2023,
    semester: 2,
    subjectName: '모바일프로그래밍',
    teamName: '넷이서하나',
    techStacks: ['React Native', 'Expo', 'Firebase'],
    tags: ['모바일', '일정관리'],
    status: 'APPROVED',
    viewCount: 61,
    downloadCount: 9,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 4,
    title: 'Spring Boot + PostgreSQL 도서관 관리 시스템',
    summary: '도서 대출/반납, 회원 관리, 연체료 계산 기능을 갖춘 관리 시스템',
    year: 2024,
    semester: 2,
    subjectName: '데이터베이스',
    teamName: '쿼리마스터',
    techStacks: ['Spring Boot', 'Java', 'PostgreSQL', 'Thymeleaf'],
    tags: ['백엔드', '관리시스템', 'CRUD'],
    status: 'APPROVED',
    viewCount: 75,
    downloadCount: 12,
    createdAt: '2024-12-10T08:00:00Z',
  },
  {
    id: 5,
    title: 'YOLOv8 기반 교내 마스크 착용 감지 시스템',
    summary: '실시간 CCTV 영상에서 마스크 미착용자를 감지하고 알림을 전송하는 AI 시스템',
    year: 2023,
    semester: 1,
    subjectName: '컴퓨터비전',
    teamName: '비전팀',
    techStacks: ['Python', 'YOLOv8', 'OpenCV', 'FastAPI'],
    tags: ['컴퓨터비전', 'AI', '객체감지'],
    status: 'APPROVED',
    viewCount: 203,
    downloadCount: 45,
    createdAt: '2023-06-20T14:00:00Z',
  },
  {
    id: 6,
    title: 'Next.js + Supabase 중고 거래 플랫폼',
    summary: '교내 학생 간 중고 물품 거래를 위한 실시간 채팅 포함 마켓플레이스',
    year: 2025,
    semester: 1,
    subjectName: '캡스톤디자인',
    teamName: '마켓팀',
    techStacks: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    tags: ['캡스톤', '실시간', '거래'],
    status: 'APPROVED',
    viewCount: 317,
    downloadCount: 58,
    createdAt: '2025-06-05T10:00:00Z',
  },
  {
    id: 7,
    title: 'Flutter 헬스케어 걸음수 트래커',
    summary: '걸음수, 칼로리, 이동 경로를 기록하고 주간 리포트를 제공하는 크로스플랫폼 앱',
    year: 2024,
    semester: 2,
    subjectName: '모바일프로그래밍',
    teamName: '',
    techStacks: ['Flutter', 'Dart', 'Firebase', 'Google Maps API'],
    tags: ['헬스케어', '모바일', '트래커'],
    status: 'APPROVED',
    viewCount: 52,
    downloadCount: 8,
    createdAt: '2024-12-18T09:30:00Z',
  },
  {
    id: 8,
    title: 'GPT-4 활용 코드 리뷰 자동화 도구',
    summary: 'GitHub PR에 올라온 코드를 자동으로 분석하여 리뷰 코멘트를 생성하는 CLI 도구',
    year: 2025,
    semester: 1,
    subjectName: '소프트웨어공학',
    teamName: 'AutoReview',
    techStacks: ['Python', 'OpenAI API', 'GitHub Actions', 'Click'],
    tags: ['AI', 'DevOps', '자동화'],
    status: 'APPROVED',
    viewCount: 189,
    downloadCount: 34,
    createdAt: '2025-05-30T11:00:00Z',
  },
  {
    id: 9,
    title: 'Vue.js + Django 교내 동아리 모집 게시판',
    summary: '동아리 정보 조회, 모집 공고 등록, 지원서 제출을 처리하는 원스톱 웹 서비스',
    year: 2023,
    semester: 2,
    subjectName: '웹프레임워크',
    teamName: '동아리팀',
    techStacks: ['Vue.js', 'Django', 'SQLite', 'Bootstrap'],
    tags: ['웹', '게시판', '동아리'],
    status: 'APPROVED',
    viewCount: 98,
    downloadCount: 21,
    createdAt: '2023-12-05T13:00:00Z',
  },
]

const MOCK_DETAIL: ProjectDetail = {
  ...MOCK_PROJECTS[0],
  description:
    '이 프로젝트는 충북대학교 학생들이 수강한 강의에 대해 익명으로 평가를 남기고 열람할 수 있는 서비스입니다. ' +
    'React와 Spring Boot를 사용하였으며, MySQL에 데이터를 저장합니다.',
  members: [
    { name: '김민준', studentId: '2021000001', role: '팀장' },
    { name: '이서연', studentId: '2021000002', role: '백엔드' },
  ],
  visibility: 'PUBLIC',
  files: [],
}

// ---------------------------------------------------------------------------
// MSW request handlers
// ---------------------------------------------------------------------------

export const handlers = [
  // GET /api/projects (keyword search)
  http.get('/api/search', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const size = Number(url.searchParams.get('size') ?? 10)

    const filtered = MOCK_PROJECTS.filter(
      (p) =>
        p.title.includes(q) ||
        p.summary.includes(q) ||
        p.techStacks.some((t) => t.toLowerCase().includes(q.toLowerCase())),
    )

    const pagedResponse: PagedResponse<ProjectSummary> = {
      items: filtered.slice((page - 1) * size, page * size),
      total: filtered.length,
      page,
      size,
    }

    return HttpResponse.json(pagedResponse)
  }),

  // GET /api/projects/:id
  http.get('/api/projects/:id', ({ params }) => {
    const id = Number(params.id)
    const found = MOCK_PROJECTS.find((p) => p.id === id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ ...MOCK_DETAIL, ...found })
  }),

  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { identifier: string; password: string }

    if (!body.identifier || !body.password) {
      return HttpResponse.json({ message: '아이디와 비밀번호를 입력해주세요.' }, { status: 400 })
    }

    // admin / admin1234 → ADMIN 권한 (임시 개발 계정)
    const isAdmin = body.identifier === 'admin' && body.password === 'admin1234'

    return HttpResponse.json({
      accessToken: isAdmin ? 'mock-admin-token' : 'mock-student-token',
      userId: isAdmin ? 999 : 1,
      role: isAdmin ? 'ADMIN' : 'STUDENT',
    })
  }),

  // POST /api/auth/refresh
  http.post('/api/auth/refresh', () =>
    HttpResponse.json({ accessToken: 'mock-access-token-refreshed' }),
  ),

  // --------------------------------------------------------------------------
  // AI 서비스 mock — localhost:8000이 미실행 상태일 때 MSW가 대신 응답
  // --------------------------------------------------------------------------
  http.post('http://localhost:8000/search', async ({ request }) => {
    const body = (await request.json()) as { query: string; top_k?: number }
    const q = (body.query ?? '').toLowerCase()
    const topK = body.top_k ?? 5

    // 쿼리 키워드를 기반으로 관련 프로젝트를 선별
    const matched = MOCK_PROJECTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.techStacks.some((t) => t.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    ).slice(0, topK)

    // 매칭 없으면 전체에서 상위 topK 반환
    const results = matched.length > 0 ? matched : MOCK_PROJECTS.slice(0, topK)

    return HttpResponse.json({
      query: body.query,
      count: results.length,
      results: results.map((p, i) => ({
        project_id: p.id,
        title: p.title,
        topic: p.subjectName,
        tech_stack: p.techStacks,
        keywords: p.tags,
        difficulty: '중급',
        project_type: p.teamName ? '팀 프로젝트' : '개인 프로젝트',
        rank: i + 1,
        final_score: parseFloat((0.95 - i * 0.08).toFixed(2)),
        reasons: [
          `${p.techStacks[0] ?? '관련 기술'} 사용 프로젝트`,
          `${p.subjectName} 과목 수행`,
        ],
      })),
      llm_answer: `"${body.query}"에 관련된 ${results.length}개의 프로젝트를 찾았습니다. (MSW 목 응답)`,
    })
  }),
]
