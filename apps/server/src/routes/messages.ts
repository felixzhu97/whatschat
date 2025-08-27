import { Router } from "express";
import { MessageService } from "../services/message";
import { authMiddleware } from "../middleware/auth";

const router: ReturnType<typeof Router> = Router();
const messageService = new MessageService();

// Get messages for a chat
router.get("/:chatId", authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = "1", limit = "20", search } = req.query;

    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      search: search as string,
    };

    const messages = await messageService.getMessages(
      chatId as string,
      options
    );

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取消息失败",
    });
  }
});

// Create a new message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content, type, chatId, metadata } = req.body;
    const senderId = (req as any).user.id;

    // Validation
    if (!content || !type || !chatId) {
      return res.status(400).json({
        success: false,
        message: "验证错误：缺少必填字段",
      });
    }

    const validTypes = ["text", "image", "video", "audio", "file"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "消息类型无效",
      });
    }

    const messageData = {
      content,
      type,
      chatId,
      senderId,
      metadata,
    };

    const message = await messageService.createMessage(messageData);

    return res.status(201).json({
      success: true,
      message: "消息发送成功",
      data: message,
    });
  } catch (error: any) {
    if (error.message === "聊天不存在") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "发送消息失败",
    });
  }
});

// Update a message
router.put("/:messageId", authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const updateData = req.body;

    const message = await messageService.updateMessage(
      messageId as string,
      updateData
    );

    return res.json({
      success: true,
      message: "消息更新成功",
      data: message,
    });
  } catch (error: any) {
    if (error.message === "消息不存在") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "更新消息失败",
    });
  }
});

// Delete a message
router.delete("/:messageId", authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;

    await messageService.deleteMessage(messageId as string);

    return res.json({
      success: true,
      message: "消息删除成功",
    });
  } catch (error: any) {
    if (error.message === "消息不存在") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "删除消息失败",
    });
  }
});

export { router as messageRoutes };
