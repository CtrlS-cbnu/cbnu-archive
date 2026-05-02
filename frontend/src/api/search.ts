import { api } from './axiosInstance'
import axios from 'axios'
import type { NaturalSearchResult } from '@/types/chat'
import type {
  BackendPage,
  BackendProjectResponse,
  PagedResponse,
  ProjectSummary,
} from '@/types/project'

interface KeywordSearchParams {
  keyword?: string
  techStacks?: string[]
  year?: number
  semester?: string
  difficulty?: string
  page?: number
  size?: number
}

const toSemesterNum = (s: string): 1 | 2 => (s === 'SECOND' ? 2 : 1)
const toSummary = (p: BackendProjectResponse): ProjectSummary => ({
  id: p.id,
  title: p.title,
  summary: p.summary,
  year: p.year,
  semester: toSemesterNum(p.semester),
  subjectName: p.domain ?? '',
  teamName: p.authorName ?? '',
  techStacks: p.techStacks,
  tags: [],
  status: 'APPROVED',
  viewCount: 0,
  downloadCount: 0,
  createdAt: p.createdAt,
})

// Backend search is exposed via GET /api/v1/projects?keyword=... (no dedicated /search endpoint)
export const searchKeyword = (params: KeywordSearchParams) =>
  api
    .get<{ data: BackendPage<BackendProjectResponse> }>('/api/v1/projects', { params })
    .then((r) => {
      const page = r.data.data
      const result: PagedResponse<ProjectSummary> = {
        items: page.content.map(toSummary),
        total: page.totalElements,
        page: page.number + 1,
        size: page.size,
      }
      return result
    })

// Backend recommend response shape
interface BackendRecommendResult {
  answer: string
  recommendedProjectIds: number[]
  reasoning: string
}

export interface NaturalSearchBackendResult {
  answer: string
  reasoning: string
  projects: ProjectSummary[]
}

// Natural language recommendation via backend AI adapter
// Fetches each recommended project by ID in parallel after getting the ID list
export const searchNatural = async (query: string): Promise<NaturalSearchBackendResult> => {
  const res = await api.post<{ data: BackendRecommendResult }>('/api/v1/projects/recommend', { query })
  const { answer, recommendedProjectIds, reasoning } = res.data.data
  const projects = await Promise.all(
    recommendedProjectIds.map((id) =>
      api.get<{ data: BackendProjectResponse }>(`/api/v1/projects/${id}`).then((r) => toSummary(r.data.data)),
    ),
  )
  return { answer, reasoning, projects }
}

// Direct AI service call — fallback when backend AI adapter is unavailable
const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_SERVICE_URL ?? 'http://localhost:8000',
  timeout: 30000,
})

export const searchNaturalDirect = (query: string, topK = 5) =>
  aiApi
    .post<NaturalSearchResult>('/search', { query, top_k: topK })
    .then((r) => r.data)

