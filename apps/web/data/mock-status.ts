export interface StatusUpdate {
  id: string
  contactId: string
  contactName: string
  contactAvatar: string
  type: "text" | "image" | "video"
  content: string
  mediaUrl?: string
  timestamp: string
  views: number
  isViewed: boolean
}

export const mockStatus: StatusUpdate[] = [
  {
    id: "status1",
    contactId: "1",
    contactName: "张三",
    contactAvatar: "/placeholder.svg?height=40&width=40&text=张",
    type: "text",
    content: "今天天气真好！",
    timestamp: "2024-01-07 09:00",
    views: 15,
    isViewed: true,
  },
  {
    id: "status2",
    contactId: "2",
    contactName: "李四",
    contactAvatar: "/placeholder.svg?height=40&width=40&text=李",
    type: "image",
    content: "美味的早餐",
    mediaUrl: "/placeholder.svg?height=300&width=300&text=早餐",
    timestamp: "2024-01-07 08:30",
    views: 23,
    isViewed: false,
  },
  {
    id: "status3",
    contactId: "3",
    contactName: "王五",
    contactAvatar: "/placeholder.svg?height=40&width=40&text=王",
    type: "video",
    content: "工作中的一天",
    mediaUrl: "/placeholder-video.mp4",
    timestamp: "2024-01-06 17:00",
    views: 8,
    isViewed: true,
  },
  {
    id: "status4",
    contactId: "4",
    contactName: "赵六",
    contactAvatar: "/placeholder.svg?height=40&width=40&text=赵",
    type: "text",
    content: "周末愉快！",
    timestamp: "2024-01-06 12:00",
    views: 12,
    isViewed: false,
  },
]
