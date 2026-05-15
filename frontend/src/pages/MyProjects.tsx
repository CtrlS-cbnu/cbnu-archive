import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMyProjects, deleteProject } from '@/api/projects'
import type { ProjectSummary, ProjectStatus } from '@/types/project'
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react'

// Map backend status to human-readable label + color
const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  PENDING_APPROVAL: { label: '승인 대기', className: 'bg-yellow-100 text-yellow-800' },
  APPROVED:         { label: '승인 완료', className: 'bg-green-100 text-green-800' },
  REJECTED:         { label: '반려',      className: 'bg-red-100 text-red-800' },
  REVISION_REQUESTED: { label: '수정 요청', className: 'bg-orange-100 text-orange-800' },
  PRIVATE:          { label: '비공개',    className: 'bg-gray-100 text-gray-600' },
  DELETED:          { label: '삭제됨',    className: 'bg-gray-100 text-gray-400' },
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

export default function MyProjects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    getMyProjects()
      .then(setProjects)
      .catch(() => setError('프로젝트 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`"${title}" 프로젝트를 삭제하시겠습니까?`)) return
    setDeletingId(id)
    try {
      await deleteProject(id)
      // Remove from local state so the list updates without a refetch
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch {
      alert('프로젝트 삭제에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">내 프로젝트</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">내 프로젝트</h1>
        <Link
          to="/projects/new"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          프로젝트 등록
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {projects.length === 0 && !error ? (
        // Empty state
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-20 text-center">
          <FolderOpen className="mb-3 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">등록된 프로젝트가 없습니다.</p>
          <Link
            to="/projects/new"
            className="mt-4 flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            첫 프로젝트 등록하기
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Status badge + year/semester */}
              <div className="mb-3 flex items-center justify-between">
                <StatusBadge status={project.status} />
                <span className="text-xs text-gray-400">
                  {project.year}년 {project.semester}학기
                </span>
              </div>

              {/* Title — links to detail page */}
              <Link
                to={`/projects/${project.id}`}
                className="mb-1 line-clamp-2 font-semibold text-gray-900 hover:text-primary-600"
              >
                {project.title}
              </Link>

              <p className="mb-3 line-clamp-2 flex-1 text-sm text-gray-500">
                {project.summary}
              </p>

              {/* Tech stacks */}
              {project.techStacks.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {project.techStacks.slice(0, 4).map((t) => (
                    <span key={t} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {t}
                    </span>
                  ))}
                  {project.techStacks.length > 4 && (
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                      +{project.techStacks.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                <button
                  onClick={() => navigate(`/projects/${project.id}/edit`)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  수정
                </button>
                <button
                  onClick={() => handleDelete(project.id, project.title)}
                  disabled={deletingId === project.id}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deletingId === project.id ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
