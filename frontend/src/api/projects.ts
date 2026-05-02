import { api } from './axiosInstance'
import type {
  BackendPage,
  BackendProjectResponse,
  PagedResponse,
  ProjectCreateRequest,
  ProjectDetail,
  ProjectListParams,
  ProjectSummary,
  RecommendationResult,
} from '@/types/project'

// Map backend semester string to frontend numeric value
const toSemesterNum = (s: string): 1 | 2 => (s === 'SECOND' ? 2 : 1)

// Adapt backend ProjectResponse to the frontend ProjectSummary view model
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
  status: 'APPROVED',   // backend does not expose status in list; default for display
  viewCount: 0,
  downloadCount: 0,
  createdAt: p.createdAt,
})

// Backend paged response → frontend PagedResponse
const toPagedSummary = (page: BackendPage<BackendProjectResponse>): PagedResponse<ProjectSummary> => ({
  items: page.content.map(toSummary),
  total: page.totalElements,
  page: page.number + 1,   // convert 0-based to 1-based
  size: page.size,
})

export const getProjects = (params: ProjectListParams) =>
  api
    .get<{ data: BackendPage<BackendProjectResponse> }>('/api/v1/projects', { params })
    .then((r) => toPagedSummary(r.data.data))

export const getProjectDetail = (id: number) =>
  api
    .get<{ data: BackendProjectResponse }>(`/api/v1/projects/${id}`)
    .then((r) => {
      const p = r.data.data
      const summary = toSummary(p)
      const detail: ProjectDetail = {
        ...summary,
        description: p.description ?? '',
        members: [],
        visibility: 'PUBLIC',
        files: [],
      }
      return detail
    })

export const createProject = (data: ProjectCreateRequest) =>
  api
    .post<{ data: BackendProjectResponse }>('/api/v1/projects', data)
    .then((r) => ({ projectId: r.data.data.id, status: 'APPROVED' }))

export const updateProject = (id: number, data: Partial<ProjectCreateRequest>) =>
  api.patch(`/api/v1/projects/${id}`, data)

export const deleteProject = (id: number) => api.delete(`/api/v1/projects/${id}`)

export const getMyProjects = () =>
  api
    .get<{ data: BackendProjectResponse[] }>('/api/v1/projects/my')
    .then((r) => r.data.data.map(toSummary))

export const getRecommendations = (projectId: number) =>
  api
    .get<{ data: RecommendationResult }>(`/api/v1/projects/${projectId}/recommendations`)
    .then((r) => r.data.data)
