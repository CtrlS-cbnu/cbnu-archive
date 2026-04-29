import type { ProjectStatus } from '@/types/project'

interface BadgeProps {
  status: ProjectStatus
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  PENDING_APPROVAL: { label: '승인 대기', className: 'bg-yellow-100 text-yellow-700' },
  APPROVED:         { label: '승인',      className: 'bg-green-100 text-green-700' },
  REJECTED:         { label: '반려',      className: 'bg-red-100 text-red-700' },
  REVISION_REQUESTED: { label: '수정 요청', className: 'bg-orange-100 text-orange-700' },
  PRIVATE:          { label: '비공개',    className: 'bg-gray-100 text-gray-600' },
  DELETED:          { label: '삭제됨',    className: 'bg-gray-200 text-gray-500' },
}

export function ProjectStatusBadge({ status }: BadgeProps) {
  const { label, className } = statusConfig[status]
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
