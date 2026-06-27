import { Router } from "express";
import { getDb } from "./database.js";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, version: 1 });
});

router.get("/folders", (_req, res) => {
  const rows = getDb().prepare(
    "SELECT id, cloud_id, name, is_default, sort_order, deleted_at, created_at, updated_at FROM folders WHERE deleted_at IS NULL ORDER BY sort_order"
  ).all();
  res.json({ data: rows });
});

router.post("/folders", (req, res) => {
  const { name, client_folder_id, is_default, sort_order } = req.body;
  const cloudId = uuid();
  const result = getDb().prepare(
    "INSERT INTO folders (cloud_id, client_id, name, is_default, sort_order) VALUES (?, ?, ?, ?, ?)"
  ).run(cloudId, client_folder_id ?? null, name ?? "Untitled", is_default ? 1 : 0, sort_order ?? 0);
  const row = getDb().prepare("SELECT * FROM folders WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ data: row });
});

router.patch("/folders/:cloudId", (req, res) => {
  const { name, sort_order } = req.body;
  const updates: string[] = [];
  const params: any[] = [];
  if (name !== undefined) { updates.push("name = ?"); params.push(name); }
  if (sort_order !== undefined) { updates.push("sort_order = ?"); params.push(sort_order); }
  if (updates.length === 0) return res.status(400).json({ error: "No fields to update" });
  updates.push("updated_at = CURRENT_TIMESTAMP");
  params.push(req.params.cloudId);
  getDb().prepare(`UPDATE folders SET ${updates.join(", ")} WHERE cloud_id = ?`).run(...params);
  const row = getDb().prepare("SELECT * FROM folders WHERE cloud_id = ?").get(req.params.cloudId);
  res.json({ data: row });
});

router.delete("/folders/:cloudId", (req, res) => {
  getDb().prepare("UPDATE folders SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE cloud_id = ?").run(req.params.cloudId);
  res.json({ success: true });
});

router.get("/notes", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const since = req.query.since as string | undefined;
  let query = "SELECT * FROM notes WHERE deleted_at IS NULL";
  const params: any[] = [];
  if (since) {
    query += " AND updated_at > ?";
    params.push(since);
  }
  query += " ORDER BY updated_at DESC LIMIT ?";
  params.push(limit);
  const rows = getDb().prepare(query).all(...params);
  res.json({ data: rows, has_more: rows.length === limit });
});

router.post("/notes", (req, res) => {
  const { client_note_id, title, content, note_type, folder_id, source_file, audio_duration_seconds, created_at, updated_at } = req.body;
  const cloudId = uuid();
  const result = getDb().prepare(`
    INSERT INTO notes (cloud_id, client_id, title, content, note_type, folder_id, source_file, audio_duration_seconds, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    cloudId,
    client_note_id ?? null,
    title ?? "Untitled Note",
    content ?? "",
    note_type ?? "personal",
    folder_id ?? null,
    source_file ?? null,
    audio_duration_seconds ?? null,
    created_at ?? new Date().toISOString(),
    updated_at ?? new Date().toISOString()
  );
  const row = getDb().prepare("SELECT * FROM notes WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ data: row });
});

router.patch("/notes/:cloudId", (req, res) => {
  const allowed = ["title", "content", "enhanced_content", "enhancement_prompt", "enhanced_at_content_hash", "note_type", "source_file", "audio_duration_seconds", "folder_id", "transcript", "participants", "calendar_event_id", "diarization_enabled", "expected_speaker_count"];
  const updates: string[] = [];
  const params: any[] = [];
  for (const field of allowed) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: "No fields to update" });
  updates.push("updated_at = CURRENT_TIMESTAMP");
  params.push(req.params.cloudId);
  getDb().prepare(`UPDATE notes SET ${updates.join(", ")} WHERE cloud_id = ?`).run(...params);
  const row = getDb().prepare("SELECT * FROM notes WHERE cloud_id = ?").get(req.params.cloudId);
  res.json({ data: row });
});

router.delete("/notes/:cloudId", (req, res) => {
  getDb().prepare("UPDATE notes SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE cloud_id = ?").run(req.params.cloudId);
  res.json({ success: true });
});

router.get("/transcriptions", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const since = req.query.since as string | undefined;
  let query = "SELECT * FROM transcriptions WHERE deleted_at IS NULL";
  const params: any[] = [];
  if (since) {
    query += " AND updated_at > ?";
    params.push(since);
  }
  query += " ORDER BY updated_at DESC LIMIT ?";
  params.push(limit);
  const rows = getDb().prepare(query).all(...params);
  res.json({ data: rows, has_more: rows.length === limit });
});

router.post("/transcriptions", (req, res) => {
  const { text, raw_text, processed_text, is_processed, processing_method, agent_name, provider, model, created_at } = req.body;
  const cloudId = uuid();
  const result = getDb().prepare(`
    INSERT INTO transcriptions (cloud_id, text, raw_text, processed_text, is_processed, processing_method, agent_name, provider, model, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    cloudId,
    text ?? "",
    raw_text ?? null,
    processed_text ?? null,
    is_processed ? 1 : 0,
    processing_method ?? "none",
    agent_name ?? null,
    provider ?? null,
    model ?? null,
    created_at ?? new Date().toISOString()
  );
  const row = getDb().prepare("SELECT * FROM transcriptions WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ data: row });
});

router.patch("/transcriptions/:cloudId", (req, res) => {
  const allowed = ["text", "raw_text", "processed_text", "is_processed", "processing_method", "agent_name", "error"];
  const updates: string[] = [];
  const params: any[] = [];
  for (const field of allowed) {
    if (req.body[field] !== undefined) {
      if (field === "is_processed") {
        updates.push("is_processed = ?");
        params.push(req.body[field] ? 1 : 0);
      } else {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: "No fields to update" });
  updates.push("updated_at = CURRENT_TIMESTAMP");
  params.push(req.params.cloudId);
  getDb().prepare(`UPDATE transcriptions SET ${updates.join(", ")} WHERE cloud_id = ?`).run(...params);
  const row = getDb().prepare("SELECT * FROM transcriptions WHERE cloud_id = ?").get(req.params.cloudId);
  res.json({ data: row });
});

router.delete("/transcriptions/:cloudId", (req, res) => {
  getDb().prepare("UPDATE transcriptions SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE cloud_id = ?").run(req.params.cloudId);
  res.json({ success: true });
});

router.get("/dictionary", (_req, res) => {
  const rows = getDb().prepare("SELECT id, word, created_at FROM custom_dictionary ORDER BY word").all();
  res.json({ data: rows });
});

router.post("/dictionary", (req, res) => {
  const { words } = req.body;
  if (!Array.isArray(words)) return res.status(400).json({ error: "words must be an array" });
  const insert = getDb().prepare("INSERT OR IGNORE INTO custom_dictionary (word) VALUES (?)");
  const tx = getDb().transaction((ws: string[]) => {
    for (const w of ws) insert.run(w);
  });
  tx(words);
  const rows = getDb().prepare("SELECT * FROM custom_dictionary ORDER BY word").all();
  res.json({ data: rows });
});

router.delete("/dictionary/:word", (req, res) => {
  getDb().prepare("DELETE FROM custom_dictionary WHERE word = ?").run(decodeURIComponent(req.params.word));
  res.json({ success: true });
});

export default router;
