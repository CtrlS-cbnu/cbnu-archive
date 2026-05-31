import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPendingProjects } from '@/api/admin'
import type { ProjectSummary } from '@/types/project'
import { ClipboardList, ArrowRight, FolderOpen } from 'lucide-react'
import { ADMIN_PATH } from '@/config'

export default function AdminPendingList() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPendingProjects()
      .then(setProjects)
      .catch(() => setError('목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <ClipboardList className="h-7 w-7 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">승인 대기 목록</h1>
        {!loading && (
          <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
            {projects.filter((p) => p.status === 'PENDING_APPROVAL').length}건 대기 중
          </span>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-20 text-center">
          <FolderOpen className="mb-3 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">승인 대기 중인 프로젝트가 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left">제목</th>
                <th className="px-5 py-3 text-left">작성자</th>
                <th className="px-5 py-3 text-left">연도/학기</th>
                <th className="px-5 py-3 text-left">도메인</th>
                <th className="px-5 py-3 text-left">상태</th>
                <th className="px-5 py-3 text-left">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="max-w-xs px-5 py-4">
                    <p className="truncate font-medium text-gray-900">{p.title}</p>
                    <p className="truncate text-xs text-gray-400">{p.summary}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-gray-600">{p.teamName}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                    {p.year}년 {p.semester}학기
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-gray-600">{p.subjectName}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to={`/${ADMIN_PATH}/review/${p.id}`}
                      className="flex items-center gap-1 text-primary-600 hover:text-primary-800 hover:underline"
                    >
                      심사하기
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; className: string }> = {
    PENDING_APPROVAL:   { label: '승인 대기',  className: 'bg-yellow-100 text-yellow-800' },
    APPROVED:           { label: '승인 완료',  className: 'bg-green-100 text-green-800' },
    REJECTED:           { label: '반려',       className: 'bg-red-100 text-red-800' },
    REVISION_REQUESTED: { label: '수정 요청',  className: 'bg-orange-100 text-orange-800' },
  }
  const c = cfg[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  )
}

