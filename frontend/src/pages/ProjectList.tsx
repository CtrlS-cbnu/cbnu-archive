import { useState, useCallback, useEffect, useRef } from 'react'
import { SearchBar } from '@/components/search/SearchBar'
import { FilterPanel } from '@/components/search/FilterPanel'
import { ProjectCard } from '@/components/project/ProjectCard'
import { useSearchStore } from '@/store/searchStore'
import { searchNatural, searchKeyword } from '@/api/search'
import type { NaturalSearchBackendResult } from '@/api/search'
import type { ProjectSummary } from '@/types/project'

// Each entry in the chat history for natural language search conversations
interface ChatEntry {
  role: 'user' | 'ai'
  text?: string
  result?: NaturalSearchBackendResult
  loading?: boolean
  error?: boolean
}

export default function ProjectList() {
  const { keyword, searchType, filters, sort } = useSearchStore()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Natural search: maintain a conversation-style chat history
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([])

  // Keyword search results
  const [keywordProjects, setKeywordProjects] = useState<ProjectSummary[]>([])

  // Ref so filter-change effects always use the latest keyword without re-subscribing
  const keywordRef = useRef(keyword)
  keywordRef.current = keyword

  // Ref to auto-scroll to bottom of chat on new message
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Execute keyword search — reused by filter effect and handleSearch
  const execKeywordSearch = useCallback(async (kw: string) => {
    setIsLoading(true)
    setError(null)
    setChatHistory([])
    try {
      const result = await searchKeyword({
        keyword: kw || undefined,
        // Backend supports only a single year filter; if a range is selected (>1 year), skip the year
        // param so all years are returned rather than silently filtering by just the first year
        year: filters.years.length === 1 ? filters.years[0] : undefined,
        semester: filters.semester === 1 ? 'FIRST' : filters.semester === 2 ? 'SECOND' : undefined,
        domain: filters.domains[0],
        techStacks: filters.techStacks.length > 0 ? filters.techStacks : undefined,
        // null means "no filter", true/false means team/individual
        isTeam: filters.isTeam ?? undefined,
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
  useEffect(() => {
    if (searchType !== 'keyword') return
    execKeywordSearch(keywordRef.current)
  }, [filters, sort, searchType, execKeywordSearch])

  // Clear chat history when switching away from natural search mode
  useEffect(() => {
    if (searchType === 'keyword') setChatHistory([])
  }, [searchType])

  // Scroll to bottom of chat whenever a new message is appended
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleSearch = useCallback(async () => {
    if (searchType === 'natural') {
      if (!keyword.trim()) return
      // Append user message bubble, then add a loading AI bubble
      const userQuery = keyword.trim()
      setChatHistory((prev) => [
        ...prev,
        { role: 'user', text: userQuery },
        { role: 'ai', loading: true },
      ])
      setIsLoading(true)
      setError(null)
      setKeywordProjects([])
      try {
        const result = await searchNatural(userQuery)
        // Replace the loading AI bubble with the actual result
        setChatHistory((prev) => [
          ...prev.slice(0, -1),
          { role: 'ai', result },
        ])
      } catch {
        // Replace loading bubble with an error bubble
        setChatHistory((prev) => [
          ...prev.slice(0, -1),
          { role: 'ai', error: true, text: '오류가 발생했습니다. 서버 상태를 확인해주세요.' },
        ])
      } finally {
        setIsLoading(false)
      }
    } else {
      execKeywordSearch(keyword)
    }
  }, [keyword, searchType, execKeywordSearch])

  const displayProjects = searchType === 'keyword' ? keywordProjects : []
  const hasResults = searchType === 'keyword' ? displayProjects.length > 0 : chatHistory.length > 0

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

          {/* ── Natural language search: chat conversation view ─────── */}
          {searchType === 'natural' && (
            <div className="flex flex-col gap-4">
              {/* Placeholder prompt when no conversation has started yet */}
              {chatHistory.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
                  <p className="text-lg font-medium">AI에게 자유롭게 질문해보세요.</p>
                  <p className="text-sm">예: "React로 만든 팀 프로젝트 추천해줘"</p>
                </div>
              )}

              {/* Chat bubbles */}
              {chatHistory.map((entry, i) => (
                <div key={i} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {entry.role === 'user' ? (
                    // User query bubble — right-aligned
                    <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-primary-600 px-4 py-2.5 text-sm text-white shadow-sm">
                      {entry.text}
                    </div>
                  ) : (
                    // AI response bubble — left-aligned
                    <div className="flex max-w-[85%] flex-col gap-3">
                      <div className={`rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm ${entry.error ? 'bg-red-50 text-red-700' : 'bg-white text-gray-800 ring-1 ring-gray-200'}`}>
                        {entry.loading ? (
                          // Animated typing indicator while waiting for AI
                          <span className="inline-flex gap-1">
                            <span className="animate-bounce [animation-delay:0ms]">·</span>
                            <span className="animate-bounce [animation-delay:150ms]">·</span>
                            <span className="animate-bounce [animation-delay:300ms]">·</span>
                          </span>
                        ) : entry.result ? (
                          <div>
                            <p className="mb-1 font-semibold text-blue-700">AI 답변</p>
                            <p className="leading-relaxed">{entry.result.answer}</p>
                          </div>
                        ) : (
                          entry.text
                        )}
                      </div>

                      {/* Skeleton loading cards while AI is processing */}
                      {entry.loading && (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <div key={j} className="h-40 animate-pulse rounded-xl bg-gray-100" />
                          ))}
                        </div>
                      )}

                      {/* Actual project cards under the AI bubble */}
                      {entry.result && entry.result.projects.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs text-gray-500">
                            총 <span className="font-semibold text-gray-700">{entry.result.projects.length}</span>개의 프로젝트를 추천합니다.
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {entry.result.projects.map((project) => (
                              <ProjectCard key={project.id} project={project} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Invisible anchor to scroll into view on new message */}
              <div ref={chatBottomRef} />
            </div>
          )}

          {/* ── Keyword search results ───────────────────────────────── */}
          {searchType === 'keyword' && (
            <>
              {/* Skeleton loading grid */}
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

              {/* Empty state */}
              {!isLoading && !error && !hasResults && keyword.trim() !== '' && (
                <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
                  <p className="text-lg font-medium">검색 결과가 없습니다.</p>
                  <p className="text-sm">다른 키워드나 AI 자연어 검색을 시도해보세요.</p>
                </div>
              )}

              {/* Results grid */}
              {!isLoading && displayProjects.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {displayProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
