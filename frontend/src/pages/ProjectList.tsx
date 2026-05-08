import { useState, useCallback, useEffect, useRef } from 'react'
import { SearchBar } from '@/components/search/SearchBar'
import { FilterPanel } from '@/components/search/FilterPanel'
import { ProjectCard } from '@/components/project/ProjectCard'
import { useSearchStore } from '@/store/searchStore'
import { searchNatural, searchKeyword } from '@/api/search'
import type { NaturalSearchBackendResult } from '@/api/search'
import type { ProjectSummary } from '@/types/project'

export default function ProjectList() {
  const { keyword, searchType, filters, sort } = useSearchStore()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Natural search state
  const [naturalResult, setNaturalResult] = useState<NaturalSearchBackendResult | null>(null)

  // Keyword search results
  const [keywordProjects, setKeywordProjects] = useState<ProjectSummary[]>([])

  // Ref so filter-change effects always use the latest keyword without re-subscribing
  const keywordRef = useRef(keyword)
  keywordRef.current = keyword

  // Execute keyword search — reused by filter effect and handleSearch
  const execKeywordSearch = useCallback(async (kw: string) => {
    setIsLoading(true)
    setError(null)
    setNaturalResult(null)
    try {
      const result = await searchKeyword({
        keyword: kw || undefined,
        // Map array filters to single values that the current backend accepts
        year: filters.years[0],
        semester: filters.semester === 1 ? 'FIRST' : filters.semester === 2 ? 'SECOND' : undefined,
        domain: filters.domains[0],
        techStacks: filters.techStacks.length > 0 ? filters.techStacks : undefined,
        sort,
        page: 0,
        size: 20,
      })
      setKeywordProjects(result.items ?? [])
    } catch {
      setError('검색 중 오류가 발생했습니다. 서버 상태를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [filters, sort])

  // On mount and whenever filters/sort change, re-run keyword search automatically
  // keywordRef ensures we always use the latest keyword without adding it as a dep
  useEffect(() => {
    if (searchType !== 'keyword') return
    execKeywordSearch(keywordRef.current)
  }, [filters, sort, searchType, execKeywordSearch])

  const handleSearch = useCallback(async () => {
    if (searchType === 'natural') {
      // Natural search always requires a query
      if (!keyword.trim()) return
      setIsLoading(true)
      setError(null)
      setNaturalResult(null)
      setKeywordProjects([])
      try {
        const result = await searchNatural(keyword)
        setNaturalResult(result)
      } catch {
        setError('검색 중 오류가 발생했습니다. 서버 상태를 확인해주세요.')
      } finally {
        setIsLoading(false)
      }
    } else {
      // Keyword search: run immediately with current keyword + active filters
      execKeywordSearch(keyword)
    }
  }, [keyword, searchType, execKeywordSearch])

  // Derive display list from whichever search mode is active
  const naturalItems = naturalResult?.projects ?? []
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
          {/* AI answer box */}
          {naturalResult?.answer && (
            <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <p className="mb-1 font-semibold">AI 답변</p>
              <p className="leading-relaxed">{naturalResult.answer}</p>
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
                총 <span className="font-semibold text-gray-800">{naturalItems.length}</span>개의 프로젝트를 찾았습니다.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {naturalItems.map((project) => (
                  <ProjectCard key={project.id} project={project} />
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
