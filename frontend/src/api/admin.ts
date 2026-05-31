import { api } from './axiosInstance'
import type { ApiResponse } from '@/types/api'
import type { AuditLog, AdminStats } from '@/types/admin'
import type { BackendPage, BackendProjectResponse } from '@/types/project'
import { toSummary } from './_adapters'

export const getPendingProjects = () =>
  api
    .get<ApiResponse<BackendProjectResponse[]>>('/api/v1/admin/projects/pending')
    .then((r) => r.data.data.map(toSummary))

export const approveProject = (id: number, visibility: string) =>
  api
    .patch<ApiResponse<BackendProjectResponse>>(`/api/v1/admin/projects/${id}/approve`, { visibility })
    .then((r) => r.data.data)

export const rejectProject = (id: number, reason: string) =>
  api
    .patch<ApiResponse<BackendProjectResponse>>(`/api/v1/admin/projects/${id}/reject`, { reason })
    .then((r) => r.data.data)

export const requestRevision = (id: number, message: string) =>
  api
    .patch<ApiResponse<BackendProjectResponse>>(`/api/v1/admin/projects/${id}/request-revision`, { message })
    .then((r) => r.data.data)

export const getAdminStats = () =>
  api
    .get<ApiResponse<AdminStats>>('/api/v1/admin/projects/stats')
    .then((r) => r.data.data)

export const getAuditLogs = (page = 0, size = 20) =>
  api
    .get<ApiResponse<BackendPage<AuditLog>>>('/api/v1/admin/projects/audit-logs', { params: { page, size } })
    .then((r) => r.data.data)
