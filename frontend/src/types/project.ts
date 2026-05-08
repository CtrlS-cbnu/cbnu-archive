export type ProjectStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISION_REQUESTED'
  | 'PRIVATE'
  | 'DELETED'

export type Visibility = 'PUBLIC' | 'CAMPUS_ONLY' | 'RESTRICTED'

export type SortOption = 'latest' | 'oldest' | 'views' | 'downloads'

import type { ProjectFile } from './file'

export interface ProjectMember {
  name: string
  studentId: string
  role: string
}

// ── Backend actual response shape (ProjectResponse) ──────────────────────────
export interface BackendProjectResponse {
  id: number
  title: string
  summary: string
  description: string
  readme: string
  techStacks: string[]
  year: number
  semester: string      // backend uses String: "FIRST" | "SECOND"
  difficulty: string
  domain: string
  authorId: number
  authorName: string
  createdAt: string
  updatedAt: string
}

// Backend paginated list response
export interface BackendPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number   // 0-based page index
  size: number
}

// ── Frontend view model (used throughout UI) ──────────────────────────────────
export interface ProjectSummary {
  id: number
  title: string
  summary: string
  year: number
  semester: 1 | 2
  subjectName: string
  teamName: string
  techStacks: string[]
  tags: string[]
  status: ProjectStatus
  viewCount: number
  downloadCount: number
  createdAt: string
}

export interface ProjectDetail extends ProjectSummary {
  description: string
  members: ProjectMember[]
  visibility: Visibility
  files: ProjectFile[]
}

export interface ProjectCreateRequest {
  title: string
  summary: string
  description: string
  year: number
  semester: 1 | 2
  subjectName: string
  teamName?: string
  members: ProjectMember[]
  techStacks: string[]
  tags: string[]
  fileIds: number[]
}

export interface PagedResponse<T> {
  total: number
  page: number
  size: number
  items: T[]
}

export interface ProjectListParams {
  keyword?: string
  years?: number[]
  semester?: 1 | 2
  subjects?: string[]
  techStacks?: string[]
  domains?: string[]
  isTeam?: boolean
  sort?: SortOption
  page?: number
  size?: number
}

export interface RecommendationItem {
  id: number
  title: string
  matchReason: string
}

export interface RecommendationResult {
  recommendations: RecommendationItem[]
}

export interface KeywordSearchParams {
  keyword?: string
  techStacks?: string[]
  year?: number
  semester?: string
  difficulty?: string
  domain?: string
  sort?: SortOption
  page?: number
  size?: number
}
