import { Router } from "express";

const router = Router();

// 获取状态列表
router.get("/", (req, res) => {
  res.json({ message: "获取状态列表" });
});

// 发布状态
router.post("/", (req, res) => {
  res.json({ message: "发布状态" });
});

// 获取状态详情
router.get("/:id", (req, res) => {
  res.json({ message: "获取状态详情", statusId: req.params.id });
});

// 删除状态
router.delete("/:id", (req, res) => {
  res.json({ message: "删除状态", statusId: req.params.id });
});

// 标记状态为已查看
router.post("/:id/view", (req, res) => {
  res.json({ message: "标记状态为已查看", statusId: req.params.id });
});

export default router;
