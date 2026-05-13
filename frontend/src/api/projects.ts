import { api } from './axiosInstance'
import { toSummary, toPagedSummary } from './_adapters'
import { getProjectFiles } from './files'
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

export const getProjectDetail = async (id: number): Promise<ProjectDetail> => {
  const [res, files] = await Promise.all([
    api.get<ApiResponse<BackendProjectResponse>>(`/api/v1/projects/${id}`),
    // Fetch project files in parallel; gracefully fall back to empty list on error
    getProjectFiles(id).catch(() => []),
  ])
  const p = res.data.data
  const summary = toSummary(p)
  return {
    ...summary,
    description: p.description ?? '',
    readme: p.readme ?? '',
    members: [],
    visibility: 'PUBLIC',
    files,
  }
}

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
