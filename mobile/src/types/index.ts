export interface Note {
  id: number;
  client_id: number | null;
  cloud_id: string | null;
  title: string;
  content: string;
  enhanced_content: string | null;
  note_type: "personal" | "meeting" | "upload";
  source_file: string | null;
  audio_duration_seconds: number | null;
  folder_id: number | null;
  transcript: string | null;
  participants: string | null;
  calendar_event_id: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: number;
  cloud_id: string | null;
  name: string;
  is_default: boolean;
  sort_order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transcription {
  id: number;
  client_id: number | null;
  cloud_id: string | null;
  text: string;
  raw_text: string | null;
  processed_text: string | null;
  is_processed: boolean;
  processing_method: string;
  agent_name: string | null;
  has_audio: boolean;
  audio_duration_ms: number | null;
  provider: string | null;
  model: string | null;
  error: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: number;
  cloud_id: string | null;
  title: string;
  note_id: number | null;
  archived_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: string | null;
  created_at: string;
}

export type ThemeMode = "light" | "dark" | "auto";

export interface ServerConfig {
  url: string;
  token: string;
}

export type InferenceMode = "openwhispr" | "providers" | "local" | "self-hosted" | "enterprise";

export interface SettingsState {
  serverUrl: string;
  apiToken: string;
  theme: ThemeMode;
  isConnected: boolean;
  transcriptionMode: InferenceMode;
}
