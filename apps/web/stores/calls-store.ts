import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { StorageManager } from "../lib/storage"

export interface Call {
  id: string
  contactId: string
  contactName: string
  contactAvatar: string
  type: "voice" | "video"
  status: "incoming" | "outgoing" | "missed" | "answered" | "ended"
  startTime: string
  endTime?: string
  duration?: number
  isGroup?: boolean
  participants?: string[]
}

interface CallsState {
  // State
  calls: Call[]
  activeCall: Call | null
  incomingCall: Call | null
  callHistory: Call[]
  isCallActive: boolean
  isMuted: boolean
  isVideoEnabled: boolean
  isSpeakerEnabled: boolean

  // Actions
  startCall: (contactId: string, type: "voice" | "video") => void
  endCall: (callId: string, duration: number) => void
  answerCall: (callId: string) => void
  declineCall: (callId: string) => void
  toggleMute: () => void
  toggleVideo: () => void
  toggleSpeaker: () => void

  // Call Management
  addCall: (call: Call) => void
  updateCall: (callId: string, updates: Partial<Call>) => void
  removeCall: (callId: string) => void
  clearCallHistory: () => void

  // Getters
  getCallById: (callId: string) => Call | null
  getCallsForContact: (contactId: string) => Call[]
  getMissedCalls: () => Call[]
  getRecentCalls: (limit?: number) => Call[]
  getTotalCallDuration: () => number

  // Statistics
  getCallStats: () => {
    total: number
    missed: number
    answered: number
    totalDuration: number
    averageDuration: number
  }
}

export const useCallsStore = create<CallsState>()(
  persist(
    (set, get) => ({
      // State
      calls: [],
      activeCall: null,
      incomingCall: null,
      callHistory: [],
      isCallActive: false,
      isMuted: false,
      isVideoEnabled: false,
      isSpeakerEnabled: false,

      // Actions
      startCall: (contactId, type) => {
        const call: Call = {
          id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          contactId,
          contactName: `联系人${contactId}`,
          contactAvatar: `/placeholder.svg?height=40&width=40&text=${contactId}`,
          type,
          status: "outgoing",
          startTime: new Date().toISOString(),
        }

        set({
          activeCall: call,
          isCallActive: true,
          isVideoEnabled: type === "video",
        })

        get().addCall(call)
      },

      endCall: (callId, duration) => {
        const call = get().getCallById(callId)
        if (call) {
          get().updateCall(callId, {
            status: "ended",
            endTime: new Date().toISOString(),
            duration,
          })
        }

        set({
          activeCall: null,
          isCallActive: false,
          isMuted: false,
          isVideoEnabled: false,
          isSpeakerEnabled: false,
        })
      },

      answerCall: (callId) => {
        const call = get().getCallById(callId)
        if (call) {
          get().updateCall(callId, {
            status: "answered",
            startTime: new Date().toISOString(),
          })

          set({
            activeCall: call,
            incomingCall: null,
            isCallActive: true,
            isVideoEnabled: call.type === "video",
          })
        }
      },

      declineCall: (callId) => {
        const call = get().getCallById(callId)
        if (call) {
          get().updateCall(callId, {
            status: "missed",
            endTime: new Date().toISOString(),
          })
        }

        set({ incomingCall: null })
      },

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      toggleVideo: () => set((state) => ({ isVideoEnabled: !state.isVideoEnabled })),
      toggleSpeaker: () => set((state) => ({ isSpeakerEnabled: !state.isSpeakerEnabled })),

      // Call Management
      addCall: (call) =>
        set((state) => ({
          calls: [...state.calls, call],
          callHistory: [...state.callHistory, call],
        })),

      updateCall: (callId, updates) =>
        set((state) => ({
          calls: state.calls.map((call) => (call.id === callId ? { ...call, ...updates } : call)),
          callHistory: state.callHistory.map((call) => (call.id === callId ? { ...call, ...updates } : call)),
          activeCall: state.activeCall?.id === callId ? { ...state.activeCall, ...updates } : state.activeCall,
        })),

      removeCall: (callId) =>
        set((state) => ({
          calls: state.calls.filter((call) => call.id !== callId),
          callHistory: state.callHistory.filter((call) => call.id !== callId),
        })),

      clearCallHistory: () => set({ callHistory: [] }),

      // Getters
      getCallById: (callId) => {
        const { calls } = get()
        return calls.find((call) => call.id === callId) || null
      },

      getCallsForContact: (contactId) => {
        const { calls } = get()
        return calls.filter((call) => call.contactId === contactId)
      },

      getMissedCalls: () => {
        const { calls } = get()
        return calls.filter((call) => call.status === "missed")
      },

      getRecentCalls: (limit = 50) => {
        const { callHistory } = get()
        return callHistory
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          .slice(0, limit)
      },

      getTotalCallDuration: () => {
        const { calls } = get()
        return calls.reduce((total, call) => total + (call.duration || 0), 0)
      },

      // Statistics
      getCallStats: () => {
        const { calls } = get()
        const total = calls.length
        const missed = calls.filter((call) => call.status === "missed").length
        const answered = calls.filter((call) => call.status === "answered" || call.status === "ended").length
        const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0)
        const averageDuration = answered > 0 ? totalDuration / answered : 0

        return {
          total,
          missed,
          answered,
          totalDuration,
          averageDuration,
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
