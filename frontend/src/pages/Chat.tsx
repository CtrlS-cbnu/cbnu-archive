import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '@/store/chatStore'
import { searchNatural } from '@/api/search'
import { ProjectCard } from '@/components/project/ProjectCard'
import type { ProjectSummary } from '@/types/project'

// Each message in the conversation (extends base ChatMessage with AI result metadata)
interface DisplayMessage {
  role: 'user' | 'assistant'
  content: string
  projects?: ProjectSummary[]
}

export default function Chat() {
  const { isLoading, setLoading } = useChatStore()
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom whenever a new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    setInput('')
    setError(null)

    // Append user message immediately so the UI feels responsive
    const userMsg: DisplayMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const result = await searchNatural(text)

      const assistantMsg: DisplayMessage = {
        role: 'assistant',
        content: result.answer || '관련 프로젝트를 찾았습니다.',
        projects: result.projects,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setError('AI 서비스 응답 중 오류가 발생했습니다. 서버 상태를 확인해주세요.')
      // Remove the optimistic user message on failure
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit with Enter; allow newline with Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <h1 className="mb-4 shrink-0 text-2xl font-bold text-gray-900">AI 챗봇 탐색</h1>

      {/* Message history */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray-400">
            <p className="text-lg font-medium">무엇이든 물어보세요.</p>
            <p className="text-sm">예: "React 사용한 팀 프로젝트 추천해줘"</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white shadow-sm border border-gray-200 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Related projects shown inside assistant bubble */}
              {msg.role === 'assistant' && msg.projects && msg.projects.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-gray-500">관련 프로젝트</p>
                  {msg.projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator while waiting for AI */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Anchor element — auto-scroll lands here */}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="mt-3 shrink-0 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="프로젝트를 자연어로 검색해보세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
          rows={2}
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="self-end rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          전송
        </button>
      </div>
    </div>
  )
}
