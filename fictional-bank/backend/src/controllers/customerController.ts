import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../middleware/errorHandler";
import { AuthedRequest } from "../middleware/auth";

export async function getProfile(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw new ApiError(404, "User not found");
    const { passwordHash, ...safe } = user;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, phone, address } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data: { firstName, lastName, phone, address },
    });
    const { passwordHash, ...safe } = user;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

export async function getAccounts(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const [checking, savings] = await Promise.all([
      prisma.checkingAccount.findUnique({ where: { userId } }),
      prisma.savingsAccount.findUnique({ where: { userId } }),
    ]);
    res.json({ checking, savings });
  } catch (err) {
    next(err);
  }
}

export async function getTransactions(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

export async function getStatements(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const statements = await prisma.statement.findMany({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    res.json(statements);
    // NOTE: PDF generation/download is stubbed. Wire a library like pdfkit
    // and populate `fileLocation`, then serve via a signed download route.
  } catch (err) {
    next(err);
  }
}

export async function createDepositRequest(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const { accountType, amount } = req.body;
    if (!["CHECKING", "SAVINGS"].includes(accountType)) throw new ApiError(400, "Invalid accountType");
    const amt = Number(amount);
    if (!amt || amt <= 0) throw new ApiError(400, "amount must be a positive number");

    const requestRow = await prisma.depositRequest.create({
      data: { userId, accountType, amount: amt, status: "PENDING" },
    });
    res.status(201).json(requestRow);
  } catch (err) {
    next(err);
  }
}

export async function createWithdrawalRequest(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const { accountType, amount } = req.body;
    if (!["CHECKING", "SAVINGS"].includes(accountType)) throw new ApiError(400, "Invalid accountType");
    const amt = Number(amount);
    if (!amt || amt <= 0) throw new ApiError(400, "amount must be a positive number");

    // Verify sufficient available balance before allowing the request.
    const account =
      accountType === "CHECKING"
        ? await prisma.checkingAccount.findUnique({ where: { userId } })
        : await prisma.savingsAccount.findUnique({ where: { userId } });
    if (!account) throw new ApiError(404, "Account not found");
    if (Number(account.availableBalance) < amt) throw new ApiError(400, "Insufficient available balance");

    const requestRow = await prisma.withdrawalRequest.create({
      data: { userId, accountType, amount: amt, status: "PENDING" },
    });
    res.status(201).json(requestRow);
  } catch (err) {
    next(err);
  }
}

export async function internalTransfer(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const { fromAccountType, toAccountType, amount } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) throw new ApiError(400, "amount must be a positive number");
    if (fromAccountType === toAccountType) throw new ApiError(400, "Cannot transfer to the same account");
    if (!["CHECKING", "SAVINGS"].includes(fromAccountType) || !["CHECKING", "SAVINGS"].includes(toAccountType)) {
      throw new ApiError(400, "Invalid account type(s)");
    }

    const result = await prisma.$transaction(async (tx) => {
      const fromModel = fromAccountType === "CHECKING" ? tx.checkingAccount : tx.savingsAccount;
      const toModel = toAccountType === "CHECKING" ? tx.checkingAccount : tx.savingsAccount;

      const fromAccount = await (fromModel as any).findUnique({ where: { userId } });
      if (!fromAccount) throw new ApiError(404, "Source account not found");
      if (Number(fromAccount.balance) < amt) throw new ApiError(400, "Insufficient balance");

      await (fromModel as any).update({
        where: { userId },
        data: { balance: { decrement: amt }, availableBalance: { decrement: amt } },
      });
      await (toModel as any).update({
        where: { userId },
        data: { balance: { increment: amt }, availableBalance: { increment: amt } },
      });

      await tx.transaction.create({
        data: {
          userId,
          accountType: fromAccountType,
          transactionType: "TRANSFER_OUT",
          amount: amt,
          status: "COMPLETED",
          description: `Transfer to ${toAccountType}`,
        },
      });
      await tx.transaction.create({
        data: {
          userId,
          accountType: toAccountType,
          transactionType: "TRANSFER_IN",
          amount: amt,
          status: "COMPLETED",
          description: `Transfer from ${fromAccountType}`,
        },
      });

      return { fromAccountType, toAccountType, amount: amt };
    });

    res.json({ message: "Transfer complete", ...result });
  } catch (err) {
    next(err);
  }
}
