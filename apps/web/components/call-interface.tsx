"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Minimize2,
  RotateCcw,
  Monitor,
  MonitorOff,
  Circle,
  Square,
  Sparkles,
  Settings,
  X,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { VideoEffectsPanel } from "./video-effects-panel"
import type { CallState } from "../hooks/use-call"

interface CallInterfaceProps {
  callState: CallState
  localStream?: MediaStream | null
  remoteStream?: MediaStream | null
  onEndCall: () => void
  onToggleMute: () => void
  onToggleVideo: () => void
  onToggleSpeaker: () => void
  onSwitchCamera?: () => void
  onSwitchVideoLayout?: () => void
  onToggleBeautyMode?: () => void
  onApplyFilter?: (filter: string) => void
  onStartScreenShare: () => void
  onStopScreenShare: () => void
  onStartRecording?: () => void
  onStopRecording?: () => void
  onMinimize: () => void
  onShowControls?: () => void
  formatDuration: (seconds: number) => string
  screenShareError?: string | null
  isScreenShareSupported?: () => boolean
  onClearScreenShareError?: () => void
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
  screenShareError,
  isScreenShareSupported,
  onClearScreenShareError,
}: CallInterfaceProps) {
  const [showEffectsPanel, setShowEffectsPanel] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [videoLayout, setVideoLayout] = useState<"grid" | "speaker" | "sidebar">("speaker")
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      setShowControls(true)
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    const handleMouseMove = () => resetControlsTimeout()
    const handleMouseClick = () => resetControlsTimeout()

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("click", handleMouseClick)

    resetControlsTimeout()

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("click", handleMouseClick)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  // Set up video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const handleScreenShare = () => {
    if (callState.isScreenSharing) {
      onStopScreenShare()
    } else {
      onStartScreenShare()
    }
  }

  const handleRecording = () => {
    if (callState.isRecording) {
      onStopRecording?.()
    } else {
      onStartRecording?.()
    }
  }

  const handleVideoLayoutChange = () => {
    const layouts: Array<"grid" | "speaker" | "sidebar"> = ["grid", "speaker", "sidebar"]
    const currentIndex = layouts.indexOf(videoLayout)
    const nextLayout = layouts[(currentIndex + 1) % layouts.length]
    setVideoLayout(nextLayout)
    onSwitchVideoLayout?.()
  }

  const isVideoCall = callState.callType === "video"
  const isScreenShareSupportedResult = isScreenShareSupported?.() ?? true

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Screen Share Error Alert */}
      {screenShareError && (
        <Alert className="absolute top-4 left-1/2 transform -translate-x-1/2 z-60 bg-red-50 border-red-200 max-w-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 pr-8">{screenShareError}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0 text-red-600 hover:text-red-800"
            onClick={onClearScreenShareError}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Video Area */}
      <div className="flex-1 relative">
        {isVideoCall ? (
          <div
            className={cn("h-full w-full relative", {
              "grid grid-cols-2 gap-2 p-2": videoLayout === "grid",
              relative: videoLayout === "speaker",
              flex: videoLayout === "sidebar",
            })}
          >
            {/* Remote Video */}
            <div
              className={cn("relative bg-gray-900 rounded-lg overflow-hidden", {
                "": videoLayout === "grid",
                "h-full w-full": videoLayout === "speaker",
                "flex-1": videoLayout === "sidebar",
              })}
            >
              <video ref={remoteVideoRef} autoPlay playsInline muted={false} className="w-full h-full object-cover" />
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img
                        src={callState.contactAvatar || "/placeholder.svg"}
                        alt={callState.contactName}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    </div>
                    <p className="text-lg font-medium">{callState.contactName}</p>
                    <p className="text-sm text-gray-300">
                      {callState.status === "connecting" ? "连接中..." : formatDuration(callState.duration)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Local Video */}
            <div
              className={cn("relative bg-gray-800 rounded-lg overflow-hidden", {
                "": videoLayout === "grid",
                "absolute bottom-4 right-4 w-48 h-36": videoLayout === "speaker",
                "w-48": videoLayout === "sidebar",
              })}
            >
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {callState.isVideoOff && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <VideoOff className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        ) : (
          // Voice Call UI
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <img
                  src={callState.contactAvatar || "/placeholder.svg"}
                  alt={callState.contactName}
                  className="w-28 h-28 rounded-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-medium mb-2">{callState.contactName}</h2>
              <p className="text-lg text-gray-300">
                {callState.status === "connecting" ? "连接中..." : formatDuration(callState.duration)}
              </p>
              {callState.isMuted && <p className="text-sm text-red-400 mt-2">麦克风已静音</p>}
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex items-center justify-center space-x-4">
          {/* Mute Button */}
          <Button
            variant={callState.isMuted ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={onToggleMute}
          >
            {callState.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          {/* Video Button (only for video calls) */}
          {isVideoCall && (
            <Button
              variant={callState.isVideoOff ? "destructive" : "secondary"}
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={onToggleVideo}
            >
              {callState.isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>
          )}

          {/* Speaker Button */}
          <Button
            variant={callState.isSpeakerOn ? "default" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={onToggleSpeaker}
          >
            {callState.isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </Button>

          {/* Screen Share Button */}
          <Button
            variant={callState.isScreenSharing ? "default" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={handleScreenShare}
            disabled={!isScreenShareSupportedResult}
            title={!isScreenShareSupportedResult ? "当前环境不支持屏幕共享" : undefined}
          >
            {callState.isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
          </Button>

          {/* Recording Button */}
          <Button
            variant={callState.isRecording ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={handleRecording}
          >
            {callState.isRecording ? <Square className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
          </Button>

          {/* Effects Button (only for video calls) */}
          {isVideoCall && (
            <Button
              variant="secondary"
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={() => setShowEffectsPanel(!showEffectsPanel)}
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          )}

          {/* Camera Switch Button (only for video calls) */}
          {isVideoCall && (
            <Button variant="secondary" size="lg" className="rounded-full w-14 h-14" onClick={onSwitchCamera}>
              <RotateCcw className="h-6 w-6" />
            </Button>
          )}

          {/* Layout Button (only for video calls) */}
          {isVideoCall && (
            <Button variant="secondary" size="lg" className="rounded-full w-14 h-14" onClick={handleVideoLayoutChange}>
              <Settings className="h-6 w-6" />
            </Button>
          )}

          {/* Minimize Button */}
          <Button variant="secondary" size="lg" className="rounded-full w-14 h-14" onClick={onMinimize}>
            <Minimize2 className="h-6 w-6" />
          </Button>

          {/* End Call Button */}
          <Button variant="destructive" size="lg" className="rounded-full w-16 h-16" onClick={onEndCall}>
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>

        {/* Call Info */}
        <div className="text-center mt-4 text-white">
          <p className="text-sm opacity-75">
            {callState.status === "connecting" ? "连接中..." : formatDuration(callState.duration)}
          </p>
        </div>
      </div>

      {/* Video Effects Panel */}
      {showEffectsPanel && isVideoCall && (
        <VideoEffectsPanel
          isOpen={showEffectsPanel}
          onClose={() => setShowEffectsPanel(false)}
          beautyMode={callState.beautyMode}
          currentFilter={callState.currentFilter}
          onToggleBeautyMode={onToggleBeautyMode}
          onApplyFilter={onApplyFilter}
        />
      )}
    </div>
  )
}
