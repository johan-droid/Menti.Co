import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthUser, UserRole } from "../types/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) return res.status(401).json({ ok: false, error: "Missing bearer token" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ ok: false, error: "JWT_SECRET is required" });

  try {
    const decoded = jwt.verify(token, secret) as AuthUser;
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ ok: false, error: "Unauthenticated" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: "Insufficient role" });
    }
    return next();
  };
}
