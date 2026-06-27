import { create } from "zustand";
import { api } from "../services/api";
import type { Note, Folder } from "../types";
import { logger } from "../utils/logger";

interface NotesState {
  notes: Note[];
  folders: Folder[];
  activeFolderId: number | null;
  isLoading: boolean;
  error: string | null;

  fetchNotes: () => Promise<void>;
  fetchFolders: () => Promise<void>;
  createNote: (title?: string, content?: string, folderId?: number) => Promise<Note | null>;
  updateNote: (cloudId: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (cloudId: string) => Promise<void>;
  setActiveFolder: (folderId: number | null) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  folders: [],
  activeFolderId: null,
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    if (!api.isConfigured()) return;
    set({ isLoading: true, error: null });
    try {
      const result = await api.get<{ data: Note[] }>("/api/notes");
      set({ notes: result.data, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load notes";
      set({ error: message, isLoading: false });
      logger.error("Failed to fetch notes", { error: message });
    }
  },

  fetchFolders: async () => {
    if (!api.isConfigured()) return;
    try {
      const result = await api.get<{ data: Folder[] }>("/api/folders");
      set({ folders: result.data });
    } catch (err) {
      logger.error("Failed to fetch folders", { error: err });
    }
  },

  createNote: async (title?: string, content?: string, folderId?: number) => {
    if (!api.isConfigured()) return null;
    try {
      const result = await api.post<{ data: Note }>("/api/notes", {
        title: title ?? "Untitled Note",
        content: content ?? "",
        folder_id: folderId ?? null,
      });
      set((s) => ({ notes: [result.data, ...s.notes] }));
      return result.data;
    } catch (err) {
      logger.error("Failed to create note", { error: err });
      return null;
    }
  },

  updateNote: async (cloudId: string, updates: Partial<Note>) => {
    if (!api.isConfigured()) return;
    try {
      await api.patch(`/api/notes/${cloudId}`, updates);
      set((s) => ({
        notes: s.notes.map((n) => (n.cloud_id === cloudId ? { ...n, ...updates } : n)),
      }));
    } catch (err) {
      logger.error("Failed to update note", { error: err });
    }
  },

  deleteNote: async (cloudId: string) => {
    if (!api.isConfigured()) return;
    try {
      await api.delete(`/api/notes/${cloudId}`);
      set((s) => ({ notes: s.notes.filter((n) => n.cloud_id !== cloudId) }));
    } catch (err) {
      logger.error("Failed to delete note", { error: err });
    }
  },

  setActiveFolder: (folderId: number | null) => {
    set({ activeFolderId: folderId });
  },
}));
