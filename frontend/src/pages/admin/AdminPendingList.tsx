import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPendingProjects, getPendingUsers, approveUser, rejectUser } from '@/api/admin'
import type { ProjectSummary } from '@/types/project'
import type { PendingUser } from '@/types/admin'
import { ClipboardList, ArrowRight, FolderOpen, Users } from 'lucide-react'
import { ADMIN_PATH } from '@/config'

export default function AdminPendingList() {
  const [activeTab, setActiveTab] = useState<'projects' | 'users'>('projects')
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [users, setUsers] = useState<PendingUser[]>([])
  
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data (both projects and users) to populate lists and counts
  const loadData = () => {
    setLoading(true)
    setUsersLoading(true)
    setError(null)

    Promise.all([
      getPendingProjects(),
      getPendingUsers()
    ])
      .then(([pList, uList]) => {
        setProjects(pList)
        setUsers(uList)
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => {
        setLoading(false)
        setUsersLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  // Approve a pending user and remove them from the list
  const handleApproveUser = async (userId: number) => {
    try {
      setError(null)
      await approveUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch {
      setError('회원 승인에 실패했습니다.')
    }
  }

  // Reject a pending user with an optional reason and remove them from the list
  const handleRejectUser = async (userId: number) => {
    const reason = window.prompt('거절 사유를 입력해주세요 (선택사항):')
    if (reason === null) return // User cancelled the prompt

    try {
      setError(null)
      await rejectUser(userId, reason || undefined)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch {
      setError('회원 거절에 실패했습니다.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <ClipboardList className="h-7 w-7 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">관리자 승인 센터</h1>
      </div>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {/* Tabs Navigation */}
      <div className="mb-6 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === 'projects'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          프로젝트 심사
          <span className={`ml-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
            activeTab === 'projects' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {projects.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === 'users'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4" />
          가입 승인 대기
          <span className={`ml-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
            activeTab === 'users' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {users.length}
          </span>
        </button>
      </div>

      {activeTab === 'projects' ? (
        /* PROJECTS TAB */
        loading ? (
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
        )
      ) : (
        /* USERS TAB */
        usersLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-20 text-center">
            <Users className="mb-3 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">승인 대기 중인 회원이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left">이름</th>
                  <th className="px-5 py-3 text-left">이메일</th>
                  <th className="px-5 py-3 text-left">학번</th>
                  <th className="px-5 py-3 text-left">역할</th>
                  <th className="px-5 py-3 text-left">상태</th>
                  <th className="px-5 py-3 text-left">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
                      {u.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {u.email}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {u.studentNumber || '-'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-600 text-xs">
                      <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        대기 중
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveUser(u.id)}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleRejectUser(u.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          거절
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
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
