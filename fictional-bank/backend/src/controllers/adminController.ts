import { Response, NextFunction, Request } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import { ApiError } from "../middleware/errorHandler";
import { AuthedRequest } from "../middleware/auth";

async function writeAuditLog(adminId: string, action: string, targetUserId: string | null, description: string, ip?: string) {
  await prisma.auditLog.create({
    data: { adminId, action, targetUserId: targetUserId || undefined, description, ipAddress: ip },
  });
}

export async function adminLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new ApiError(400, "username and password are required");

    const admin = await prisma.administrator.findUnique({ where: { username } });
    if (!admin) throw new ApiError(401, "Invalid credentials");

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) throw new ApiError(401, "Invalid credentials");

    // NOTE: two-factor verification step would go here if
    // admin.twoFactorEnabled is true — verify a TOTP code before issuing
    // tokens. Stubbed in this demo.

    const payload = { sub: admin.id, role: "admin" as const, adminRole: admin.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.administrator.update({ where: { id: admin.id }, data: { lastLogin: new Date() } });
    await writeAuditLog(admin.id, "LOGIN", null, "Administrator logged in", req.ip);

    res.json({
      accessToken,
      refreshToken,
      admin: { id: admin.id, username: admin.username, role: admin.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function getDashboard(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const [totalUsers, pendingDeposits, pendingWithdrawals, approvedDeposits, approvedWithdrawals] = await Promise.all([
      prisma.user.count(),
      prisma.depositRequest.count({ where: { status: "PENDING" } }),
      prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
      prisma.depositRequest.count({ where: { status: "APPROVED" } }),
      prisma.withdrawalRequest.count({ where: { status: "APPROVED" } }),
    ]);

    res.json({
      totalUsers,
      pendingTransactions: pendingDeposits + pendingWithdrawals,
      approvedTransactions: approvedDeposits + approvedWithdrawals,
      pendingDeposits,
      pendingWithdrawals,
    });
  } catch (err) {
    next(err);
  }
}

export async function getStatistics(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyTx = await prisma.transaction.groupBy({
      by: ["transactionType"],
      _sum: { amount: true },
      _count: true,
      where: { createdAt: { gte: last30 } },
    });
    res.json({ last30Days: dailyTx });
  } catch (err) {
    next(err);
  }
}

export async function searchUsers(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string) || "";
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 50,
      select: { id: true, firstName: true, lastName: true, email: true, status: true, createdAt: true },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { checkingAccount: true, savingsAccount: true },
    });
    if (!user) throw new ApiError(404, "User not found");
    const { passwordHash, ...safe } = user;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, phone, address, status } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { firstName, lastName, phone, address, status },
    });
    await writeAuditLog(req.admin!.sub, "UPDATE_USER", user.id, "Administrator updated customer info", req.ip);
    const { passwordHash, ...safe } = user;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

export async function suspendUser(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { status: "SUSPENDED" } });
    await writeAuditLog(req.admin!.sub, "SUSPEND_USER", user.id, "Administrator suspended account", req.ip);
    res.json({ message: "Account suspended" });
  } catch (err) {
    next(err);
  }
}

export async function reactivateUser(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { status: "ACTIVE" } });
    await writeAuditLog(req.admin!.sub, "REACTIVATE_USER", user.id, "Administrator reactivated account", req.ip);
    res.json({ message: "Account reactivated" });
  } catch (err) {
    next(err);
  }
}

export async function adminResetUserPassword(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { newPassword } = req.body;
    if (!newPassword) throw new ApiError(400, "newPassword is required");
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash } });
    await writeAuditLog(req.admin!.sub, "RESET_USER_PASSWORD", req.params.id, "Administrator reset customer password", req.ip);
    res.json({ message: "Password reset" });
  } catch (err) {
    next(err);
  }
}

