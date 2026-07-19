import { create } from 'zustand';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (prompt: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  sendMessage: async (prompt: string) => {
    const state = get();
    if (!window.hms || state.isStreaming) return;
    set({ isStreaming: true });
    const userMessage: ChatMessage = { role: 'user', content: prompt, timestamp: Date.now() };
    set(s => ({ messages: [...s.messages, userMessage] }));
    try {
      const response = await window.hms.ai.chat({ prompt });
      set(s => ({
        messages: [...s.messages, { role: 'assistant', content: response.reply, timestamp: Date.now() }],
        isStreaming: false,
      }));
    } catch (error) {
      set(s => ({
        messages: [...s.messages, { role: 'assistant', content: 'Error: Unable to communicate with Hermes.', timestamp: Date.now() }],
        isStreaming: false,
      }));
    }
  },
  clearMessages: () => set({ messages: [] }),
}));
