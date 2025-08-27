import { Router } from "express";

const router: ReturnType<typeof Router> = Router();

// 获取群组列表
router.get("/", (_req, res) => {
  res.json({ message: "获取群组列表" });
});

// 创建群组
router.post("/", (_req, res) => {
  res.json({ message: "创建群组" });
});

// 获取群组详情
router.get("/:id", (req, res) => {
  res.json({ message: "获取群组详情", groupId: req.params.id });
});

// 更新群组信息
router.put("/:id", (req, res) => {
  res.json({ message: "更新群组信息", groupId: req.params.id });
});

// 删除群组
router.delete("/:id", (req, res) => {
  res.json({ message: "删除群组", groupId: req.params.id });
});

// 添加群组成员
router.post("/:id/participants", (req, res) => {
  res.json({ message: "添加群组成员", groupId: req.params.id });
});

// 移除群组成员
router.delete("/:id/participants/:userId", (req, res) => {
  res.json({
    message: "移除群组成员",
    groupId: req.params.id,
    userId: req.params.userId,
  });
});

// 更改成员角色
router.put("/:id/participants/:userId/role", (req, res) => {
  res.json({
    message: "更改成员角色",
    groupId: req.params.id,
    userId: req.params.userId,
  });
});

export default router;
