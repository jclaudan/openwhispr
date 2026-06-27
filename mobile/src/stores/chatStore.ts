import { create } from "zustand";
import { api } from "../services/api";
import type { Conversation, Message } from "../types";
import { logger } from "../utils/logger";

interface ChatState {
  conversations: Conversation[];
  messages: Record<number, Message[]>;
  loading: boolean;
  error: string | null;

  fetchConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation | null>;
  deleteConversation: (cloudId: string) => Promise<void>;
  fetchMessages: (conversationCloudId: string) => Promise<void>;
  sendMessage: (conversationCloudId: string, content: string) => Promise<Message | null>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  loading: false,
  error: null,

  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.getConversations();
      set({ conversations: res.data, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch conversations";
      set({ error: message, loading: false });
      logger.error("fetchConversations failed", { error: message });
    }
  },

  createConversation: async (title?: string) => {
    try {
      const res = await api.createConversation(title);
      set((s) => ({ conversations: [res.data, ...s.conversations] }));
      return res.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create conversation";
      set({ error: message });
      logger.error("createConversation failed", { error: message });
      return null;
    }
  },

  deleteConversation: async (cloudId: string) => {
    try {
      await api.deleteConversation(cloudId);
      set((s) => ({ conversations: s.conversations.filter((c) => c.cloud_id !== cloudId) }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete conversation";
      set({ error: message });
      logger.error("deleteConversation failed", { error: message });
    }
  },

  fetchMessages: async (conversationCloudId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.getMessages(conversationCloudId);
      set((s) => ({
        messages: { ...s.messages, [conversationCloudId]: res.data },
        loading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch messages";
      set({ error: message, loading: false });
      logger.error("fetchMessages failed", { error: message });
    }
  },

  sendMessage: async (conversationCloudId: string, content: string) => {
    try {
      const tempUser: Message = {
        id: Date.now(),
        conversation_id: 0,
        role: "user",
        content,
        metadata: null,
        created_at: new Date().toISOString(),
      };
      set((s) => ({
        messages: {
          ...s.messages,
          [conversationCloudId]: [...(s.messages[conversationCloudId] || []), tempUser],
        },
      }));

      const res = await api.sendMessage(conversationCloudId, "user", content);
      set((s) => ({
        messages: {
          ...s.messages,
          [conversationCloudId]: (s.messages[conversationCloudId] || []).map((m) =>
            m.id === tempUser.id ? res.data : m,
          ),
        },
      }));
      return res.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      set({ error: message });
      logger.error("sendMessage failed", { error: message });
      return null;
    }
  },
}));
