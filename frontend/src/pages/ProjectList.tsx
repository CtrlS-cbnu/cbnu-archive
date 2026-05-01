import { useState, useCallback, useEffect } from 'react'
import { SearchBar } from '@/components/search/SearchBar'
import { FilterPanel } from '@/components/search/FilterPanel'
import { ProjectCard } from '@/components/project/ProjectCard'
import { useSearchStore } from '@/store/searchStore'
import { searchNaturalDirect, searchKeyword } from '@/api/search'
import type { NaturalSearchResultItem, NaturalSearchResult } from '@/types/chat'
import type { ProjectSummary } from '@/types/project'

// Map AI service result item to the ProjectSummary shape ProjectCard expects
function toProjectSummary(item: NaturalSearchResultItem): ProjectSummary {
  return {
    id: item.project_id,
    title: item.title,
    summary: item.topic,
    year: 0,
    semester: 1,
    subjectName: item.project_type,
    teamName: '',
    techStacks: item.tech_stack,
    tags: item.keywords,
    status: 'APPROVED',
    viewCount: 0,
    downloadCount: 0,
    createdAt: '',
  }
}

export default function ProjectList() {
  const { keyword, searchType, filters } = useSearchStore()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Natural search state
  const [naturalResult, setNaturalResult] = useState<NaturalSearchResult | null>(null)

  // Keyword search state (backend stub); pre-populated on mount
  const [keywordProjects, setKeywordProjects] = useState<ProjectSummary[]>([])

  // Load all projects on first render so the page isn't empty
  useEffect(() => {
    searchKeyword({ keyword: '', page: 0, size: 20 })
      .then((page) => setKeywordProjects(page.items ?? []))
      .catch(() => {/* silently skip if backend/MSW not available */})
  }, [])

  const handleSearch = useCallback(async () => {
    // Natural search always requires a query
    if (searchType === 'natural' && !keyword.trim()) return
    setIsLoading(true)
    setError(null)
    setNaturalResult(null)
    setKeywordProjects([])

    try {
      if (searchType === 'natural') {
        // Call AI service directly while backend proxy is not implemented
        const result = await searchNaturalDirect(keyword)
        setNaturalResult(result)
      } else {
        // Keyword search through backend; returns empty list until backend is ready
        const page = await searchKeyword({
          keyword: keyword,
          page: 0,
          size: 20,
        })
        setKeywordProjects(page.items ?? [])
      }
    } catch (e) {
      setError('검색 중 오류가 발생했습니다. 서버 상태를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [keyword, searchType, filters])

  // Derive display list from whichever search mode is active
  const naturalItems = naturalResult?.results ?? []
  const displayProjects = searchType === 'keyword' ? keywordProjects : []
  // Consider page "has results" when there's anything to show
  const hasResults = searchType === 'natural' ? naturalItems.length > 0 : displayProjects.length > 0

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">프로젝트 목록</h1>

      <SearchBar onSearch={handleSearch} />

      <div className="flex gap-6">
        {/* Sidebar filter — hidden on small screens */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <FilterPanel />
        </aside>

        {/* Main results area */}
        <section className="min-w-0 flex-1">
          {/* AI LLM summary box */}
          {naturalResult?.llm_answer && (
            <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <p className="mb-1 font-semibold">AI 답변</p>
              <p className="leading-relaxed">{naturalResult.llm_answer}</p>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          )}

          {/* Error message */}
          {!isLoading && error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {/* Empty state — shown only after a search is triggered */}
          {!isLoading && !error && !hasResults && (keyword.trim() !== '') && (
            <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
              <p className="text-lg font-medium">검색 결과가 없습니다.</p>
              <p className="text-sm">다른 키워드나 AI 자연어 검색을 시도해보세요.</p>
            </div>
          )}

          {/* Initial state — show all projects (no search yet) */}
          {!isLoading && !error && keyword.trim() === '' && searchType === 'natural' && (
            <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
              <p className="text-lg font-medium">AI에게 자유롭게 질문해보세요.</p>
              <p className="text-sm">예: "React로 만든 팀 프로젝트 추천해줘"</p>
            </div>
          )}

          {/* Natural search results */}
          {!isLoading && searchType === 'natural' && naturalItems.length > 0 && (
            <>
              <p className="mb-3 text-sm text-gray-500">
                총 <span className="font-semibold text-gray-800">{naturalResult!.count}</span>개의 프로젝트를 찾았습니다.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {naturalItems.map((item) => (
                  <ProjectCard
                    key={item.project_id}
                    project={toProjectSummary(item)}
                    matchReasons={item.reasons}
                  />
                ))}
              </div>
            </>
          )}

          {/* Keyword search results */}
          {!isLoading && searchType === 'keyword' && displayProjects.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {displayProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
