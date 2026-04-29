import { api } from './axiosInstance'
import axios from 'axios'
import type { NaturalSearchResult } from '@/types/chat'
import type { PagedResponse, ProjectSummary } from '@/types/project'

interface KeywordSearchParams {
  q: string
  sort?: string
  page?: number
  size?: number
}

export const searchKeyword = (params: KeywordSearchParams) =>
  api.get<PagedResponse<ProjectSummary>>('/api/search', { params }).then((r) => r.data)

export const searchNatural = (query: string, sessionId?: string) =>
  api
    .post<NaturalSearchResult>('/api/search/natural', { query, sessionId })
    .then((r) => r.data)

// Direct AI service call — used while backend is not yet implemented
const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_SERVICE_URL ?? 'http://localhost:8000',
  timeout: 30000,
})

export const searchNaturalDirect = (query: string, topK = 5) =>
  aiApi
    .post<NaturalSearchResult>('/search', { query, top_k: topK })
    .then((r) => r.data)

