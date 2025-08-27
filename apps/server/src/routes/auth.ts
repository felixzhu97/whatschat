import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "@/controllers/auth";
import { authenticateToken } from "@/middleware/auth";
import { validate } from "@/middleware/validation";
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  updateProfileValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "@/validators/auth";

const router: ReturnType<typeof Router> = Router();

// 路由
router.post("/register", validate(registerValidation), register);
router.post("/login", validate(loginValidation), login);
router.post("/refresh-token", validate(refreshTokenValidation), refreshToken);
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getCurrentUser);
router.put(
  "/profile",
  authenticateToken,
  validate(updateProfileValidation),
  updateProfile
);
router.put(
  "/change-password",
  authenticateToken,
  validate(changePasswordValidation),
  changePassword
);
router.post(
  "/forgot-password",
  validate(forgotPasswordValidation),
  forgotPassword
);
router.post(
  "/reset-password",
  validate(resetPasswordValidation),
  resetPassword
);

export default router;
