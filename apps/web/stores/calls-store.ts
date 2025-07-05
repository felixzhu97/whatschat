import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { StorageManager } from "../lib/storage"
import type { CallRecord } from "../types"

// 默认通话记录数据
const defaultCalls: CallRecord[] = [
  {
    id: "call1",
    contactId: "1",
    contactName: "张三",
    contactAvatar: "/placeholder.svg?height=40&width=40&text=张",
    type: "voice",
    direction: "outgoing",
    status: "completed",
    duration: 180,
    timestamp: "2024-01-15T14:30:00Z",
    isGroup: false,
  },
  {
    id: "call2",
    contactId: "2",
    contactName: "李四",
    contactAvatar: "/placeholder.svg?height=40&width=40&text=李",
    type: "video",
    direction: "incoming",
    status: "missed",
    duration: 0,
    timestamp: "2024-01-15T10:15:00Z",
    isGroup: false,
  },
  {
    id: "call3",
    contactId: "group1",
    contactName: "项目讨论组",
    contactAvatar: "/placeholder.svg?height=40&width=40&text=项目",
    type: "video",
    direction: "outgoing",
    status: "completed",
    duration: 1200,
    timestamp: "2024-01-14T16:45:00Z",
    isGroup: true,
  },
]

interface CallsState {
  calls: CallRecord[]
  activeCall: CallRecord | null
  incomingCall: CallRecord | null
  callHistory: CallRecord[]
  missedCalls: CallRecord[]

  // Actions
  setCalls: (calls: CallRecord[]) => void
  addCall: (call: CallRecord) => void
  updateCall: (callId: string, updates: Partial<CallRecord>) => void
  deleteCall: (callId: string) => void
  clearCallHistory: () => void

  // Active Call Management
  startCall: (contactId: string, type: "voice" | "video") => void
  endCall: (callId: string, duration: number) => void
  answerCall: (callId: string) => void
  declineCall: (callId: string) => void

  // Call Status
  setCallStatus: (callId: string, status: CallRecord["status"]) => void
  markCallAsRead: (callId: string) => void

  // Computed
  getCallsForContact: (contactId: string) => CallRecord[]
  getMissedCallsCount: () => number
  getTotalCallDuration: () => number
  getCallById: (callId: string) => CallRecord | undefined

  // Filters
  getCallsByType: (type: "voice" | "video") => CallRecord[]
  getCallsByDirection: (direction: "incoming" | "outgoing") => CallRecord[]
  getCallsByStatus: (status: CallRecord["status"]) => CallRecord[]
  getRecentCalls: (limit?: number) => CallRecord[]

  // Statistics
  getCallStats: () => {
    total: number
    missed: number
    completed: number
    totalDuration: number
    averageDuration: number
  }
}

export const useCallsStore = create<CallsState>()(
  persist(
    (set, get) => ({
      calls: defaultCalls,
      activeCall: null,
      incomingCall: null,
      callHistory: defaultCalls,
      missedCalls: defaultCalls.filter((call) => call.status === "missed"),

      // Actions
      setCalls: (calls) =>
        set({
          calls,
          callHistory: calls,
          missedCalls: calls.filter((call) => call.status === "missed"),
        }),

      addCall: (call) =>
        set((state) => {
          const newCalls = [call, ...state.calls]
          return {
            calls: newCalls,
            callHistory: newCalls,
            missedCalls: call.status === "missed" ? [call, ...state.missedCalls] : state.missedCalls,
          }
        }),

      updateCall: (callId, updates) =>
        set((state) => {
          const updatedCalls = state.calls.map((call) => (call.id === callId ? { ...call, ...updates } : call))

          return {
            calls: updatedCalls,
            callHistory: updatedCalls,
            missedCalls: updatedCalls.filter((call) => call.status === "missed"),
            activeCall: state.activeCall?.id === callId ? { ...state.activeCall, ...updates } : state.activeCall,
          }
        }),

      deleteCall: (callId) =>
        set((state) => {
          const filteredCalls = state.calls.filter((call) => call.id !== callId)
          return {
            calls: filteredCalls,
            callHistory: filteredCalls,
            missedCalls: filteredCalls.filter((call) => call.status === "missed"),
            activeCall: state.activeCall?.id === callId ? null : state.activeCall,
          }
        }),

      clearCallHistory: () =>
        set({
          calls: [],
          callHistory: [],
          missedCalls: [],
        }),

      // Active Call Management
      startCall: (contactId, type) => {
        const newCall: CallRecord = {
          id: `call_${Date.now()}`,
          contactId,
          contactName: "", // Will be filled by the component
          contactAvatar: "",
          type,
          direction: "outgoing",
          status: "connecting",
          duration: 0,
          timestamp: new Date().toISOString(),
          isGroup: contactId.startsWith("group"),
        }

        set({ activeCall: newCall })
        get().addCall(newCall)
      },

      endCall: (callId, duration) => {
        get().updateCall(callId, {
          status: "completed",
          duration,
          endTime: new Date().toISOString(),
        })

        set({ activeCall: null })
      },

      answerCall: (callId) => {
        get().updateCall(callId, { status: "active" })
        const call = get().getCallById(callId)
        if (call) {
          set({ activeCall: call, incomingCall: null })
        }
      },

      declineCall: (callId) => {
        get().updateCall(callId, { status: "declined" })
        set({ incomingCall: null })
      },

      // Call Status
      setCallStatus: (callId, status) => get().updateCall(callId, { status }),

      markCallAsRead: (callId) => get().updateCall(callId, { isRead: true }),

      // Computed
      getCallsForContact: (contactId) => {
        const { calls } = get()
        return calls.filter((call) => call.contactId === contactId)
      },

      getMissedCallsCount: () => {
        const { missedCalls } = get()
        return missedCalls.filter((call) => !call.isRead).length
      },

      getTotalCallDuration: () => {
        const { calls } = get()
        return calls.reduce((total, call) => total + (call.duration || 0), 0)
      },

      getCallById: (callId) => {
        const { calls } = get()
        return calls.find((call) => call.id === callId)
      },

      // Filters
      getCallsByType: (type) => {
        const { calls } = get()
        return calls.filter((call) => call.type === type)
      },

      getCallsByDirection: (direction) => {
        const { calls } = get()
        return calls.filter((call) => call.direction === direction)
      },

      getCallsByStatus: (status) => {
        const { calls } = get()
        return calls.filter((call) => call.status === status)
      },

      getRecentCalls: (limit = 20) => {
        const { calls } = get()
        return calls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit)
      },

      // Statistics
      getCallStats: () => {
        const { calls } = get()
        const completed = calls.filter((call) => call.status === "completed")
        const totalDuration = completed.reduce((sum, call) => sum + (call.duration || 0), 0)

        return {
          total: calls.length,
          missed: calls.filter((call) => call.status === "missed").length,
          completed: completed.length,
          totalDuration,
          averageDuration: completed.length > 0 ? totalDuration / completed.length : 0,
        }
      },
    }),
    {
      name: "calls-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => StorageManager.load(name, null),
        setItem: (name, value) => StorageManager.save(name, value),
        removeItem: (name) => StorageManager.remove(name),
      })),
    },
  ),
)
