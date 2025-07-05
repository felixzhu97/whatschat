"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Minimize,
  Settings,
  Monitor,
  MonitorOff,
  RepeatIcon as Record,
  Square,
  Grid3X3,
  PictureInPicture,
  Maximize2,
  MousePointer2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoEffectsPanel } from "./video-effects-panel"
import type { CallState } from "../types"

interface CallInterfaceProps {
  callState: CallState
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  onEndCall: () => void
  onToggleMute: () => void
  onToggleVideo: () => void
  onToggleSpeaker: () => void
  onSwitchCamera: () => void
  onSwitchVideoLayout: (layout: "pip" | "split" | "fullscreen") => void
  onToggleBeautyMode: () => void
  onApplyFilter: (filter: string) => void
  onStartScreenShare: () => Promise<void>
  onStopScreenShare: () => void
  onStartRecording: () => void
  onStopRecording: () => void
  onMinimize: () => void
  onShowControls: () => void
  formatDuration: (seconds: number) => string
}

export function CallInterface({
  callState,
  localStream,
  remoteStream,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onSwitchCamera,
  onSwitchVideoLayout,
  onToggleBeautyMode,
  onApplyFilter,
  onStartScreenShare,
  onStopScreenShare,
  onStartRecording,
  onStopRecording,
  onMinimize,
  onShowControls,
  formatDuration,
}: CallInterfaceProps) {
  const [showControls, setShowControls] = useState(true)
  const [showEffectsPanel, setShowEffectsPanel] = useState(false)
  const [videoLayout, setVideoLayout] = useState<"pip" | "split" | "fullscreen">("pip")
  const [mainVideoSource, setMainVideoSource] = useState<"local" | "remote">("remote")
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenShareError, setScreenShareError] = useState<string | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const mockCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  // 创建虚拟远程视频流（优化版本，避免页面刷新）
  const createMockRemoteStream = useCallback(() => {
    if (mockCanvasRef.current) {
      return mockCanvasRef.current.captureStream(15) // 降低帧率到15fps
    }

    const canvas = document.createElement("canvas")
    canvas.width = 640
    canvas.height = 480
    mockCanvasRef.current = canvas

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    let frame = 0
    const animate = () => {
      // 简单的渐变背景，避免复杂动画
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, `hsl(${(frame * 0.5) % 360}, 70%, 60%)`)
      gradient.addColorStop(1, `hsl(${(frame * 0.5 + 180) % 360}, 70%, 40%)`)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 简单的脉冲效果
      const pulse = Math.sin(frame * 0.05) * 0.1 + 1
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.scale(pulse, pulse)

      // 绘制简单的圆形
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      ctx.beginPath()
      ctx.arc(0, 0, 50, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()

      // 添加文字
      ctx.fillStyle = "white"
      ctx.font = "24px Arial"
      ctx.textAlign = "center"
      ctx.fillText("模拟视频", canvas.width / 2, canvas.height / 2 + 100)

      frame++
      requestAnimationFrame(animate)
    }

    animate()
    return canvas.captureStream(15) // 15fps 降低CPU使用
  }, [])

  // 设置视频流
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current) {
      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream
      } else {
        // 使用优化的虚拟视频流
        const mockStream = createMockRemoteStream()
        if (mockStream) {
          remoteVideoRef.current.srcObject = mockStream
        }
      }
    }
  }, [remoteStream, createMockRemoteStream])

  // 控制栏自动隐藏逻辑
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      onShowControls()

      // 清除之前的定时器
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }

      // 4秒后隐藏控制栏
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 4000)
    }

    const handleMouseLeave = () => {
      // 鼠标离开时也设置定时器隐藏
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 2000)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [onShowControls])

  // 处理屏幕共享（修复权限问题）
  const handleToggleScreenShare = async () => {
    try {
      setScreenShareError(null)

      if (isScreenSharing) {
        onStopScreenShare()
        setIsScreenSharing(false)
      } else {
        // 检查浏览器支持
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          throw new Error("您的浏览器不支持屏幕共享功能")
        }

        // 尝试获取屏幕共享权限
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 },
            },
            audio: true,
          })

          // 监听屏幕共享结束事件
          screenStream.getVideoTracks()[0].addEventListener("ended", () => {
            setIsScreenSharing(false)
            onStopScreenShare()
          })

          await onStartScreenShare()
          setIsScreenSharing(true)
        } catch (permissionError: any) {
          if (permissionError.name === "NotAllowedError") {
            throw new Error("屏幕共享权限被拒绝，请允许访问屏幕共享")
          } else if (permissionError.name === "NotSupportedError") {
            throw new Error("当前环境不支持屏幕共享，请使用HTTPS协议或本地环境")
          } else {
            throw new Error("无法启动屏幕共享，请检查浏览器设置")
          }
        }
      }
    } catch (error: any) {
      console.error("屏幕共享操作失败:", error)
      setScreenShareError(error.message || "屏幕共享功能暂时不可用")
      setIsScreenSharing(false)
    }
  }

  // 处理视频布局切换
  const handleLayoutChange = (layout: "pip" | "split" | "fullscreen") => {
    setVideoLayout(layout)
    onSwitchVideoLayout(layout)
  }

  // 处理视频窗口点击切换
  const handleVideoClick = (source: "local" | "remote") => {
    setMainVideoSource(source)
  }

  // 渲染主视频
  const renderMainVideo = () => {
    const isRemoteMain = mainVideoSource === "remote"
    const mainStream = isRemoteMain ? remoteStream : localStream
    const mainRef = isRemoteMain ? remoteVideoRef : localVideoRef

    return (
      <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={mainRef}
          autoPlay
          playsInline
          muted={!isRemoteMain} // 本地视频静音，远程视频不静音
          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => handleVideoClick(isRemoteMain ? "local" : "remote")}
        />

        {/* 视频标签 */}
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="secondary" className="bg-black/50 text-white">
            {isRemoteMain ? callState.contactName || "对方" : "我"}
          </Badge>
        </div>

        {/* 点击提示 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 cursor-pointer">
          <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <MousePointer2 className="h-4 w-4" />
            点击切换
          </div>
        </div>
      </div>
    )
  }

  // 渲染副视频
  const renderSecondaryVideo = () => {
    const isRemoteSecondary = mainVideoSource === "local"
    const secondaryStream = isRemoteSecondary ? remoteStream : localStream
    const secondaryRef = isRemoteSecondary ? remoteVideoRef : localVideoRef

    return (
      <div className="relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-white/50 transition-all">
        <video
          ref={secondaryRef}
          autoPlay
          playsInline
          muted={!isRemoteSecondary}
          className="w-full h-full object-cover"
          onClick={() => handleVideoClick(isRemoteSecondary ? "remote" : "local")}
        />

        {/* 视频标签 */}
        <div className="absolute top-2 left-2 z-20">
          <Badge variant="secondary" className="bg-black/50 text-white text-xs">
            {isRemoteSecondary ? callState.contactName || "对方" : "我"}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* 状态栏 */}
      <div className="absolute top-0 left-0 right-0 z-[60] p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">
                {callState.status === "connecting" && "连接中..."}
                {callState.status === "connected" && `通话中 ${formatDuration(callState.duration || 0)}`}
                {callState.status === "ringing" && "呼叫中..."}
              </span>
            </div>

            {/* 连接质量指示器 */}
            <div className="flex items-center gap-1">
              <div className="w-1 h-3 bg-green-500 rounded-sm"></div>
              <div className="w-1 h-4 bg-green-500 rounded-sm"></div>
              <div className="w-1 h-2 bg-gray-500 rounded-sm"></div>
              <span className="text-xs ml-1">良好</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 录制状态 */}
            {callState.isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                <Record className="h-3 w-3 mr-1" />
                录制中
              </Badge>
            )}

            {/* 屏幕共享状态 */}
            {isScreenSharing && (
              <Badge variant="secondary" className="bg-blue-600">
                <Monitor className="h-3 w-3 mr-1" />
                屏幕共享
              </Badge>
            )}

            {/* 最小化按钮 */}
            <Button variant="ghost" size="icon" onClick={onMinimize} className="text-white hover:bg-white/20">
              <Minimize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 视频区域 */}
      <div className="flex-1 relative" style={{ paddingBottom: "80px" }}>
        {videoLayout === "pip" && (
          <div className="relative w-full h-full">
            {/* 主视频 */}
            {renderMainVideo()}

            {/* 画中画窗口 */}
            <div className="absolute top-4 right-4 w-48 h-36 z-10">{renderSecondaryVideo()}</div>
          </div>
        )}

        {videoLayout === "split" && (
          <div className="flex w-full h-full gap-2 p-2">
            <div className="flex-1">{renderMainVideo()}</div>
            <div className="flex-1">{renderSecondaryVideo()}</div>
          </div>
        )}

        {videoLayout === "fullscreen" && <div className="w-full h-full">{renderMainVideo()}</div>}
      </div>

      {/* 屏幕共享错误提示 */}
      {screenShareError && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[60] bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <MonitorOff className="h-4 w-4" />
            <span className="text-sm">{screenShareError}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={() => setScreenShareError(null)}
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* 控制栏 */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[55] transition-all duration-300 ${
          showControls ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)" }}
      >
        <div className="p-6">
          {/* 主要控制按钮 */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* 静音按钮 */}
            <Button
              variant={callState.isMuted ? "destructive" : "secondary"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={onToggleMute}
            >
              {callState.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {/* 视频按钮 */}
            <Button
              variant={callState.isVideoOff ? "destructive" : "secondary"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={onToggleVideo}
            >
              {callState.isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>

            {/* 扬声器按钮 */}
            <Button
              variant={callState.isSpeakerOn ? "default" : "secondary"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={onToggleSpeaker}
            >
              {callState.isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>

            {/* 屏幕共享按钮 */}
            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={handleToggleScreenShare}
            >
              {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            </Button>

            {/* 录制按钮 */}
            <Button
              variant={callState.isRecording ? "destructive" : "secondary"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={callState.isRecording ? onStopRecording : onStartRecording}
            >
              {callState.isRecording ? <Square className="h-4 w-4" /> : <Record className="h-5 w-5" />}
            </Button>

            {/* 结束通话按钮 */}
            <Button
              variant="destructive"
              size="icon"
              className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700"
              onClick={onEndCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>

          {/* 次要控制按钮 */}
          <div className="flex items-center justify-center gap-3">
            {/* 切换摄像头 */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onSwitchCamera}>
              <RotateCcw className="h-4 w-4" />
            </Button>

            {/* 视频布局 */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              <Button
                variant={videoLayout === "pip" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 text-white"
                onClick={() => handleLayoutChange("pip")}
              >
                <PictureInPicture className="h-4 w-4" />
              </Button>
              <Button
                variant={videoLayout === "split" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 text-white"
                onClick={() => handleLayoutChange("split")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={videoLayout === "fullscreen" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 text-white"
                onClick={() => handleLayoutChange("fullscreen")}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* 特效按钮 */}
            <Button
              variant={showEffectsPanel ? "default" : "ghost"}
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setShowEffectsPanel(!showEffectsPanel)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 视频特效面板 */}
      {showEffectsPanel && (
        <VideoEffectsPanel
          isOpen={showEffectsPanel}
          onClose={() => setShowEffectsPanel(false)}
          onToggleBeautyMode={onToggleBeautyMode}
          onApplyFilter={onApplyFilter}
          beautyMode={callState.beautyMode || false}
          currentFilter={callState.currentFilter || "none"}
        />
      )}
    </div>
  )
}