async function reviewDepositOrWithdrawal(
  model: "depositRequest" | "withdrawalRequest",
  requestId: string,
  approve: boolean,
  adminId: string,
  ip?: string
) {
  const record = await (prisma as any)[model].findUnique({ where: { id: requestId } });
  if (!record) throw new ApiError(404, "Request not found");
  if (record.status !== "PENDING") throw new ApiError(400, "Request already reviewed");

  const newStatus = approve ? "APPROVED" : "REJECTED";

  await prisma.$transaction(async (tx) => {
    await (tx as any)[model].update({
      where: { id: requestId },
      data: { status: newStatus, reviewedAt: new Date(), reviewedById: adminId },
    });

    if (approve) {
      const isDeposit = model === "depositRequest";
      const accountModel = record.accountType === "CHECKING" ? tx.checkingAccount : tx.savingsAccount;
      const delta = isDeposit ? record.amount : -record.amount;

      await (accountModel as any).update({
        where: { userId: record.userId },
        data: { balance: { increment: delta }, availableBalance: { increment: delta } },
      });

      await tx.transaction.create({
        data: {
          userId: record.userId,
          accountType: record.accountType,
          transactionType: isDeposit ? "DEPOSIT" : "WITHDRAWAL",
          amount: record.amount,
          status: "COMPLETED",
          description: `${isDeposit ? "Deposit" : "Withdrawal"} request approved`,
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: record.userId,
        title: `${model === "depositRequest" ? "Deposit" : "Withdrawal"} request ${newStatus.toLowerCase()}`,
        message: `Your request for $${record.amount} was ${newStatus.toLowerCase()}.`,
      },
    });
  });

  await writeAuditLog(adminId, `${newStatus}_${model === "depositRequest" ? "DEPOSIT" : "WITHDRAWAL"}`, record.userId, `Request ${requestId}`, ip);
}

export async function approveDeposit(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    await reviewDepositOrWithdrawal("depositRequest", req.body.requestId, true, req.admin!.sub, req.ip);
    res.json({ message: "Deposit approved" });
  } catch (err) {
    next(err);
  }
}

export async function rejectDeposit(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    await reviewDepositOrWithdrawal("depositRequest", req.body.requestId, false, req.admin!.sub, req.ip);
    res.json({ message: "Deposit rejected" });
  } catch (err) {
    next(err);
  }
}

export async function approveWithdrawal(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    await reviewDepositOrWithdrawal("withdrawalRequest", req.body.requestId, true, req.admin!.sub, req.ip);
    res.json({ message: "Withdrawal approved" });
  } catch (err) {
    next(err);
  }
}

export async function rejectWithdrawal(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    await reviewDepositOrWithdrawal("withdrawalRequest", req.body.requestId, false, req.admin!.sub, req.ip);
    res.json({ message: "Withdrawal rejected" });
  } catch (err) {
    next(err);
  }
}

export async function creditAccount(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { userId, accountType, amount, reason } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) throw new ApiError(400, "amount must be a positive number");
    const accountModel = accountType === "CHECKING" ? prisma.checkingAccount : prisma.savingsAccount;

    await prisma.$transaction(async (tx) => {
      const model = accountType === "CHECKING" ? tx.checkingAccount : tx.savingsAccount;
      await (model as any).update({
        where: { userId },
        data: { balance: { increment: amt }, availableBalance: { increment: amt } },
      });
      await tx.transaction.create({
        data: {
          userId,
          accountType,
          transactionType: "ADMIN_CREDIT",
          amount: amt,
          status: "COMPLETED",
          description: reason || "Manual administrator credit",
        },
      });
    });

    await writeAuditLog(req.admin!.sub, "CREDIT_ACCOUNT", userId, reason || "Manual credit", req.ip);
    res.json({ message: "Account credited" });
  } catch (err) {
    next(err);
  }
}

export async function debitAccount(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { userId, accountType, amount, reason } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) throw new ApiError(400, "amount must be a positive number");

    await prisma.$transaction(async (tx) => {
      const model = accountType === "CHECKING" ? tx.checkingAccount : tx.savingsAccount;
      const account = await (model as any).findUnique({ where: { userId } });
      if (!account) throw new ApiError(404, "Account not found");
      if (Number(account.balance) < amt) throw new ApiError(400, "Insufficient balance for debit");

      await (model as any).update({
        where: { userId },
        data: { balance: { decrement: amt }, availableBalance: { decrement: amt } },
      });
      await tx.transaction.create({
        data: {
          userId,
          accountType,
          transactionType: "ADMIN_DEBIT",
          amount: amt,
          status: "COMPLETED",
          description: reason || "Manual administrator debit",
        },
      });
    });

    await writeAuditLog(req.admin!.sub, "DEBIT_ACCOUNT", userId, reason || "Manual debit", req.ip);
    res.json({ message: "Account debited" });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLog(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 200,
      include: { admin: { select: { username: true } } },
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}
