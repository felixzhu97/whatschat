import { Router } from "express";

const router = Router();

// 获取通话记录
router.get("/", (req, res) => {
  res.json({ message: "获取通话记录" });
});

// 发起通话
router.post("/", (req, res) => {
  res.json({ message: "发起通话" });
});

// 获取通话详情
router.get("/:id", (req, res) => {
  res.json({ message: "获取通话详情", callId: req.params.id });
});

// 接听通话
router.put("/:id/answer", (req, res) => {
  res.json({ message: "接听通话", callId: req.params.id });
});

// 拒绝通话
router.put("/:id/reject", (req, res) => {
  res.json({ message: "拒绝通话", callId: req.params.id });
});

// 结束通话
router.put("/:id/end", (req, res) => {
  res.json({ message: "结束通话", callId: req.params.id });
});

export default router;
