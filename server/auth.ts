import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import { storage } from "./storage";
import type { Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    user?: User;
  }
}

// connect-pg-simple requires callback-based pg.Pool, not Neon's Promise-only pool.
// Also strip channel_binding which the pg driver does not support.
function buildSessionPool() {
  const raw = process.env.DATABASE_URL || "";
  let url: string;
  try {
    const u = new URL(raw);
    u.searchParams.delete("channel_binding");
    url = u.toString();
  } catch {
    url = raw;
  }
  return new pg.Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 2,
  });
}

const PgStore = connectPgSimple(session);

export function getSession() {
  return session({
    store: new PgStore({
      pool: buildSessionPool(),
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "wine-app-secret-key-development",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "User not found" });
    }

    req.session.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.session.user = user;
      }
    } catch (error) {
      console.error("Optional auth error:", error);
    }
  }
  next();
};