import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

export interface AuthPayload {
  clientId: string;
  name: string;
}

export function generateToken(clientId: string, name: string): string {
  return jwt.sign({ clientId, name } satisfies AuthPayload, JWT_SECRET, { expiresIn: "365d" });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload;
    (req as any).client = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
