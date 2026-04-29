import { Link } from 'react-router-dom'
import type { ProjectSummary } from '@/types/project'
import { ProjectStatusBadge } from './ProjectStatusBadge'

interface ProjectCardProps {
  project: ProjectSummary
  /** AI 검색 결과에서 넘어온 추천 이유 (선택) */
  matchReasons?: string[]
  showStatus?: boolean
}

export function ProjectCard({ project, matchReasons, showStatus = false }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
          {project.title}
        </h3>
        {showStatus && <ProjectStatusBadge status={project.status} />}
      </div>

      {/* 한 줄 소개 */}
      <p className="line-clamp-2 text-sm text-gray-500">{project.summary}</p>

      {/* 기술 스택 태그 */}
      {project.techStacks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.techStacks.slice(0, 5).map((stack) => (
            <span
              key={stack}
              className="rounded-md bg-primary-50 px-2 py-0.5 text-xs text-primary-700"
            >
              {stack}
            </span>
          ))}
          {project.techStacks.length > 5 && (
            <span className="text-xs text-gray-400">+{project.techStacks.length - 5}</span>
          )}
        </div>
      )}

      {/* AI 추천 이유 */}
      {matchReasons && matchReasons.length > 0 && (
        <div className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
          💡 {matchReasons.join(' · ')}
        </div>
      )}

      {/* 하단 메타 */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>{project.year}년 {project.semester}학기</span>
        <span>·</span>
        <span>{project.subjectName}</span>
        {project.teamName && (
          <>
            <span>·</span>
            <span>{project.teamName}</span>
          </>
        )}
      </div>
    </Link>
  )
}
