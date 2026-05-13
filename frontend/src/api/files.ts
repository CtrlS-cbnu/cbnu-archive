import { api } from './axiosInstance'
import type { ApiResponse } from '@/types/api'
import type { FileMetadata, ProjectFile } from '@/types/file'

export const uploadFile = (projectId: number | 'temp', formData: FormData) =>
  api
    .post<ApiResponse<FileMetadata>>(`/api/v1/files/projects/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)

export const deleteFile = (fileId: number) => api.delete(`/api/v1/files/${fileId}`)

// Backend FileResponse shape (subset we care about)
interface BackendFileResponse {
  id: number
  projectId: number
  fileName: string
  fileType: ProjectFile['fileType']
  size: number
  downloadUrl: string
  uploadedAt: string
}

// Map backend FileResponse → frontend ProjectFile
const toProjectFile = (f: BackendFileResponse): ProjectFile => ({
  id: f.id,
  projectId: f.projectId,
  originalName: f.fileName,
  storedName: '',
  mimeType: '',
  size: f.size,
  fileType: f.fileType,
  isRestricted: false,
  uploadedAt: f.uploadedAt,
})

// Fetch all files belonging to a project
export const getProjectFiles = (projectId: number) =>
  api
    .get<ApiResponse<BackendFileResponse[]>>(`/api/v1/files/projects/${projectId}`)
    .then((r) => r.data.data.map(toProjectFile))

// Download file bytes directly via backend streaming endpoint.
// This bypasses mock-storage URLs which are not real HTTP servers.
export const downloadFileBlob = (fileId: number, fileName: string) =>
  api
    .get(`/api/v1/files/${fileId}/download`, { responseType: 'blob' })
    .then((r) => {
      // Create a temporary object URL and trigger browser download
      const url = URL.createObjectURL(r.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    })

// Backend returns FileResponse with a downloadUrl field directly (no separate /download sub-path)
export const getDownloadUrl = (fileId: number) =>
  api
    .get<ApiResponse<{ downloadUrl: string }>>(`/api/v1/files/${fileId}`)
    .then((r) => r.data.data)
