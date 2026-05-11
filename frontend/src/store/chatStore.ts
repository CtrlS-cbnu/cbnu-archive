import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage } from '@/types/chat'

interface ChatState {
  sessionId: string | null
  messages: ChatMessage[]
  isLoading: boolean
  setSessionId: (id: string) => void
  addMessage: (message: ChatMessage) => void
  setLoading: (loading: boolean) => void
  resetSession: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      sessionId: null,
      messages: [],
      isLoading: false,
      setSessionId: (sessionId) => set({ sessionId }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setLoading: (isLoading) => set({ isLoading }),
      // isLoading is transient — always reset to false on restore
      resetSession: () => set({ sessionId: null, messages: [], isLoading: false }),
    }),
    {
      name: 'cbnu-chat-history',
      // Only persist session data, not transient loading state
      partialize: (state) => ({ sessionId: state.sessionId, messages: state.messages }),
    },
  ),
)
