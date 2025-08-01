import type { Message } from "../types"

export const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "msg1",
      senderId: "1",
      senderName: "张三",
      content: "你好，今天有空吗？",
      timestamp: "2024-01-07 14:30",
      type: "text",
      status: "read",
    },
    {
      id: "msg2",
      senderId: "me",
      senderName: "我",
      content: "有空的，什么事？",
      timestamp: "2024-01-07 14:32",
      type: "text",
      status: "sent",
    },
    {
      id: "msg3",
      senderId: "1",
      senderName: "张三",
      content: "想约你一起吃饭",
      timestamp: "2024-01-07 14:35",
      type: "text",
      status: "read",
    },
    {
      id: "msg4",
      senderId: "me",
      senderName: "我",
      content: "好啊，什么时候？",
      timestamp: "2024-01-07 14:36",
      type: "text",
      status: "sent",
    },
  ],
  group1: [
    {
      id: "msg5",
      senderId: "user2",
      senderName: "李四",
      content: "明天的会议改到下午3点",
      timestamp: "2024-01-07 15:20",
      type: "text",
      status: "read",
    },
    {
      id: "msg6",
      senderId: "me",
      senderName: "我",
      content: "收到，我会准时参加",
      timestamp: "2024-01-07 15:22",
      type: "text",
      status: "sent",
    },
    {
      id: "msg7",
      senderId: "user3",
      senderName: "王五",
      content: "我也确认参加",
      timestamp: "2024-01-07 15:25",
      type: "text",
      status: "read",
    },
    {
      id: "msg8",
      senderId: "user1",
      senderName: "张三",
      content: "会议室已预订好了",
      timestamp: "2024-01-07 15:30",
      type: "text",
      status: "read",
    },
    {
      id: "msg9",
      senderId: "user4",
      senderName: "赵六",
      content: "需要准备什么材料吗？",
      timestamp: "2024-01-07 15:35",
      type: "text",
      status: "read",
    },
  ],
  "2": [
    {
      id: "msg10",
      senderId: "2",
      senderName: "李四",
      content: "好的，明天见！",
      timestamp: "2024-01-07 12:15",
      type: "text",
      status: "read",
    },
    {
      id: "msg11",
      senderId: "me",
      senderName: "我",
      content: "明天见！",
      timestamp: "2024-01-07 12:16",
      type: "text",
      status: "sent",
    },
  ],
  "3": [
    {
      id: "msg12",
      senderId: "3",
      senderName: "王五",
      content: "文件已发送",
      timestamp: "2024-01-06 16:30",
      type: "text",
      status: "read",
    },
    {
      id: "msg13",
      senderId: "3",
      senderName: "王五",
      content: "",
      timestamp: "2024-01-06 16:31",
      type: "file",
      status: "read",
      fileData: {
        fileName: "项目文档.pdf",
        fileSize: "2.5 MB",
        fileUrl: "/placeholder-file.pdf",
      },
    },
    {
      id: "msg14",
      senderId: "me",
      senderName: "我",
      content: "收到了，谢谢！",
      timestamp: "2024-01-06 16:35",
      type: "text",
      status: "sent",
    },
  ],
  "4": [
    {
      id: "msg15",
      senderId: "me",
      senderName: "我",
      content: "这是会议记录",
      timestamp: "2024-01-05 14:20",
      type: "text",
      status: "sent",
    },
    {
      id: "msg16",
      senderId: "4",
      senderName: "赵六",
      content: "收到，谢谢！",
      timestamp: "2024-01-05 14:25",
      type: "text",
      status: "read",
    },
  ],
  "5": [
    {
      id: "msg17",
      senderId: "5",
      senderName: "钱七",
      content: "语音通话",
      timestamp: "2024-01-04 10:30",
      type: "voice",
      status: "read",
      voiceData: {
        duration: 180,
        fileUrl: "/placeholder-voice.mp3",
      },
    },
    {
      id: "msg18",
      senderId: "me",
      senderName: "我",
      content: "好的，我知道了",
      timestamp: "2024-01-04 10:35",
      type: "text",
      status: "sent",
    },
  ],
}
