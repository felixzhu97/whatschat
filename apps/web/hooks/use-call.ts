"use client"

import { useState, useRef, useCallback, useEffect } from "react"

export type CallType = "voice" | "video"
export type CallStatus = "idle" | "calling" | "ringing" | "connected" | "ended"

export interface CallState {
  isActive: boolean
  callType: CallType
  status: CallStatus
  contactName: string
  contactAvatar: string
  contactId: string
  duration: number
  isMuted: boolean
  isVideoOff: boolean
  isSpeakerOn: boolean
  // 新增群组通话字段
  isGroupCall: boolean
  participants: CallParticipant[]
  maxParticipants: number
  speakingParticipant: string | null
}

export interface CallParticipant {
  id: string
  name: string
  avatar: string
  isMuted: boolean
  isVideoOff: boolean
  isSpeaking: boolean
  isHost: boolean
  joinedAt: number
  stream?: MediaStream
}

export function useCall() {
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    callType: "voice",
    status: "idle",
    contactName: "",
    contactAvatar: "",
    contactId: "",
    duration: 0,
    isMuted: false,
    isVideoOff: false,
    isSpeakerOn: false,
    isGroupCall: false,
    participants: [],
    maxParticipants: 8,
    speakingParticipant: null,
  })

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)

  // 开始通话计时
  const startDurationTimer = useCallback(() => {
    durationTimerRef.current = setInterval(() => {
      setCallState((prev) => ({
        ...prev,
        duration: prev.duration + 1,
      }))
    }, 1000)
  }, [])

  // 停止通话计时
  const stopDurationTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
      durationTimerRef.current = null
    }
  }, [])

  // 发起通话
  const startCall = useCallback(
    async (contactId: string, contactName: string, contactAvatar: string, callType: CallType) => {
      try {
        // 请求媒体权限
        const constraints = {
          audio: true,
          video: callType === "video",
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        localStreamRef.current = stream

        setCallState({
          isActive: true,
          callType,
          status: "calling",
          contactName,
          contactAvatar,
          contactId,
          duration: 0,
          isMuted: false,
          isVideoOff: callType === "voice",
          isSpeakerOn: false,
          isGroupCall: false,
          participants: [],
          maxParticipants: 8,
          speakingParticipant: null,
        })

        // 模拟对方接听
        setTimeout(
          () => {
            setCallState((prev) => ({
              ...prev,
              status: "connected",
            }))
            startDurationTimer()
          },
          3000 + Math.random() * 2000,
        )

        return true
      } catch (error) {
        console.error("无法获取媒体权限:", error)
        return false
      }
    },
    [startDurationTimer],
  )

  // 开始群组通话
  const startGroupCall = useCallback(
    async (
      groupId: string,
      groupName: string,
      groupAvatar: string,
      callType: CallType,
      participants: CallParticipant[],
    ) => {
      try {
        const constraints = {
          audio: true,
          video: callType === "video",
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        localStreamRef.current = stream

        setCallState({
          isActive: true,
          callType,
          status: "calling",
          contactName: groupName,
          contactAvatar: groupAvatar,
          contactId: groupId,
          duration: 0,
          isMuted: false,
          isVideoOff: callType === "voice",
          isSpeakerOn: false,
          isGroupCall: true,
          participants: participants.map((p) => ({ ...p, isSpeaking: false, joinedAt: Date.now() })),
          maxParticipants: 8,
          speakingParticipant: null,
        })

        // 模拟参与者陆续加入
        setTimeout(() => {
          setCallState((prev) => ({
            ...prev,
            status: "connected",
          }))
          startDurationTimer()

          // 模拟参与者加入
          simulateParticipantsJoining()
        }, 2000)

        return true
      } catch (error) {
        console.error("无法开始群组通话:", error)
        return false
      }
    },
    [startDurationTimer],
  )

  // 模拟参与者加入
  const simulateParticipantsJoining = useCallback(() => {
    const joinDelays = [1000, 2000, 3500, 5000]

    joinDelays.forEach((delay, index) => {
      setTimeout(() => {
        setCallState((prev) => ({
          ...prev,
          participants: prev.participants.map((p, i) => (i === index ? { ...p, joinedAt: Date.now() } : p)),
        }))
      }, delay)
    })
  }, [])

  // 邀请参与者
  const inviteParticipant = useCallback((participant: CallParticipant) => {
    setCallState((prev) => ({
      ...prev,
      participants: [...prev.participants, { ...participant, joinedAt: Date.now() }],
    }))
  }, [])

  // 移除参与者
  const removeParticipant = useCallback((participantId: string) => {
    setCallState((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== participantId),
    }))
  }, [])

  // 切换参与者静音状态
  const toggleParticipantMute = useCallback((participantId: string) => {
    setCallState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) => (p.id === participantId ? { ...p, isMuted: !p.isMuted } : p)),
    }))
  }, [])

  // 模拟说话检测
  const simulateSpeakingDetection = useCallback(() => {
    const interval = setInterval(
      () => {
        setCallState((prev) => {
          if (!prev.isActive || prev.status !== "connected") {
            clearInterval(interval)
            return prev
          }

          // 随机选择一个参与者作为正在说话的人
          const activeParticipants = prev.participants.filter((p) => !p.isMuted)
          const speakingParticipant =
            activeParticipants.length > 0
              ? activeParticipants[Math.floor(Math.random() * activeParticipants.length)]
              : null

          return {
            ...prev,
            speakingParticipant: speakingParticipant?.id || null,
            participants: prev.participants.map((p) => ({
              ...p,
              isSpeaking: p.id === speakingParticipant?.id,
            })),
          }
        })
      },
      2000 + Math.random() * 3000,
    )

    return () => clearInterval(interval)
  }, [])

  // 在通话连接时开始说话检测
  useEffect(() => {
    if (callState.isActive && callState.status === "connected" && callState.isGroupCall) {
      const cleanup = simulateSpeakingDetection()
      return cleanup
    }
  }, [callState.isActive, callState.status, callState.isGroupCall, simulateSpeakingDetection])

  // 接听通话
  const answerCall = useCallback(async () => {
    try {
      const constraints = {
        audio: true,
        video: callState.callType === "video",
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      localStreamRef.current = stream

      setCallState((prev) => ({
        ...prev,
        status: "connected",
      }))

      startDurationTimer()
      return true
    } catch (error) {
      console.error("无法获取媒体权限:", error)
      return false
    }
  }, [callState.callType, startDurationTimer])

  // 结束通话
  const endCall = useCallback(() => {
    // 停止所有媒体流
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop())
      remoteStreamRef.current = null
    }

    stopDurationTimer()

    setCallState((prev) => ({
      ...prev,
      status: "ended",
    }))

    // 延迟重置状态
    setTimeout(() => {
      setCallState({
        isActive: false,
        callType: "voice",
        status: "idle",
        contactName: "",
        contactAvatar: "",
        contactId: "",
        duration: 0,
        isMuted: false,
        isVideoOff: false,
        isSpeakerOn: false,
        isGroupCall: false,
        participants: [],
        maxParticipants: 8,
        speakingParticipant: null,
      })
    }, 2000)
  }, [stopDurationTimer])

  // 切换静音
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = callState.isMuted
        setCallState((prev) => ({
          ...prev,
          isMuted: !prev.isMuted,
        }))
      }
    }
  }, [callState.isMuted])

  // 切换视频
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = callState.isVideoOff
        setCallState((prev) => ({
          ...prev,
          isVideoOff: !prev.isVideoOff,
        }))
      }
    }
  }, [callState.isVideoOff])

  // 切换扬声器
  const toggleSpeaker = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      isSpeakerOn: !prev.isSpeakerOn,
    }))
  }, [])

  // 模拟来电
  const simulateIncomingCall = useCallback(
    (contactId: string, contactName: string, contactAvatar: string, callType: CallType) => {
      setCallState({
        isActive: true,
        callType,
        status: "ringing",
        contactName,
        contactAvatar,
        contactId,
        duration: 0,
        isMuted: false,
        isVideoOff: callType === "voice",
        isSpeakerOn: false,
        isGroupCall: false,
        participants: [],
        maxParticipants: 8,
        speakingParticipant: null,
      })
    },
    [],
  )

  // 格式化通话时长
  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }, [])

  return {
    callState,
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
    startCall,
    startGroupCall, // 新增
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    simulateIncomingCall,
    formatDuration,
    inviteParticipant, // 新增
    removeParticipant, // 新增
    toggleParticipantMute, // 新增
  }
}
