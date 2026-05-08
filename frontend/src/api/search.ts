import { api } from './axiosInstance'
import axios from 'axios'
import { toSummary, toPagedSummary } from './_adapters'
import type { ApiResponse } from '@/types/api'
import type { NaturalSearchResult } from '@/types/chat'
import type {
  BackendPage,
  BackendProjectResponse,
  KeywordSearchParams,
  ProjectSummary,
} from '@/types/project'

// Backend search is exposed via GET /api/v1/projects?keyword=... (no dedicated /search endpoint)
export const searchKeyword = (params: KeywordSearchParams) =>
  api
    .get<ApiResponse<BackendPage<BackendProjectResponse>>>('/api/v1/projects', { params })
    .then((r) => toPagedSummary(r.data.data))

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
  const res = await api.post<ApiResponse<BackendRecommendResult>>('/api/v1/projects/recommend', { query })
  const { answer, recommendedProjectIds, reasoning } = res.data.data
  const projects = await Promise.all(
    recommendedProjectIds.map((id) =>
      api.get<ApiResponse<BackendProjectResponse>>(`/api/v1/projects/${id}`).then((r) => toSummary(r.data.data)),
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

