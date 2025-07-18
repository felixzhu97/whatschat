import { body } from "express-validator";

export const registerValidation = [
  body("username")
    .isLength({ min: 3, max: 20 })
    .withMessage("用户名长度必须在3-20个字符之间")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("用户名只能包含字母、数字和下划线"),
  
  body("email")
    .isEmail()
    .withMessage("请输入有效的邮箱地址")
    .normalizeEmail(),
  
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

export const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("请输入有效的邮箱地址")
    .normalizeEmail(),
  
  body("password")
    .notEmpty()
    .withMessage("密码不能为空"),
];

export const refreshTokenValidation = [
  body("refreshToken")
    .notEmpty()
    .withMessage("刷新令牌不能为空"),
];

export const updateProfileValidation = [
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

export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("当前密码不能为空"),
  
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("新密码长度至少6个字符")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("新密码必须包含大小写字母和数字"),
];

export const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .withMessage("请输入有效的邮箱地址")
    .normalizeEmail(),
];

export const resetPasswordValidation = [
  body("token")
    .notEmpty()
    .withMessage("重置令牌不能为空"),
  
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("新密码长度至少6个字符")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("新密码必须包含大小写字母和数字"),
];