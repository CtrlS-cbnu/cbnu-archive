import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useSearchStore } from '@/store/searchStore'
import { searchKeyword } from '@/api/search'
import { ProjectCard } from '@/components/project/ProjectCard'
import type { ProjectSummary } from '@/types/project'

const DOMAINS = ['웹', '앱', '인공지능', '백엔드', '클라우드', '보안', '데이터분석', '임베디드']

export default function Home() {
  const navigate = useNavigate()
  const { setKeyword, setFilter, setSearchType } = useSearchStore()
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<ProjectSummary[]>([])

  // Fetch the latest projects to show on the home page
  useEffect(() => {
    searchKeyword({ keyword: '', page: 0, size: 6 })
      .then((page) => setRecent(page.items ?? []))
      .catch(() => {})
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Home search is always keyword mode — reset type so ProjectList doesn't get stuck on 'natural'
    setSearchType('keyword')
    setKeyword(query.trim())
    navigate('/projects')
  }

  const handleDomain = (domain: string) => {
    setSearchType('keyword')
    setFilter('domains', [domain])
    navigate('/projects')
  }

  return (
    <div>
      {/* Hero — search-centric, no marketing copy */}
      <section className="-mx-4 -mt-8 bg-primary-600 px-4 pb-12 pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary-200">
            충북대학교 프로젝트 아카이브
          </p>
          <h1 className="mb-8 text-4xl font-bold text-white">
            CBNU Archive
          </h1>
          {/* Main search bar */}
          <form onSubmit={handleSearch} className="flex overflow-hidden rounded-xl shadow-lg">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="기술 스택, 주제, 교과목으로 검색..."
              className="flex-1 px-5 py-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-primary-800 px-6 text-sm font-medium text-white transition-colors hover:bg-primary-900"
            >
              <Search size={16} />
              검색
            </button>
          </form>
          {/* Domain quick-filters */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() => handleDomain(d)}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/25"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent projects */}
      <section className="py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">최근 등록 프로젝트</h2>
          <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700">
            전체 보기 →
          </Link>
        </div>

        {recent.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          /* Skeleton placeholders while loading */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
