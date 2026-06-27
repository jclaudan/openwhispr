import express from "express";
import { getDb } from "./database.js";
import routes from "./routes.js";
import { generateToken, authMiddleware } from "./auth.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const API_TOKEN = process.env.API_TOKEN;

app.use(express.json({ limit: "10mb" }));

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

app.use("/api", authMiddleware);
app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ ok: true, version: 1 });
});

getDb();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`OpenWhispr sync server listening on port ${PORT}`);
});
