import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { getDb } from "./database.js";
import routes from "./routes.js";
import { generateToken, authMiddleware } from "./auth.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const API_TOKEN = process.env.API_TOKEN;

const upload = multer({ dest: path.join(os.tmpdir(), "openwhispr-uploads") });

app.use(express.json({ limit: "10mb" }));
app.use("/api/transcribe", upload.single("audio"));

app.post("/api/auth/token", (req, res) => {
  const { token } = req.body;
  if (!API_TOKEN || token !== API_TOKEN) {
    res.status(403).json({ error: "Invalid setup token" });
    return;
  }
  const clientId = req.body.client_id || `client-${Date.now()}`;
  const name = req.body.name || "default";
  const jwt = generateToken(clientId, name);
  res.json({ token: jwt, client_id: clientId });
});

async function forwardToDesktop(audioPath: string): Promise<string> {
  const desktopUrl = process.env.DESKTOP_BRIDGE_URL;
  const desktopToken = process.env.DESKTOP_BRIDGE_TOKEN;

  let url: string;
  let token: string;

  if (desktopUrl && desktopToken) {
    url = desktopUrl.replace(/\/+$/, "");
    token = desktopToken;
  } else {
    const bridgePath = path.join(os.homedir(), ".openwhispr", "cli-bridge.json");
    if (!fs.existsSync(bridgePath)) {
      throw new Error("Desktop bridge not found. Start the desktop app or set DESKTOP_BRIDGE_URL and DESKTOP_BRIDGE_TOKEN");
    }
    const bridge = JSON.parse(fs.readFileSync(bridgePath, "utf-8"));
    url = `http://127.0.0.1:${bridge.port}`;
    token = bridge.token;
  }

  const audioBuffer = fs.readFileSync(audioPath);
  const response = await fetch(`${url}/v1/transcribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      Authorization: `Bearer ${token}`,
    },
    body: audioBuffer,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }));
    throw new Error(err?.error?.message || `Desktop bridge error: ${response.status}`);
  }

  const result = await response.json();
  return result?.data?.text || "";
}

async function transcribeViaOpenAI(audioPath: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const audioBuffer = fs.readFileSync(audioPath);
  const blob = new Blob([audioBuffer], { type: "audio/wav" });
  const formData = new FormData();
  formData.append("file", blob, "recording.wav");
  formData.append("model", "whisper-1");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message || `OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  return result?.text || "";
}

app.post("/api/transcribe", async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Audio file is required" });
      return;
    }

    let text: string;
    const hasDesktopBridge = !!(process.env.DESKTOP_BRIDGE_URL && process.env.DESKTOP_BRIDGE_TOKEN) ||
      fs.existsSync(path.join(os.homedir(), ".openwhispr", "cli-bridge.json"));

    if (hasDesktopBridge) {
      text = await forwardToDesktop(req.file.path);
    } else if (process.env.OPENAI_API_KEY) {
      text = await transcribeViaOpenAI(req.file.path);
    } else {
      res.status(400).json({
        error: "No transcription backend configured. Set DESKTOP_BRIDGE_URL + DESKTOP_BRIDGE_TOKEN, or OPENAI_API_KEY",
      });
      return;
    }

    const { v4: uuid } = await import("uuid");
    const cloudId = uuid();
    getDb().prepare(`
      INSERT INTO transcriptions (cloud_id, text, provider, model)
      VALUES (?, ?, ?, ?)
    `).run(cloudId, text, "whisper", "whisper-1");

    res.json({ data: { text, cloud_id: cloudId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    res.status(500).json({ error: message });
  } finally {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

app.use("/api", authMiddleware);
app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ ok: true, version: 1 });
});

getDb();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`OpenWhispr sync server listening on port ${PORT}`);
});
