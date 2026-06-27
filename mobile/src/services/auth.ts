import { logger } from "../utils/logger";

const TOKEN_STORAGE_KEY = "openwhispr:authToken";
const SERVER_URL_KEY = "openwhispr:serverUrl";

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getStoredToken(): string {
  return getStorage()?.getItem(TOKEN_STORAGE_KEY) ?? "";
}

export function getStoredServerUrl(): string {
  return getStorage()?.getItem(SERVER_URL_KEY) ?? "";
}

export function storeAuth(token: string, serverUrl: string) {
  getStorage()?.setItem(TOKEN_STORAGE_KEY, token);
  getStorage()?.setItem(SERVER_URL_KEY, serverUrl);
}

export function clearAuth() {
  getStorage()?.removeItem(TOKEN_STORAGE_KEY);
  getStorage()?.removeItem(SERVER_URL_KEY);
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
