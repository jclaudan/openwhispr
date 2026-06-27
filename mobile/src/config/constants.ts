export const STORAGE_KEYS = {
  SERVER_URL: "openwhispr:serverUrl",
  API_TOKEN: "openwhispr:apiToken",
  THEME: "openwhispr:theme",
} as const;

export const API_TIMEOUT = 10000;
export const MAX_RETRIES = 3;
export const INITIAL_RETRY_DELAY = 1000;

export const COLORS = {
  primary: "#6366f1",
  primaryForeground: "#ffffff",
  destructive: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
  background: "#ffffff",
  foreground: "#09090b",
  muted: "#f4f4f5",
  mutedForeground: "#71717a",
  card: "#ffffff",
  cardForeground: "#09090b",
  border: "#e4e4e7",
  surface1: "#fafafa",
  surface2: "#f4f4f5",
  surfaceRaised: "#ffffff",
} as const;

export const DARK_COLORS: typeof COLORS = {
  primary: "#818cf8",
  primaryForeground: "#ffffff",
  destructive: "#f87171",
  success: "#4ade80",
  warning: "#fbbf24",
  background: "#09090b",
  foreground: "#fafafa",
  muted: "#27272a",
  mutedForeground: "#a1a1aa",
  card: "#18181b",
  cardForeground: "#fafafa",
  border: "#27272a",
  surface1: "#18181b",
  surface2: "#27272a",
  surfaceRaised: "#18181b",
};
