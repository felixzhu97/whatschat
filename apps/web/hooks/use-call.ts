"use client"

import { useState, useRef, useCallback } from "react"

export type CallType = "voice" | "video"
export type CallStatus = "idle" | "calling" | "ringing" | "connected" | "ended"
export type VideoLayout = "pip" | "split" | "fullscreen"
export type CameraPosition = "front" | "back"

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
  isGroupCall: boolean
  participants: CallParticipant[]
  maxParticipants: number
  speakingParticipant: string | null
  isMinimized: boolean
  cameraPosition: CameraPosition
  videoLayout: VideoLayout
  isBeautyMode: boolean
  currentFilter: string | null
  isScreenSharing: boolean
  isRecording: boolean
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
    isMinimized: false,
    cameraPosition: "front",
    videoLayout: "pip",
    isBeautyMode: false,
    currentFilter: null,
    isScreenSharing: false,
    isRecording: false,
  })

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)

  // 获取媒体流
  const getMediaStream = useCallback(async (callType: CallType, cameraPosition: CameraPosition = "front") => {
    const constraints = {
      audio: true,
      video:
        callType === "video"
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
              facingMode: cameraPosition === "front" ? "user" : "environment",
            }
          : false,
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      return stream
    } catch (error) {
      console.error("获取媒体流失败:", error)
      throw error
    }
  }, [])

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
        const stream = await getMediaStream(callType, "front")
        setLocalStream(stream)
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
          isMinimized: false,
          cameraPosition: "front",
          videoLayout: "pip",
          isBeautyMode: false,
          currentFilter: null,
          isScreenSharing: false,
          isRecording: false,
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
    [getMediaStream, startDurationTimer],
  )

  // 接听通话
  const answerCall = useCallback(async () => {
    try {
      if (callState.status !== "ringing") {
        throw new Error("没有来电可接听")
      }

      const stream = await getMediaStream(callState.callType, "front")
      setLocalStream(stream)
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
  }, [callState.callType, callState.status, getMediaStream, startDurationTimer])

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

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop())
      screenStreamRef.current = null
    }

    setLocalStream(null)
    setRemoteStream(null)
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
        isMinimized: false,
        cameraPosition: "front",
        videoLayout: "pip",
        isBeautyMode: false,
        currentFilter: null,
        isScreenSharing: false,
        isRecording: false,
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
  const toggleVideo = useCallback(async () => {
    if (callState.callType !== "video") return

    if (callState.isVideoOff) {
      // 重新开启视频
      try {
        const stream = await getMediaStream("video", callState.cameraPosition)

        // 如果已有流，先停止旧的视频轨道
        if (localStreamRef.current) {
          const oldVideoTrack = localStreamRef.current.getVideoTracks()[0]
          if (oldVideoTrack) {
            oldVideoTrack.stop()
            localStreamRef.current.removeTrack(oldVideoTrack)
          }

          // 添加新的视频轨道
          const newVideoTrack = stream.getVideoTracks()[0]
          if (newVideoTrack) {
            localStreamRef.current.addTrack(newVideoTrack)
          }
        } else {
          localStreamRef.current = stream
        }

        setLocalStream(new MediaStream(localStreamRef.current.getTracks()))

        setCallState((prev) => ({
          ...prev,
          isVideoOff: false,
        }))
      } catch (error) {
        console.error("重新开启视频失败:", error)
      }
    } else {
      // 关闭视频
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0]
        if (videoTrack) {
          videoTrack.stop()
          localStreamRef.current.removeTrack(videoTrack)
        }
      }
      setCallState((prev) => ({
        ...prev,
        isVideoOff: true,
      }))
    }
  }, [callState.callType, callState.isVideoOff, callState.cameraPosition, getMediaStream])

  // 切换扬声器
  const toggleSpeaker = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      isSpeakerOn: !prev.isSpeakerOn,
    }))
  }, [])

  // 切换摄像头
  const switchCamera = useCallback(async () => {
    if (callState.callType !== "video" || callState.isVideoOff || callState.isScreenSharing) return

    try {
      const newCameraPosition: CameraPosition = callState.cameraPosition === "front" ? "back" : "front"
      const stream = await getMediaStream("video", newCameraPosition)

      // 停止当前视频流
      if (localStreamRef.current) {
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0]
        if (oldVideoTrack) {
          oldVideoTrack.stop()
          localStreamRef.current.removeTrack(oldVideoTrack)
        }

        // 添加新的视频轨道
        const newVideoTrack = stream.getVideoTracks()[0]
        if (newVideoTrack) {
          localStreamRef.current.addTrack(newVideoTrack)
        }
      } else {
        localStreamRef.current = stream
      }

      setLocalStream(new MediaStream(localStreamRef.current.getTracks()))

      setCallState((prev) => ({
        ...prev,
        cameraPosition: newCameraPosition,
      }))
    } catch (error) {
      console.error("切换摄像头失败:", error)
    }
  }, [callState.callType, callState.isVideoOff, callState.cameraPosition, callState.isScreenSharing, getMediaStream])

  // 切换视频布局
  const switchVideoLayout = useCallback(() => {
    setCallState((prev) => {
      const layouts: VideoLayout[] = ["pip", "split", "fullscreen"]
      const currentIndex = layouts.indexOf(prev.videoLayout)
      const nextIndex = (currentIndex + 1) % layouts.length
      return {
        ...prev,
        videoLayout: layouts[nextIndex],
      }
    })
  }, [])

  // 切换美颜模式
  const toggleBeautyMode = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      isBeautyMode: !prev.isBeautyMode,
    }))
  }, [])

  // 应用滤镜
  const applyFilter = useCallback((filterName: string | null) => {
    setCallState((prev) => ({
      ...prev,
      currentFilter: filterName,
    }))
  }, [])

  // 开始屏幕共享
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      })

      screenStreamRef.current = screenStream

      // 替换本地视频流
      if (localStreamRef.current) {
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0]
        if (oldVideoTrack) {
          oldVideoTrack.stop()
          localStreamRef.current.removeTrack(oldVideoTrack)
        }

        const screenVideoTrack = screenStream.getVideoTracks()[0]
        if (screenVideoTrack) {
          localStreamRef.current.addTrack(screenVideoTrack)
        }
      }

      setLocalStream(new MediaStream(localStreamRef.current?.getTracks() || []))

      setCallState((prev) => ({
        ...prev,
        isScreenSharing: true,
      }))

      // 监听屏幕共享结束
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }

      return screenStream
    } catch (error) {
      console.error("屏幕共享失败:", error)
      return null
    }
  }, [])

  // 停止屏幕共享
  const stopScreenShare = useCallback(async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop())
      screenStreamRef.current = null
    }

    // 恢复摄像头
    try {
      const stream = await getMediaStream("video", callState.cameraPosition)

      if (localStreamRef.current) {
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0]
        if (oldVideoTrack) {
          oldVideoTrack.stop()
          localStreamRef.current.removeTrack(oldVideoTrack)
        }

        const newVideoTrack = stream.getVideoTracks()[0]
        if (newVideoTrack) {
          localStreamRef.current.addTrack(newVideoTrack)
        }
      }

      setLocalStream(new MediaStream(localStreamRef.current?.getTracks() || []))
    } catch (error) {
      console.error("恢复摄像头失败:", error)
    }

    setCallState((prev) => ({
      ...prev,
      isScreenSharing: false,
    }))
  }, [callState.cameraPosition, getMediaStream])

  // 开始录制
  const startRecording = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      isRecording: true,
    }))
  }, [])

  // 停止录制
  const stopRecording = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      isRecording: false,
    }))
  }, [])

  // 最小化通话
  const minimizeCall = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      isMinimized: true,
    }))
  }, [])

  // 最大化通话
  const maximizeCall = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      isMinimized: false,
    }))
  }, [])

  // 显示控制按钮
  const showControls = useCallback(() => {
    // 控制按钮显示逻辑
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
        isMinimized: false,
        cameraPosition: "front",
        videoLayout: "pip",
        isBeautyMode: false,
        currentFilter: null,
        isScreenSharing: false,
        isRecording: false,
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
    localStream,
    remoteStream,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    switchCamera,
    switchVideoLayout,
    toggleBeautyMode,
    applyFilter,
    startScreenShare,
    stopScreenShare,
    startRecording,
    stopRecording,
    minimizeCall,
    maximizeCall,
    showControls,
    simulateIncomingCall,
    formatDuration,
  }
}
