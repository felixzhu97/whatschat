import { Router } from "express";

const router = Router();

// 获取消息列表
router.get("/", (req, res) => {
  res.json({ message: "获取消息列表" });
});

// 发送消息
router.post("/", (req, res) => {
  res.json({ message: "发送消息" });
});

// 获取消息详情
router.get("/:id", (req, res) => {
  res.json({ message: "获取消息详情", messageId: req.params.id });
});

// 编辑消息
router.put("/:id", (req, res) => {
  res.json({ message: "编辑消息", messageId: req.params.id });
});

// 删除消息
router.delete("/:id", (req, res) => {
  res.json({ message: "删除消息", messageId: req.params.id });
});

// 添加反应
router.post("/:id/reactions", (req, res) => {
  res.json({ message: "添加反应", messageId: req.params.id });
});

// 删除反应
router.delete("/:id/reactions", (req, res) => {
  res.json({ message: "删除反应", messageId: req.params.id });
});

export default router;
