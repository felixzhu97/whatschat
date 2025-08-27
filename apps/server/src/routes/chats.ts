import { Router } from "express";

const router: ReturnType<typeof Router> = Router();

// 获取聊天列表
router.get("/", (_req, res) => {
  res.json({ message: "获取聊天列表" });
});

// 创建聊天
router.post("/", (_req, res) => {
  res.json({ message: "创建聊天" });
});

// 获取聊天详情
router.get("/:id", (req, res) => {
  res.json({ message: "获取聊天详情", chatId: req.params.id });
});

// 更新聊天信息
router.put("/:id", (req, res) => {
  res.json({ message: "更新聊天信息", chatId: req.params.id });
});

// 删除聊天
router.delete("/:id", (req, res) => {
  res.json({ message: "删除聊天", chatId: req.params.id });
});

// 归档聊天
router.post("/:id/archive", (req, res) => {
  res.json({ message: "归档聊天", chatId: req.params.id });
});

// 静音聊天
router.post("/:id/mute", (req, res) => {
  res.json({ message: "静音聊天", chatId: req.params.id });
});

export default router;
