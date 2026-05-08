import { api } from './axiosInstance'
import type { ApiResponse } from '@/types/api'
import type { AuditLog, AdminStats } from '@/types/admin'
import type { PagedResponse, ProjectSummary, Visibility } from '@/types/project'

export const getPendingProjects = (params?: { page?: number; size?: number }) =>
  api
    .get<ApiResponse<PagedResponse<ProjectSummary>>>('/api/admin/projects/pending', { params })
    .then((r) => r.data.data)

export const approveProject = (id: number, visibility: Visibility) =>
  api.patch(`/api/admin/projects/${id}/approve`, { visibility })

export const rejectProject = (id: number, reason: string) =>
  api.patch(`/api/admin/projects/${id}/reject`, { reason })

export const requestRevision = (id: number, fields: string[]) =>
  api.patch(`/api/admin/projects/${id}/request-revision`, { fields })

export const getStats = () =>
  api.get<ApiResponse<AdminStats>>('/api/admin/stats').then((r) => r.data.data)

export const getAuditLogs = (params?: { page?: number; size?: number }) =>
  api.get<ApiResponse<PagedResponse<AuditLog>>>('/api/admin/audit-logs', { params }).then((r) => r.data.data)
