export interface AuditLog {
  id: number
  action: string
  targetId: number
  actorId: number
  timestamp: string
}

export interface AdminStats {
  totalProjects: number
  pendingProjects: number
  approvedThisMonth: number
  downloadsThisMonth: number
  topTags: { tag: string; count: number }[]
}
