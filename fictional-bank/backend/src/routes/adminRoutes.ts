import { Router } from "express";
import * as adminController from "../controllers/adminController";
import { requireAdminAuth, requireAdminRole } from "../middleware/auth";
import { authLimiter, sensitiveActionLimiter } from "../middleware/rateLimiters";

const router = Router();

// Login is intentionally the only unauthenticated admin route.
router.post("/login", authLimiter, adminController.adminLogin);

router.use(requireAdminAuth);

router.get("/dashboard", adminController.getDashboard);
router.get("/statistics", adminController.getStatistics);
router.get("/users", adminController.searchUsers);
router.get("/user/:id", adminController.getUser);
router.put("/user/:id", adminController.updateUser);
router.post("/user/:id/suspend", requireAdminRole("MANAGER", "SUPER_ADMIN"), adminController.suspendUser);
router.post("/user/:id/reactivate", requireAdminRole("MANAGER", "SUPER_ADMIN"), adminController.reactivateUser);
router.post("/user/:id/reset-password", requireAdminRole("MANAGER", "SUPER_ADMIN"), adminController.adminResetUserPassword);

router.post("/approve-deposit", adminController.approveDeposit);
router.post("/reject-deposit", adminController.rejectDeposit);
router.post("/approve-withdrawal", adminController.approveWithdrawal);
router.post("/reject-withdrawal", adminController.rejectWithdrawal);

router.post("/credit-account", requireAdminRole("MANAGER", "SUPER_ADMIN"), sensitiveActionLimiter, adminController.creditAccount);
router.post("/debit-account", requireAdminRole("MANAGER", "SUPER_ADMIN"), sensitiveActionLimiter, adminController.debitAccount);

router.get("/audit-log", requireAdminRole("SUPER_ADMIN"), adminController.getAuditLog);

export default router;
