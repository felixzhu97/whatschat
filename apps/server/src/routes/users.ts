import { Router, Request, Response } from "express";
import { query } from "express-validator";
import { validate } from "@/middleware/validation";

const router: ReturnType<typeof Router> = Router();

// 获取用户列表
router.get(
  "/",
  validate([
    query("page").optional().isInt({ min: 1 }).withMessage("页码必须是正整数"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("每页数量必须在1-100之间"),
    query("search")
      .optional()
      .isLength({ min: 1 })
      .withMessage("搜索关键词不能为空"),
  ]),
  (_req: Request, res: Response) => {
    res.json({ message: "获取用户列表" });
  }
);

// 获取用户详情
router.get("/:id", (req, res) => {
  res.json({ message: "获取用户详情", userId: req.params.id });
});

// 更新用户信息
router.put("/:id", (req, res) => {
  res.json({ message: "更新用户信息", userId: req.params.id });
});

// 删除用户
router.delete("/:id", (req, res) => {
  res.json({ message: "删除用户", userId: req.params.id });
});

// 阻止用户
router.post("/:id/block", (req, res) => {
  res.json({ message: "阻止用户", userId: req.params.id });
});

// 取消阻止用户
router.delete("/:id/block", (req, res) => {
  res.json({ message: "取消阻止用户", userId: req.params.id });
});

export default router;
