import { useEffect, useState } from 'react'
import { getAdminStats, getAuditLogs } from '@/api/admin'
import type { AdminStats, AuditLog } from '@/types/admin'
import type { BackendPage } from '@/types/project'
import { BarChart2, Clock, Download, Tag, FolderOpen, AlertCircle } from 'lucide-react'

export default function AdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)

  const [logs, setLogs] = useState<BackendPage<AuditLog> | null>(null)
  const [logsError, setLogsError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [logsLoading, setLogsLoading] = useState(true)

  // Load stats once on mount
  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setStatsError('통계를 불러오지 못했습니다.'))
  }, [])

  // Reload audit logs whenever the current page changes
  useEffect(() => {
    setLogsLoading(true)
    getAuditLogs(page, 15)
      .then(setLogs)
      .catch(() => setLogsError('감사 로그를 불러오지 못했습니다.'))
      .finally(() => setLogsLoading(false))
  }, [page])

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <BarChart2 className="h-7 w-7 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">통계 및 감사 로그</h1>
      </div>

      {/* Stat cards */}
      {statsError ? (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{statsError}</p>
      ) : (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="전체 프로젝트" value={stats?.totalProjects} icon={<FolderOpen className="h-5 w-5 text-blue-500" />} loading={!stats} />
          <StatCard label="승인 대기" value={stats?.pendingCount} icon={<AlertCircle className="h-5 w-5 text-yellow-500" />} loading={!stats} />
          <StatCard label="반려" value={stats?.rejectedCount} icon={<AlertCircle className="h-5 w-5 text-red-500" />} loading={!stats} />
          <StatCard label="전체 다운로드" value={stats?.totalDownloads} icon={<Download className="h-5 w-5 text-green-500" />} loading={!stats} />
        </div>
      )}

      {/* Top tags */}
      {stats && stats.topTags.length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Tag className="h-4 w-4" />
            인기 태그
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.topTags.map((tag) => (
              <span key={tag} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Audit log table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 text-sm font-semibold text-gray-700">
          <Clock className="h-4 w-4" />
          감사 로그
        </div>

        {logsError && (
          <p className="px-5 py-4 text-sm text-red-600">{logsError}</p>
        )}

        {logsLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        ) : logs && logs.content.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">감사 로그가 없습니다.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">ID</th>
                    <th className="px-5 py-3 text-left">액션</th>
                    <th className="px-5 py-3 text-left">대상</th>
                    <th className="px-5 py-3 text-left">대상 ID</th>
                    <th className="px-5 py-3 text-left">액터 ID</th>
                    <th className="px-5 py-3 text-left">상세</th>
                    <th className="px-5 py-3 text-left">일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs?.content.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-400">{log.id}</td>
                      <td className="px-5 py-3">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="px-5 py-3 text-gray-600">{log.entityType}</td>
                      <td className="px-5 py-3 text-gray-600">{log.entityId}</td>
                      <td className="px-5 py-3 text-gray-600">{log.actorUserId}</td>
                      <td className="max-w-xs truncate px-5 py-3 text-gray-500">{log.detail}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-gray-400 text-xs">
                        {new Date(log.createdAt).toLocaleString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logs && logs.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-lg border px-3 py-1 text-xs disabled:opacity-40"
                >
                  이전
                </button>
                <span className="text-xs text-gray-500">
                  {page + 1} / {logs.totalPages} 페이지
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(logs.totalPages - 1, p + 1))}
                  disabled={page >= logs.totalPages - 1}
                  className="rounded-lg border px-3 py-1 text-xs disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string
  value: number | undefined
  icon: React.ReactNode
  loading: boolean
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
        {icon}
        {label}
      </div>
      {loading ? (
        <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
      ) : (
        <p className="text-3xl font-bold text-gray-900">{value?.toLocaleString() ?? '-'}</p>
      )}
    </div>
  )
}

function ActionBadge({ action }: { action: string }) {
  const cfg: Record<string, string> = {
    APPROVE:          'bg-green-100 text-green-700',
    REJECT:           'bg-red-100 text-red-700',
    REQUEST_REVISION: 'bg-orange-100 text-orange-700',
  }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg[action] ?? 'bg-gray-100 text-gray-600'}`}>
      {action}
    </span>
  )
}

