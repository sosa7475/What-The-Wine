import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "crypto";
import { storage } from "./storage";
import type { Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

const SECRET = process.env.SESSION_SECRET || "wine-app-secret-key-development";
const COOKIE_NAME = "wtw_auth";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 1 week in ms

// ---------------------------------------------------------------------------
// Minimal HMAC-signed token — no external JWT library needed
// ---------------------------------------------------------------------------

function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token: string): Record<string, unknown> | null {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", SECRET).update(body).digest("base64url");
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    return null;
  }
}

function parseCookies(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (req.headers.cookie || "").split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    out[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return out;
}

// ---------------------------------------------------------------------------
// Public helpers used by routes
// ---------------------------------------------------------------------------

export function setAuthCookie(res: Response, userId: number): void {
  const token = sign({ userId, iat: Date.now() });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function getAuthUserId(req: Request): number | null {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;
  const payload = verify(token);
  if (!payload || typeof payload.userId !== "number") return null;
  return payload.userId;
}

// ---------------------------------------------------------------------------
// API key auth — for programmatic / agent access via Bearer token
// Format: wtw_<signed_payload>
// ---------------------------------------------------------------------------

const API_KEY_PREFIX = "wtw_";

export function generateApiKey(userId: number): string {
  const raw = sign({ userId, type: "apikey" });
  return `${API_KEY_PREFIX}${raw}`;
}

export function getApiKeyUserId(req: Request): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token.startsWith(API_KEY_PREFIX)) return null;
  const raw = token.slice(API_KEY_PREFIX.length);
  const payload = verify(raw);
  if (!payload || typeof payload.userId !== "number" || payload.type !== "apikey") return null;
  return payload.userId;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------------------------------------------------------------------------
// Express middleware
// ---------------------------------------------------------------------------

function resolveUserId(req: Request): number | null {
  return getApiKeyUserId(req) ?? getAuthUserId(req);
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const userId = resolveUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Authentication required. Use a session cookie or Authorization: Bearer <api_key>." });
  }
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const userId = resolveUserId(req);
  if (userId) {
    try {
      const user = await storage.getUser(userId);
      if (user) req.user = user;
    } catch (error) {
      console.error("Optional auth error:", error);
    }
  }
  next();
};
