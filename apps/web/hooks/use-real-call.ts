"use client"

import { useState, useEffect, useCallback } from "react"
import { getWebRTCManager } from "../lib/webrtc"
import type { RTCCallState } from "../lib/webrtc"

export function useRealCall() {
  const [callState, setCallState] = useState<RTCCallState>({
    isActive: false,
    isIncoming: false,
    contactId: "",
    contactName: "",
    contactAvatar: "",
    callType: "voice",
    status: "ended",
    duration: 0,
    isMuted: false,
    isVideoOff: false,
    isSpeakerOn: false,
  })

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const rtcManager = getWebRTCManager()

  useEffect(() => {
    const handleCallStateChanged = (newState: RTCCallState) => {
      setCallState(newState)
    }

    const handleLocalStream = (stream: MediaStream) => {
      setLocalStream(stream)
    }

    const handleRemoteStream = (stream: MediaStream) => {
      setRemoteStream(stream)
    }

    const handleIncomingCall = (incomingCallState: RTCCallState) => {
      setCallState(incomingCallState)
    }

    const handleCallEnded = () => {
      setLocalStream(null)
      setRemoteStream(null)
      setError(null)
    }

    rtcManager.on("callStateChanged", handleCallStateChanged)
    rtcManager.on("localStream", handleLocalStream)
    rtcManager.on("remoteStream", handleRemoteStream)
    rtcManager.on("incomingCall", handleIncomingCall)
    rtcManager.on("callEnded", handleCallEnded)

    // 初始化状态
    setCallState(rtcManager.getCallState())
    setLocalStream(rtcManager.getLocalStream())
    setRemoteStream(rtcManager.getRemoteStream())

    return () => {
      rtcManager.off("callStateChanged", handleCallStateChanged)
      rtcManager.off("localStream", handleLocalStream)
      rtcManager.off("remoteStream", handleRemoteStream)
      rtcManager.off("incomingCall", handleIncomingCall)
      rtcManager.off("callEnded", handleCallEnded)
    }
  }, [rtcManager])

  const startCall = useCallback(
    async (contactId: string, contactName: string, contactAvatar: string, callType: "voice" | "video") => {
      try {
        setError(null)
        await rtcManager.startCall(contactId, contactName, contactAvatar, callType)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "发起通话失败"
        setError(errorMessage)
        console.error("发起通话失败:", error)
      }
    },
    [rtcManager],
  )

  const answerCall = useCallback(async () => {
    try {
      setError(null)
      await rtcManager.answerCall()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "接听通话失败"
      setError(errorMessage)
      console.error("接听通话失败:", error)
    }
  }, [rtcManager])

  const endCall = useCallback(() => {
    rtcManager.endCall()
    setError(null)
  }, [rtcManager])

  const toggleMute = useCallback(() => {
    rtcManager.toggleMute()
  }, [rtcManager])

  const toggleVideo = useCallback(() => {
    rtcManager.toggleVideo()
  }, [rtcManager])

  const toggleSpeaker = useCallback(() => {
    rtcManager.toggleSpeaker()
  }, [rtcManager])

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
    localStream,
    remoteStream,
    error,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    formatDuration,
  }
}
