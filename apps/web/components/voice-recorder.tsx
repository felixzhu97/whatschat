"use client"

import { useState } from "react"
import { Mic, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVoiceRecorder } from "../hooks/use-voice-recorder"

interface VoiceRecorderProps {
  onSendVoice: (VoiceRecording) => void
  onCancel: () => void
}

export function VoiceRecorder({ onSendVoice, onCancel }: VoiceRecorderProps) {
  const [showRecorder, setShowRecorder] = useState(false)
  const {
    isRecording,
    recordingTime,
    hasPermission,
    startRecording,
    stopRecording,
    cancelRecording,
    formatTime,
    requestPermission,
  } = useVoiceRecorder()

  const handleStartRecording = async () => {
    const success = await startRecording()
    if (success) {
      setShowRecorder(true)
    } else {
      // 显示权限错误
      alert("需要麦克风权限才能录制语音消息")
    }
  }

  const handleStopAndSend = async () => {
    const recording = await stopRecording()
    if (recording && recording.duration >= 1) {
      onSendVoice(recording)
      setShowRecorder(false)
    } else {
      // 录音时间太短
      alert("录音时间太短，请重新录制")
      handleCancel()
    }
  }

  const handleCancel = () => {
    cancelRecording()
    setShowRecorder(false)
    onCancel()
  }

  if (showRecorder) {
    return (
      <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-600 font-medium">录音中</span>
        </div>

        <div className="flex-1 text-center">
          <div className="text-lg font-mono">{formatTime(recordingTime)}</div>
          <div className="text-sm text-gray-600">按住说话，松开发送</div>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="h-5 w-5 text-red-600" />
          </Button>
          <Button
            size="icon"
            className="bg-green-500 hover:bg-green-600"
            onClick={handleStopAndSend}
            disabled={recordingTime < 1}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button variant="ghost" size="icon" onMouseDown={handleStartRecording} className="relative">
      <Mic className="h-5 w-5" />
    </Button>
  )
}
