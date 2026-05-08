import type { BackendPage, BackendProjectResponse, PagedResponse, ProjectSummary } from '@/types/project'

// Map backend semester string to frontend numeric value
export const toSemesterNum = (s: string): 1 | 2 => (s === 'SECOND' ? 2 : 1)

// Adapt backend ProjectResponse to the frontend ProjectSummary view model
export const toSummary = (p: BackendProjectResponse): ProjectSummary => ({
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
export const toPagedSummary = (page: BackendPage<BackendProjectResponse>): PagedResponse<ProjectSummary> => ({
  items: page.content.map(toSummary),
  total: page.totalElements,
  page: page.number + 1,   // convert 0-based to 1-based
  size: page.size,
})
