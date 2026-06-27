import { API_TIMEOUT, MAX_RETRIES, INITIAL_RETRY_DELAY } from "../config/constants";
import { logger } from "../utils/logger";

class ApiClient {
  private baseUrl = "";
  private token = "";

  configure(url: string, token: string) {
    this.baseUrl = url.replace(/\/+$/, "");
    this.token = token;
  }

  isConfigured(): boolean {
    return !!this.baseUrl && !!this.token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    retries = MAX_RETRIES,
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error("Server not configured");
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

        const headers: Record<string, string> = {
          Authorization: `Bearer ${this.token}`,
        };
        const opts: RequestInit = {
          method,
          headers,
          signal: controller.signal,
        };
        if (body !== undefined) {
          headers["Content-Type"] = "application/json";
          opts.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.baseUrl}${path}`, opts);
        clearTimeout(timeout);

        if (response.status === 401) {
          throw new Error("Session expired");
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || `API error: ${response.status}`);
        }
        return data as T;
      } catch (err) {
        const isLastAttempt = attempt === retries;
        if (isLastAttempt) {
          const message = err instanceof Error ? err.message : "Request failed";
          logger.error(`API ${method} ${path} failed`, { error: message });
          throw new Error(message);
        }
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        logger.debug(`Retrying ${method} ${path} in ${delay}ms (attempt ${attempt + 1})`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw new Error("Unreachable");
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  delete<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("DELETE", path, body);
  }

  async uploadAudio(path: string, uri: string): Promise<unknown> {
    if (!this.isConfigured()) throw new Error("Server not configured");

    const formData = new FormData();
    formData.append("audio", {
      uri,
      type: "audio/wav",
      name: "recording.wav",
    } as any);

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || `Upload failed: ${response.status}`);
    }
    return response.json();
  }
}

export const api = new ApiClient();
