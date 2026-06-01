// Matches backend AuditLogResponse record
export interface AuditLog {
  id: number
  actorUserId: number
  action: string
  entityType: string
  entityId: number
  detail: string
  createdAt: string
}

// Matches backend AdminStatsResponse record
export interface AdminStats {
  totalProjects: number
  pendingCount: number
  rejectedCount: number
  totalDownloads: number
  topTags: string[]
}

// Matches backend UserResponse record for pending users
export interface PendingUser {
  id: number
  email: string
  name: string
  studentNumber: string
  role: 'USER' | 'ADMIN'
  status: 'PENDING' | 'ACTIVE' | 'REJECTED'
}

