import type { ProjectSummary } from './project'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  projects?: ProjectSummary[]
  suggestedFollowUps?: string[]
}

export interface ChatRequest {
  message: string
  sessionId: string | null
}

export interface ChatResponse {
  sessionId: string
  reply: string
  projects: ProjectSummary[]
  suggestedFollowUps: string[]
}

// Matches actual AI service response shape from POST /search
export interface NaturalSearchResultItem {
  project_id: number
  title: string
  topic: string
  tech_stack: string[]
  keywords: string[]
  difficulty: string
  project_type: string
  rank: number
  final_score: number
  reasons: string[]
}

export interface NaturalSearchResult {
  query: string
  count: number
  results: NaturalSearchResultItem[]
  llm_answer: string | null
}
