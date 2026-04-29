import { useRef } from 'react'
import { Search } from 'lucide-react'
import { useSearchStore } from '@/store/searchStore'

interface SearchBarProps {
  onSearch: () => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const { keyword, searchType, setKeyword, setSearchType } = useSearchStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit search on Enter key press
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 검색 타입 탭 */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {(['keyword', 'natural'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSearchType(type)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition ${
              searchType === type
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {type === 'keyword' ? '키워드 검색' : 'AI 자연어 검색'}
          </button>
        ))}
      </div>

      {/* 검색 입력창 */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            searchType === 'keyword'
              ? '프로젝트명, 기술 스택, 태그로 검색'
              : '"React와 Spring을 사용한 웹 프로젝트 찾아줘"'
          }
          className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-24 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={onSearch}
          className="absolute right-2 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          검색
        </button>
      </div>

      {/* AI 검색 안내 */}
      {searchType === 'natural' && (
        <p className="text-xs text-gray-400">
          자연어로 질문하면 AI가 관련 프로젝트를 찾고 설명해줍니다.
        </p>
      )}
    </div>
  )
}
