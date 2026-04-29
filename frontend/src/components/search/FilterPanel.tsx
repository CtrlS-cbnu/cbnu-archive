import { useSearchStore } from '@/store/searchStore'
import { Button } from '@/components/ui/Button'

// Available filter options — will be replaced with API data when backend is ready
const TECH_OPTIONS = ['React', 'Spring Boot', 'FastAPI', 'PostgreSQL', 'PyTorch', 'TypeScript', 'Python', 'Docker']
const SEMESTER_OPTIONS: (1 | 2)[] = [1, 2]
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

export function FilterPanel() {
  const { filters, setFilter, resetFilters } = useSearchStore()

  const toggleArrayItem = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item]

  const hasActiveFilter =
    filters.years.length > 0 ||
    filters.semester !== null ||
    filters.techStacks.length > 0 ||
    filters.isTeam !== null

  return (
    <aside className="w-56 shrink-0 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">필터</span>
        {hasActiveFilter && (
          <button onClick={resetFilters} className="text-xs text-primary-600 hover:underline">
            초기화
          </button>
        )}
      </div>

      {/* 연도 */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">수행 연도</p>
        <div className="flex flex-wrap gap-1.5">
          {YEAR_OPTIONS.map((year) => (
            <button
              key={year}
              onClick={() => setFilter('years', toggleArrayItem(filters.years, year))}
              className={`rounded-md border px-2.5 py-1 text-xs transition ${
                filters.years.includes(year)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* 학기 */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">학기</p>
        <div className="flex gap-2">
          {SEMESTER_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter('semester', filters.semester === s ? null : s)}
              className={`flex-1 rounded-md border py-1 text-xs transition ${
                filters.semester === s
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {s}학기
            </button>
          ))}
        </div>
      </div>

      {/* 기술 스택 */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">기술 스택</p>
        <div className="flex flex-wrap gap-1.5">
          {TECH_OPTIONS.map((tech) => (
            <button
              key={tech}
              onClick={() => setFilter('techStacks', toggleArrayItem(filters.techStacks, tech))}
              className={`rounded-md border px-2.5 py-1 text-xs transition ${
                filters.techStacks.includes(tech)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      {/* 팀 프로젝트 여부 */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">구분</p>
        <div className="flex gap-2">
          {[
            { label: '팀', value: true },
            { label: '개인', value: false },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setFilter('isTeam', filters.isTeam === value ? null : value)}
              className={`flex-1 rounded-md border py-1 text-xs transition ${
                filters.isTeam === value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={resetFilters}>
        전체 초기화
      </Button>
    </aside>
  )
}
