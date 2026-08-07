import { Router } from "express";
import * as authController from "../controllers/authController";
import { requireCustomerAuth } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiters";

const router = Router();

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/logout", requireCustomerAuth, authController.logout);
router.post("/verify-email", authController.verifyEmail);
router.post("/reset-password", authLimiter, authController.requestPasswordReset);
router.post("/reset-password/confirm", authLimiter, authController.resetPassword);
router.post("/change-password", requireCustomerAuth, authController.changePassword);

export default router;
