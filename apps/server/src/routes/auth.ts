import { Router } from "express";
import { body } from "express-validator";
import { validationResult } from "express-validator";

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
import { asyncHandler } from "@/middleware/error";

const router = Router();

// 验证规则
const registerValidation = [
  body("username")
    .isLength({ min: 3, max: 20 })
    .withMessage("用户名长度必须在3-20个字符之间")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("用户名只能包含字母、数字和下划线"),
  body("email").isEmail().withMessage("请输入有效的邮箱地址").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("密码长度至少6个字符")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("密码必须包含大小写字母和数字"),
  body("phone")
    .optional()
    .isMobilePhone("zh-CN")
    .withMessage("请输入有效的手机号码"),
];

const loginValidation = [
  body("email").isEmail().withMessage("请输入有效的邮箱地址").normalizeEmail(),
  body("password").notEmpty().withMessage("密码不能为空"),
];

const refreshTokenValidation = [
  body("refreshToken").notEmpty().withMessage("刷新令牌不能为空"),
];

const updateProfileValidation = [
  body("username")
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage("用户名长度必须在3-20个字符之间")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("用户名只能包含字母、数字和下划线"),
  body("status")
    .optional()
    .isLength({ max: 100 })
    .withMessage("状态信息不能超过100个字符"),
];

const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("当前密码不能为空"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("新密码长度至少6个字符")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("新密码必须包含大小写字母和数字"),
];

const forgotPasswordValidation = [
  body("email").isEmail().withMessage("请输入有效的邮箱地址").normalizeEmail(),
];

const resetPasswordValidation = [
  body("token").notEmpty().withMessage("重置令牌不能为空"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("新密码长度至少6个字符")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("新密码必须包含大小写字母和数字"),
];

// 验证中间件
const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "输入验证失败",
      errors: errors.array(),
      timestamp: new Date(),
    });
  }
  next();
};

// 路由
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/refresh-token", refreshTokenValidation, validate, refreshToken);
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getCurrentUser);
router.put(
  "/profile",
  authenticateToken,
  updateProfileValidation,
  validate,
  updateProfile
);
router.put(
  "/change-password",
  authenticateToken,
  changePasswordValidation,
  validate,
  changePassword
);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validate,
  forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  validate,
  resetPassword
);

export default router;
