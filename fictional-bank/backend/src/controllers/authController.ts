import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { signAccessToken, signRefreshToken, verifyAccessToken } from "../utils/jwt";
import { generateAccountNumber, getDemoRoutingNumber } from "../utils/accountNumbers";
import { ApiError } from "../middleware/errorHandler";

const SALT_ROUNDS = 12;

// In a real app, use a persisted table w/ expiry for reset & verification
// tokens. For this demo, we sign short-lived JWTs instead so no extra
// migration is required to try the flow end-to-end.

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, email, password, phone, address } = req.body;
    if (!firstName || !lastName || !email || !password) {
      throw new ApiError(400, "firstName, lastName, email, and password are required");
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError(409, "An account with this email already exists");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        passwordHash,
        status: "PENDING_VERIFICATION",
      },
    });

    const routingNumber = getDemoRoutingNumber();
    await prisma.checkingAccount.create({
      data: {
        userId: user.id,
        accountNumber: generateAccountNumber(),
        routingNumber,
        balance: 0,
        availableBalance: 0,
      },
    });
    await prisma.savingsAccount.create({
      data: {
        userId: user.id,
        accountNumber: generateAccountNumber(),
        routingNumber,
        balance: 0,
        availableBalance: 0,
      },
    });

    // Demo-only: pretend to send a verification email by returning a token.
    // Wire this to a real mail provider in production.
    const verifyToken = signAccessToken({ sub: user.id, role: "customer" });

    res.status(201).json({
      message: "Account created. Please verify your email.",
      userId: user.id,
      demoVerifyToken: verifyToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, "email and password are required");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError(401, "Invalid email or password");

    if (user.status === "SUSPENDED") throw new ApiError(403, "This account has been suspended");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, "Invalid email or password");

    const payload = { sub: user.id, role: "customer" as const };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  // JWTs are stateless; a production system would maintain a token blocklist
  // or short-lived refresh tokens tracked in the DB. Client should discard
  // tokens on logout.
  res.json({ message: "Logged out" });
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.body;
    if (!token) throw new ApiError(400, "token is required");
    const payload = verifyAccessToken<{ sub: string }>(token);
    await prisma.user.update({
      where: { id: payload.sub },
      data: { emailVerified: true, status: "ACTIVE" },
    });
    res.json({ message: "Email verified" });
  } catch (err) {
    next(new ApiError(400, "Invalid or expired verification token"));
  }
}

export async function requestPasswordReset(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "email is required");
    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond success to avoid leaking which emails are registered.
    if (!user) return res.json({ message: "If that email exists, a reset link has been sent." });

    const resetToken = signAccessToken({ sub: user.id, role: "customer" });
    // Demo-only: return token directly instead of emailing it.
    res.json({ message: "If that email exists, a reset link has been sent.", demoResetToken: resetToken });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) throw new ApiError(400, "token and newPassword are required");
    const payload = verifyAccessToken<{ sub: string }>(token);
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({ where: { id: payload.sub }, data: { passwordHash } });
    res.json({ message: "Password has been reset" });
  } catch (err) {
    next(new ApiError(400, "Invalid or expired reset token"));
  }
}

export async function changePassword(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.user.sub;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "currentPassword and newPassword are required");
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, "User not found");

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new ApiError(401, "Current password is incorrect");

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
}
