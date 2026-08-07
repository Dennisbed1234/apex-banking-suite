import { Router } from "express";
import * as customerController from "../controllers/customerController";
import { requireCustomerAuth } from "../middleware/auth";
import { sensitiveActionLimiter } from "../middleware/rateLimiters";

const router = Router();

router.use(requireCustomerAuth);

router.get("/profile", customerController.getProfile);
router.put("/profile", customerController.updateProfile);
router.get("/accounts", customerController.getAccounts);
router.get("/transactions", customerController.getTransactions);
router.get("/statements", customerController.getStatements);
router.post("/deposit-request", sensitiveActionLimiter, customerController.createDepositRequest);
router.post("/withdrawal-request", sensitiveActionLimiter, customerController.createWithdrawalRequest);
router.post("/internal-transfer", sensitiveActionLimiter, customerController.internalTransfer);

export default router;
