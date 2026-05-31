import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProjectDetail } from '@/api/projects'
import { approveProject, rejectProject, requestRevision } from '@/api/admin'
import type { ProjectDetail } from '@/types/project'
import { CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { ADMIN_PATH } from '@/config'

type ActionTab = 'approve' | 'reject' | 'revision'

export default function AdminReview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectId = Number(id)

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<ActionTab>('approve')
  const [visibility, setVisibility] = useState('PUBLIC')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    getProjectDetail(projectId)
      .then(setProject)
      .catch(() => setError('프로젝트 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [projectId])

  const handleAction = async () => {
    setActionError(null)
    setSubmitting(true)
    try {
      if (activeTab === 'approve') {
        await approveProject(projectId, visibility)
      } else if (activeTab === 'reject') {
        if (!reason.trim()) { setActionError('반려 사유를 입력하세요.'); return }
        await rejectProject(projectId, reason)
      } else {
        if (!message.trim()) { setActionError('수정 요청 메시지를 입력하세요.'); return }
        await requestRevision(projectId, message)
      }
      // Navigate back to admin list after a successful action
      navigate(`/${ADMIN_PATH}`)
    } catch {
      setActionError('처리 중 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-200" />
      ))}
    </div>
  )

  if (error) return (
    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
  )

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate(`/${ADMIN_PATH}`)}
        className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로
      </button>

      {/* Project summary card */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-gray-900">{project?.title}</h1>
        <p className="mb-4 text-sm text-gray-500">
          {project?.teamName} · {project?.year}년 {project?.semester}학기 · {project?.subjectName}
        </p>
        <p className="text-sm leading-relaxed text-gray-700">{project?.summary}</p>
        {(project?.techStacks ?? []).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project!.techStacks.map((t) => (
              <span key={t} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action selector tabs */}
      <div className="mb-4 flex gap-2">
        <TabButton active={activeTab === 'approve'} onClick={() => setActiveTab('approve')} icon={<CheckCircle className="h-4 w-4" />} label="승인" color="green" />
        <TabButton active={activeTab === 'reject'} onClick={() => setActiveTab('reject')} icon={<XCircle className="h-4 w-4" />} label="반려" color="red" />
        <TabButton active={activeTab === 'revision'} onClick={() => setActiveTab('revision')} icon={<RefreshCw className="h-4 w-4" />} label="수정 요청" color="orange" />
      </div>

      {/* Action form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {activeTab === 'approve' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">공개 범위</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="PUBLIC">전체 공개 (PUBLIC)</option>
              <option value="CAMPUS_ONLY">교내 공개 (CAMPUS_ONLY)</option>
              <option value="RESTRICTED">제한 공개 (RESTRICTED)</option>
            </select>
          </div>
        )}

        {activeTab === 'reject' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">반려 사유 <span className="text-red-500">*</span></label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="학생에게 전달할 반려 사유를 입력하세요."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
        )}

        {activeTab === 'revision' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">수정 요청 메시지 <span className="text-red-500">*</span></label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="어떤 부분을 수정해야 하는지 안내해 주세요."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        )}

        {actionError && (
          <p className="mt-3 text-sm text-red-600">{actionError}</p>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleAction}
            disabled={submitting}
            className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${
              activeTab === 'approve' ? 'bg-green-600 hover:bg-green-700' :
              activeTab === 'reject'  ? 'bg-red-600 hover:bg-red-700'   :
                                        'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {submitting ? '처리 중...' : activeTab === 'approve' ? '승인하기' : activeTab === 'reject' ? '반려하기' : '수정 요청 보내기'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  color: 'green' | 'red' | 'orange'
}

function TabButton({ active, onClick, icon, label, color }: TabButtonProps) {
  const activeClasses = {
    green:  'border-green-500 bg-green-50 text-green-700',
    red:    'border-red-500 bg-red-50 text-red-700',
    orange: 'border-orange-400 bg-orange-50 text-orange-700',
  }
  const inactiveClass = 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition ${active ? activeClasses[color] : inactiveClass}`}
    >
      {icon}
      {label}
    </button>
  )
}
