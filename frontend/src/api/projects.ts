import { api } from './axiosInstance'
import { toSummary, toPagedSummary } from './_adapters'
import type { ApiResponse } from '@/types/api'
import type {
  BackendPage,
  BackendProjectResponse,
  ProjectCreateRequest,
  ProjectDetail,
  ProjectListParams,
  RecommendationResult,
} from '@/types/project'

export const getProjects = (params: ProjectListParams) =>
  api
    .get<ApiResponse<BackendPage<BackendProjectResponse>>>('/api/v1/projects', { params })
    .then((r) => toPagedSummary(r.data.data))

export const getProjectDetail = (id: number) =>
  api
    .get<ApiResponse<BackendProjectResponse>>(`/api/v1/projects/${id}`)
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
    .post<ApiResponse<BackendProjectResponse>>('/api/v1/projects', data)
    .then((r) => ({ projectId: r.data.data.id, status: 'APPROVED' }))

export const updateProject = (id: number, data: Partial<ProjectCreateRequest>) =>
  api.patch(`/api/v1/projects/${id}`, data)

export const deleteProject = (id: number) => api.delete(`/api/v1/projects/${id}`)

export const getMyProjects = () =>
  api
    .get<ApiResponse<BackendProjectResponse[]>>('/api/v1/projects/my')
    .then((r) => r.data.data.map(toSummary))

export const getRecommendations = (projectId: number) =>
  api
    .get<ApiResponse<RecommendationResult>>(`/api/v1/projects/${projectId}/recommendations`)
    .then((r) => r.data.data)
