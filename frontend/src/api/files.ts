import { api } from './axiosInstance'
import type { FileMetadata } from '@/types/file'

export const uploadFile = (projectId: number | 'temp', formData: FormData) =>
  api
    .post<{ data: FileMetadata }>(`/api/v1/files/projects/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)

export const deleteFile = (fileId: number) => api.delete(`/api/v1/files/${fileId}`)

// Backend returns FileResponse with a downloadUrl field directly (no separate /download sub-path)
export const getDownloadUrl = (fileId: number) =>
  api
    .get<{ data: { downloadUrl: string } }>(`/api/v1/files/${fileId}`)
    .then((r) => r.data.data)
