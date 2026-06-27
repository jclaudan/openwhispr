import { create } from "zustand";
import type { ThemeMode, InferenceMode } from "../types";
import { logger } from "../utils/logger";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {
  logger.warn("AsyncStorage not available, settings won't persist");
}

const STORAGE_KEY = "openwhispr:settings";
const memoryStore = new Map<string, string>();

async function getItem(key: string): Promise<string | null> {
  try {
    if (AsyncStorage) return AsyncStorage.getItem(key);
    return memoryStore.get(key) ?? null;
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    if (AsyncStorage) return AsyncStorage.setItem(key, value);
    memoryStore.set(key, value);
  } catch {
    memoryStore.set(key, value);
  }
}

interface PersistedSettings {
  serverUrl: string;
  apiToken: string;
  theme: ThemeMode;
  transcriptionMode: InferenceMode;
}

interface SettingsState {
  serverUrl: string;
  apiToken: string;
  theme: ThemeMode;
  isConnected: boolean;
  isHydrated: boolean;
  transcriptionMode: InferenceMode;

  setServerUrl: (url: string) => void;
  setApiToken: (token: string) => void;
  setTheme: (theme: ThemeMode) => void;
  setConnected: (connected: boolean) => void;
  setTranscriptionMode: (mode: InferenceMode) => void;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  serverUrl: "",
  apiToken: "",
  theme: "auto",
  isConnected: false,
  isHydrated: false,
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

  hydrate: async () => {
    try {
      const raw = await getItem(STORAGE_KEY);
      if (raw) {
        const parsed: PersistedSettings = JSON.parse(raw);
        set({
          serverUrl: parsed.serverUrl ?? "",
          apiToken: parsed.apiToken ?? "",
          theme: parsed.theme ?? "auto",
          transcriptionMode: parsed.transcriptionMode ?? "self-hosted",
          isHydrated: true,
        });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
    }
  },

  persist: async () => {
    const { serverUrl, apiToken, theme, transcriptionMode } = get();
    await setItem(
      STORAGE_KEY,
      JSON.stringify({ serverUrl, apiToken, theme, transcriptionMode } satisfies PersistedSettings),
    );
  },
}));
