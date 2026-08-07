import jwt, { SignOptions } from "jsonwebtoken";

export type CustomerTokenPayload = {
  sub: string;
  role: "customer";
};

export type AdminTokenPayload = {
  sub: string;
  role: "admin";
  adminRole: string;
};

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

if (!REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not defined");
}

const accessExpiresIn =
  (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"];

const refreshExpiresIn =
  (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

export function signAccessToken(
  payload: CustomerTokenPayload | AdminTokenPayload
): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: accessExpiresIn,
  });
}

export function signRefreshToken(
  payload: CustomerTokenPayload | AdminTokenPayload
): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: refreshExpiresIn,
  });
}

export function verifyAccessToken<T>(token: string): T {
  return jwt.verify(token, ACCESS_SECRET) as T;
}

export function verifyRefreshToken<T>(token: string): T {
  return jwt.verify(token, REFRESH_SECRET) as T;
}