import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Download, FileText, Pencil, Trash2, ChevronLeft } from 'lucide-react'
import { getProjectDetail, deleteProject, getRecommendations } from '@/api/projects'
import { getDownloadUrl } from '@/api/files'
import { useAuthStore } from '@/store/authStore'
import type { ProjectDetail as ProjectDetailType } from '@/types/project'
import type { RecommendationItem } from '@/types/project'

const SemesterLabel: Record<1 | 2, string> = { 1: '1학기', 2: '2학기' }

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-2/3 rounded-lg bg-gray-200" />
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-6 w-20 rounded-full bg-gray-200" />)}
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
        <div className="h-4 w-4/6 rounded bg-gray-200" />
      </div>
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { role } = useAuthStore()

  const [project, setProject] = useState<ProjectDetailType | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const projectId = Number(id)

  useEffect(() => {
    if (!projectId) return
    setIsLoading(true)
    setError(null)

    getProjectDetail(projectId)
      .then((data) => {
        setProject(data)
        // Load recommendations in parallel after the main detail loads
        return getRecommendations(projectId).then((r) => setRecommendations(r.recommendations)).catch(() => {})
      })
      .catch(() => setError('프로젝트를 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
  }, [projectId])

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    setIsDeleting(true)
    try {
      await deleteProject(projectId)
      navigate('/projects', { replace: true })
    } catch {
      alert('삭제에 실패했습니다.')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <DetailSkeleton />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? '프로젝트를 찾을 수 없습니다.'}
        </p>
        <Link to="/projects" className="mt-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
          <ChevronLeft className="h-4 w-4" /> 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* 뒤로 가기 */}
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft className="h-4 w-4" /> 프로젝트 목록
      </Link>

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-500">{project.summary}</p>
        </div>

        {/* 수정/삭제 버튼 — ADMIN 또는 작성자만 */}
        {role === 'ADMIN' && (
          <div className="flex shrink-0 gap-2">
            <Link
              to={`/projects/${projectId}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" /> 수정
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> 삭제
            </button>
          </div>
        )}
      </div>

      {/* 기술 스택 */}
      {project.techStacks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.techStacks.map((stack) => (
            <span
              key={stack}
              className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700"
            >
              {stack}
            </span>
          ))}
        </div>
      )}

      {/* 메타 정보 */}
      <dl className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:grid-cols-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">연도</dt>
          <dd className="mt-1 text-sm font-semibold text-gray-800">{project.year}년</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">학기</dt>
          <dd className="mt-1 text-sm font-semibold text-gray-800">{SemesterLabel[project.semester]}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">도메인</dt>
          <dd className="mt-1 text-sm font-semibold text-gray-800">{project.subjectName || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">작성자</dt>
          <dd className="mt-1 text-sm font-semibold text-gray-800">{project.teamName || '—'}</dd>
        </div>
      </dl>

      {/* 프로젝트 설명 */}
      {project.description && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">프로젝트 소개</h2>
          <div className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-700">
            {project.description}
          </div>
        </section>
      )}

      {/* README (마크다운 렌더링) */}
      {project.readme && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">README</h2>
          <div className="prose prose-sm prose-gray max-w-none rounded-xl border border-gray-200 bg-white p-5">
            <ReactMarkdown>{project.readme}</ReactMarkdown>
          </div>
        </section>
      )}

      {/* 파일 목록 */}
      {project.files.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">첨부 파일</h2>
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {project.files.map((file) => (
              <FileDownloadRow key={file.id} file={file} />
            ))}
          </ul>
        </section>
      )}

      {/* AI 추천 프로젝트 */}
      {recommendations.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">비슷한 프로젝트</h2>
          <ul className="space-y-2">
            {recommendations.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/projects/${item.id}`}
                  className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-sm"
                >
                  <span className="font-medium text-gray-900">{item.title}</span>
                  {item.matchReason && (
                    <span className="text-xs text-gray-500">{item.matchReason}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

// 파일 한 행 — 클릭 시 download URL을 가져와서 새 탭에서 열기
function FileDownloadRow({ file }: { file: import('@/types/file').ProjectFile }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const { downloadUrl } = await getDownloadUrl(file.id)
      window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    } catch {
      alert('파일 URL을 가져오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="text-sm text-gray-800">{file.originalName}</span>
        <span className="text-xs text-gray-400">
          ({(file.size / 1024).toFixed(1)} KB)
        </span>
      </div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline disabled:opacity-50"
      >
        <Download className="h-3.5 w-3.5" />
        {loading ? '...' : '다운로드'}
      </button>
    </li>
  )
}

