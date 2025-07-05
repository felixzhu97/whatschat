"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Send, X } from "lucide-react"
import { useVoiceRecorder } from "../hooks/use-voice-recorder"

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob, duration: number) => void
  onRecordingChange: (isRecording: boolean) => void
}

export function VoiceRecorder({ onSendVoice, onRecordingChange }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const { startRecording, stopRecording, duration, audioBlob } = useVoiceRecorder()

  const handleStartRecording = async () => {
    try {
      await startRecording()
      setIsRecording(true)
      onRecordingChange(true)
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }

  const handleStopRecording = () => {
    stopRecording()
    setIsRecording(false)
    onRecordingChange(false)
  }

  const handleSendVoice = () => {
    if (audioBlob) {
      onSendVoice(audioBlob, duration)
      setIsRecording(false)
      onRecordingChange(false)
    }
  }

  const handleCancel = () => {
    setIsRecording(false)
    onRecordingChange(false)
  }

  if (isRecording) {
    return (
      <div className="flex items-center space-x-2 bg-red-50 p-2 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-600">录音中... {Math.floor(duration)}s</span>
        </div>
        <div className="flex space-x-1">
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleStopRecording}>
            <Square className="h-4 w-4" />
          </Button>
          {audioBlob && (
            <Button size="sm" onClick={handleSendVoice} className="bg-green-500 hover:bg-green-600">
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleStartRecording} className="text-gray-500 hover:text-gray-700">
      <Mic className="h-5 w-5" />
    </Button>
  )
}
