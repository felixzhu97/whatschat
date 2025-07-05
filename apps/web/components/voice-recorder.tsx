"use client"

import { useState, useEffect } from "react"
import { Mic, Send, X, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVoiceRecorder } from "../hooks/use-voice-recorder"

interface VoiceRecorderProps {
  onSendVoice: (recording: any) => void
  onCancel: () => void
}

export function VoiceRecorder({ onSendVoice, onCancel }: VoiceRecorderProps) {
  const [showRecorder, setShowRecorder] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>([])

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

  // 模拟音频波形数据
  useEffect(() => {
    if (isRecording && !isPaused) {
      const interval = setInterval(() => {
        setWaveformData((prev) => {
          const newData = [...prev, Math.random() * 100 + 20]
          return newData.slice(-30) // 保持最近30个数据点
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isRecording, isPaused])

  const handleStartRecording = async () => {
    if (!hasPermission) {
      const granted = await requestPermission()
      if (!granted) {
        alert("需要麦克风权限才能录制语音消息")
        return
      }
    }

    const success = await startRecording()
    if (success) {
      setShowRecorder(true)
      setWaveformData([])
    } else {
      alert("录音启动失败，请检查麦克风权限")
    }
  }

  const handlePauseResume = () => {
    setIsPaused(!isPaused)
    // 这里可以添加实际的暂停/恢复录音逻辑
  }

  const handleStopAndSend = async () => {
    if (recordingTime < 1) {
      alert("录音时间太短，请重新录制")
      handleCancel()
      return
    }

    const recording = await stopRecording()
    if (recording) {
      onSendVoice(recording)
      setShowRecorder(false)
      setWaveformData([])
    }
  }

  const handleCancel = () => {
    cancelRecording()
    setShowRecorder(false)
    setWaveformData([])
    setIsPaused(false)
    onCancel()
  }

  if (showRecorder) {
    return (
      <div className="bg-white border rounded-lg p-4 shadow-lg">
        {/* 录音状态指示 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`} />
            <span className={`font-medium ${isPaused ? "text-yellow-600" : "text-red-600"}`}>
              {isPaused ? "录音已暂停" : "正在录音"}
            </span>
          </div>
          <div className="text-lg font-mono text-gray-700">{formatTime(recordingTime)}</div>
        </div>

        {/* 波形可视化 */}
        <div className="h-16 bg-gray-50 rounded-lg p-2 mb-4 flex items-center justify-center gap-1">
          {waveformData.length > 0 ? (
            waveformData.map((height, index) => (
              <div
                key={index}
                className="w-1 bg-green-500 rounded-full transition-all duration-200"
                style={{ height: `${Math.max(height * 0.4, 4)}px` }}
              />
            ))
          ) : (
            <div className="text-gray-400 text-sm">开始说话...</div>
          )}
        </div>

        {/* 录音提示 */}
        <div className="text-center text-sm text-gray-600 mb-4">
          {recordingTime < 1 ? "至少录制1秒才能发送" : "松开发送，或点击发送按钮"}
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-3">
          {/* 取消按钮 */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
            className="h-12 w-12 rounded-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* 暂停/继续按钮 */}
          <Button
            variant="outline"
            size="icon"
            onClick={handlePauseResume}
            className="h-12 w-12 rounded-full border-yellow-200 text-yellow-600 hover:bg-yellow-50 bg-transparent"
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>

          {/* 发送按钮 */}
          <Button
            size="icon"
            onClick={handleStopAndSend}
            disabled={recordingTime < 1}
            className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {/* 快捷键提示 */}
        <div className="text-xs text-gray-500 text-center mt-3">按 ESC 取消 • 按 Enter 发送</div>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onMouseDown={handleStartRecording}
      className="relative group"
      title="按住录制语音消息"
    >
      <Mic className="h-5 w-5" />
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        按住录音
      </div>
    </Button>
  )
}
