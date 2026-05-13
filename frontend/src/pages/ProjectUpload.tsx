import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Plus, FileText, AlertCircle } from 'lucide-react'
import { api } from '@/api/axiosInstance'
import type { ApiResponse } from '@/types/api'
import type { BackendProjectResponse } from '@/types/project'

// Allowed file extensions for upload
const ALLOWED_EXTENSIONS = ['.pdf', '.zip', '.pptx', '.ppt', '.docx', '.doc', '.md', '.txt', '.png', '.jpg', '.jpeg']
const MAX_FILE_SIZE_MB = 100

const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: '쉬움' },
  { value: 'MEDIUM', label: '보통' },
  { value: 'HARD', label: '어려움' },
]

const DOMAIN_OPTIONS = [
  '컴퓨터공학', '소프트웨어공학', '인공지능', '데이터사이언스',
  '임베디드시스템', '네트워크', '보안', '기타',
]

interface FormState {
  title: string
  description: string
  readme: string
  techStacks: string[]
  year: number
  semester: 1 | 2
  difficulty: string
  domain: string
  isTeam: boolean
}

interface AttachedFile {
  file: File
  error?: string
}

export default function ProjectUpload() {
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    readme: '',
    techStacks: [],
    year: new Date().getFullYear(),
    semester: 1,
    difficulty: 'MEDIUM',
    domain: '',
    isTeam: false,
  })

  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [techInput, setTechInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate a file — check extension and size
  const validateFile = (file: File): string | undefined => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `허용되지 않는 확장자입니다 (${ext})`
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `파일 크기가 ${MAX_FILE_SIZE_MB}MB를 초과합니다`
    }
  }

  const addFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files).map((file) => ({
      file,
      error: validateFile(file),
    }))
    setAttachedFiles((prev) => [...prev, ...incoming])
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  // Add tech stack tag when user presses Enter or comma
  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && techInput.trim()) {
      e.preventDefault()
      const tag = techInput.trim().replace(/,$/, '')
      if (tag && !form.techStacks.includes(tag)) {
        setForm((prev) => ({ ...prev, techStacks: [...prev.techStacks, tag] }))
      }
      setTechInput('')
    }
  }

  const removeTech = (tag: string) => {
    setForm((prev) => ({ ...prev, techStacks: prev.techStacks.filter((t) => t !== tag) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    // Block submission if any attached file has a validation error
    const hasInvalidFile = attachedFiles.some((f) => f.error)
    if (hasInvalidFile) {
      setSubmitError('오류가 있는 파일을 제거한 후 다시 시도해주세요.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Step 1: create the project metadata
      // Semester is sent as "FIRST" or "SECOND" as the backend expects
      const payload = {
        title: form.title,
        description: form.description,
        readme: form.readme,
        techStacks: form.techStacks,
        year: form.year,
        semester: form.semester === 1 ? 'FIRST' : 'SECOND',
        difficulty: form.difficulty,
        domain: form.domain,
        isTeam: form.isTeam,
      }
      const createRes = await api.post<ApiResponse<BackendProjectResponse>>('/api/v1/projects', payload)
      const projectId = createRes.data.data.id

      // Step 2: upload each valid file sequentially
      for (const { file } of attachedFiles) {
        const fd = new FormData()
        fd.append('file', file)
        await api.post(`/api/v1/files/projects/${projectId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      navigate(`/projects/${projectId}`)
    } catch {
      setSubmitError('프로젝트 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">프로젝트 업로드</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Title ───────────────────────────────────────────── */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="프로젝트 제목을 입력하세요"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* ── Year / Semester / Difficulty ─────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">연도</label>
            <input
              type="number"
              min={2000}
              max={2099}
              value={form.year}
              onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">학기</label>
            <select
              value={form.semester}
              onChange={(e) => setForm((p) => ({ ...p, semester: Number(e.target.value) as 1 | 2 }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={1}>1학기</option>
              <option value={2}>2학기</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">난이도</label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Domain / isTeam ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">도메인(과목)</label>
            <select
              value={form.domain}
              onChange={(e) => setForm((p) => ({ ...p, domain: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">선택하세요</option>
              {DOMAIN_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex cursor-pointer items-center gap-2 pb-2">
              <input
                type="checkbox"
                checked={form.isTeam}
                onChange={(e) => setForm((p) => ({ ...p, isTeam: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 accent-primary"
              />
              <span className="text-sm font-medium text-gray-700">팀 프로젝트</span>
            </label>
          </div>
        </div>

        {/* ── Tech Stacks ──────────────────────────────────────── */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">기술 스택</label>
          <div className="flex flex-wrap gap-2 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            {form.techStacks.map((tag) => (
              <span key={tag} className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {tag}
                <button type="button" onClick={() => removeTech(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleTechKeyDown}
              placeholder="입력 후 Enter"
              className="min-w-24 flex-1 border-none bg-transparent text-sm outline-none"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">Enter 또는 쉼표(,)로 태그 추가</p>
        </div>

        {/* ── Description ──────────────────────────────────────── */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">프로젝트 설명</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="프로젝트를 간략히 설명해주세요"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* ── README (Markdown) ────────────────────────────────── */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">README (마크다운)</label>
          <textarea
            rows={8}
            value={form.readme}
            onChange={(e) => setForm((p) => ({ ...p, readme: e.target.value }))}
            placeholder="## 프로젝트 소개&#10;&#10;마크다운 형식으로 작성해주세요"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* ── File Dropzone ─────────────────────────────────────── */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">파일 첨부</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">파일을 드래그하거나 클릭하여 업로드</p>
            <p className="text-xs text-gray-400">
              허용: {ALLOWED_EXTENSIONS.join(', ')} · 최대 {MAX_FILE_SIZE_MB}MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </div>

          {/* Attached file list */}
          {attachedFiles.length > 0 && (
            <ul className="mt-3 space-y-2">
              {attachedFiles.map((af, i) => (
                <li key={i} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${af.error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    {af.error
                      ? <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                      : <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                    }
                    <span className="truncate text-gray-700">{af.file.name}</span>
                    {af.error && <span className="ml-1 shrink-0 text-xs text-red-500">{af.error}</span>}
                  </div>
                  <button type="button" onClick={() => removeFile(i)} className="ml-2 shrink-0 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Submit error ─────────────────────────────────────── */}
        {submitError && (
          <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {submitError}
          </p>
        )}

        {/* ── Actions ──────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !form.title.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                업로드 중...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                프로젝트 등록
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}
