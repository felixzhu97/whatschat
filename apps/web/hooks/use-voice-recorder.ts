"use client"

import { useState, useRef, useCallback } from "react"

export interface VoiceRecording {
  blob: Blob
  url: string
  duration: number
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setHasPermission(true)
      stream.getTracks().forEach((track) => track.stop()) // 停止临时流
      return true
    } catch (error) {
      console.error("麦克风权限被拒绝:", error)
      setHasPermission(false)
      return false
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (hasPermission === null) {
      const granted = await requestPermission()
      if (!granted) return false
    }

    if (hasPermission === false) {
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // 开始计时
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      return true
    } catch (error) {
      console.error("开始录音失败:", error)
      return false
    }
  }, [hasPermission, requestPermission])

  const stopRecording = useCallback((): Promise<VoiceRecording | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null)
        return
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        const recording: VoiceRecording = {
          blob,
          url,
          duration: recordingTime,
        }

        // 清理资源
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }

        setIsRecording(false)
        setRecordingTime(0)
        resolve(recording)
      }

      mediaRecorderRef.current.stop()
    })
  }, [isRecording, recordingTime])

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()

      // 清理资源
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      setIsRecording(false)
      setRecordingTime(0)
    }
  }, [isRecording])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [])

  return {
    isRecording,
    recordingTime,
    hasPermission,
    startRecording,
    stopRecording,
    cancelRecording,
    formatTime,
    requestPermission,
  }
}
