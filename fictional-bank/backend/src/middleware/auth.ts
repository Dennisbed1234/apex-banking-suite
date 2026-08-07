import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, CustomerTokenPayload, AdminTokenPayload } from "../utils/jwt";

export interface AuthedRequest extends Request {
  user?: CustomerTokenPayload;
  admin?: AdminTokenPayload;
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
}

export function requireCustomerAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "Missing access token" });
  try {
    const payload = verifyAccessToken<CustomerTokenPayload>(token);
    if (payload.role !== "customer") return res.status(403).json({ error: "Forbidden" });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdminAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "Missing access token" });
  try {
    const payload = verifyAccessToken<AdminTokenPayload>(token);
    if (payload.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdminRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.admin || !roles.includes(req.admin.adminRole)) {
      return res.status(403).json({ error: "Insufficient privileges" });
    }
    next();
  };
}
