export interface CallRecord {
  id: string
  contactId: string
  contactName: string
  contactAvatar: string
  type: "voice" | "video"
  direction: "incoming" | "outgoing" | "missed"
  duration: number
  timestamp: string
  isGroup?: boolean
}

export const mockCalls: CallRecord[] = [
  {
    id: "call1",
    contactId: "1",
    contactName: "张三",
    contactAvatar: "/placeholder.svg?height=40&width=40&text=张",
    type: "voice",
    direction: "outgoing",
    duration: 120,
    timestamp: "2024-01-07 14:00",
  },
  {
    id: "call2",
    contactId: "2",
    contactName: "李四",
    contactAvatar: "/placeholder.svg?height=40&width=40&text=李",
    type: "video",
    direction: "incoming",
    duration: 300,
    timestamp: "2024-01-07 10:30",
  },
  {
    id: "call3",
    contactId: "3",
    contactName: "王五",
    contactAvatar: "/placeholder.svg?height=40&width=40&text=王",
    type: "voice",
    direction: "missed",
    duration: 0,
    timestamp: "2024-01-06 18:45",
  },
  {
    id: "call4",
    contactId: "group1",
    contactName: "项目讨论组",
    contactAvatar: "/placeholder.svg?height=40&width=40&text=项目",
    type: "video",
    direction: "outgoing",
    duration: 1800,
    timestamp: "2024-01-06 15:00",
    isGroup: true,
  },
  {
    id: "call5",
    contactId: "4",
    contactName: "赵六",
    contactAvatar: "/placeholder.svg?height=40&width=40&text=赵",
    type: "voice",
    direction: "incoming",
    duration: 45,
    timestamp: "2024-01-05 16:20",
  },
]
