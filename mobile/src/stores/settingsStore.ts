import { create } from "zustand";
import type { ThemeMode, InferenceMode } from "../types";

interface SettingsState {
  serverUrl: string;
  apiToken: string;
  theme: ThemeMode;
  isConnected: boolean;
  transcriptionMode: InferenceMode;

  setServerUrl: (url: string) => void;
  setApiToken: (token: string) => void;
  setTheme: (theme: ThemeMode) => void;
  setConnected: (connected: boolean) => void;
  setTranscriptionMode: (mode: InferenceMode) => void;
  hydrate: () => void;
  persist: () => void;
}

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  serverUrl: "",
  apiToken: "",
  theme: "auto",
  isConnected: false,
  transcriptionMode: "self-hosted",

  setServerUrl: (url: string) => {
    set({ serverUrl: url });
    get().persist();
  },

  setApiToken: (token: string) => {
    set({ apiToken: token });
    get().persist();
  },

  setTheme: (theme: ThemeMode) => {
    set({ theme });
    get().persist();
  },

  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },

  setTranscriptionMode: (mode: InferenceMode) => {
    set({ transcriptionMode: mode });
    get().persist();
  },

  hydrate: () => {
    const storage = getStorage();
    if (!storage) return;
    try {
      const raw = storage.getItem("openwhispr:settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          serverUrl: parsed.serverUrl ?? "",
          apiToken: parsed.apiToken ?? "",
          theme: parsed.theme ?? "auto",
          isConnected: parsed.isConnected ?? false,
          transcriptionMode: parsed.transcriptionMode ?? "self-hosted",
        });
      }
    } catch {
      // ignore
    }
  },

  persist: () => {
    const storage = getStorage();
    if (!storage) return;
    const { serverUrl, apiToken, theme, isConnected, transcriptionMode } = get();
    storage.setItem(
      "openwhispr:settings",
      JSON.stringify({ serverUrl, apiToken, theme, isConnected, transcriptionMode }),
    );
  },
}));
