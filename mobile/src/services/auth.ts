import { logger } from "../utils/logger";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {
  logger.warn("@react-native-async-storage/async-storage not available, using in-memory fallback");
}

const TOKEN_STORAGE_KEY = "openwhispr:authToken";
const SERVER_URL_KEY = "openwhispr:serverUrl";

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

async function removeItem(key: string): Promise<void> {
  try {
    if (AsyncStorage) return AsyncStorage.removeItem(key);
    memoryStore.delete(key);
  } catch {
    memoryStore.delete(key);
  }
}

export async function getStoredToken(): Promise<string> {
  return (await getItem(TOKEN_STORAGE_KEY)) ?? "";
}

export async function getStoredServerUrl(): Promise<string> {
  return (await getItem(SERVER_URL_KEY)) ?? "";
}

export async function storeAuth(token: string, serverUrl: string) {
  await setItem(TOKEN_STORAGE_KEY, token);
  await setItem(SERVER_URL_KEY, serverUrl);
}

export async function clearAuth() {
  await removeItem(TOKEN_STORAGE_KEY);
  await removeItem(SERVER_URL_KEY);
}

export async function authenticate(
  serverUrl: string,
  setupToken: string,
  clientName?: string,
): Promise<{ token: string; client_id: string }> {
  const url = serverUrl.replace(/\/+$/, "");
  const response = await fetch(`${url}/api/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: setupToken,
      name: clientName ?? "mobile",
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || `Auth failed: ${response.status}`);
  }

  const result = await response.json();
  storeAuth(result.token, url);
  logger.info("Authenticated with server", { url });
  return result;
}
