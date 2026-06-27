import { create } from "zustand";
import { api } from "../services/api";
import type { Transcription } from "../types";
import { logger } from "../utils/logger";

interface TranscriptionState {
  transcriptions: Transcription[];
  isLoading: boolean;
  error: string | null;

  fetchTranscriptions: () => Promise<void>;
  deleteTranscription: (cloudId: string) => Promise<void>;
}

export const useTranscriptionStore = create<TranscriptionState>((set) => ({
  transcriptions: [],
  isLoading: false,
  error: null,

  fetchTranscriptions: async () => {
    if (!api.isConfigured()) return;
    set({ isLoading: true, error: null });
    try {
      const result = await api.get<{ data: Transcription[] }>("/api/transcriptions");
      set({ transcriptions: result.data, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load transcriptions";
      set({ error: message, isLoading: false });
      logger.error("Failed to fetch transcriptions", { error: message });
    }
  },

  deleteTranscription: async (cloudId: string) => {
    if (!api.isConfigured()) return;
    try {
      await api.delete(`/api/transcriptions/${cloudId}`);
      set((s) => ({
        transcriptions: s.transcriptions.filter((t) => t.cloud_id !== cloudId),
      }));
    } catch (err) {
      logger.error("Failed to delete transcription", { error: err });
    }
  },
}));
