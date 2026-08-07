import jwt from "jsonwebtoken";

export type CustomerTokenPayload = {
  sub: string; // user id
  role: "customer";
};

export type AdminTokenPayload = {
  sub: string; // admin id
  role: "admin";
  adminRole: string;
};

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export function signAccessToken(payload: CustomerTokenPayload | AdminTokenPayload) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
}

export function signRefreshToken(payload: CustomerTokenPayload | AdminTokenPayload) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
}

export function verifyAccessToken<T>(token: string): T {
  return jwt.verify(token, ACCESS_SECRET) as T;
}

export function verifyRefreshToken<T>(token: string): T {
  return jwt.verify(token, REFRESH_SECRET) as T;
}
