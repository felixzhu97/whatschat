"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceMessagePlayerProps {
  audioUrl: string
  duration: number
  sent: boolean
}

export function VoiceMessagePlayer({ audioUrl, duration, sent }: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioLoaded, setAudioLoaded] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedData = () => setAudioLoaded(true)
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener("loadeddata", handleLoadedData)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio || !audioLoaded) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 rounded-full ${
          sent ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-200 hover:bg-gray-300"
        }`}
        onClick={togglePlayback}
        disabled={!audioLoaded}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <div className="flex-1">
        {/* 波形可视化 */}
        <div className="relative h-6 flex items-center">
          <div className="flex-1 h-1 bg-gray-300 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${sent ? "bg-green-200" : "bg-green-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className={`text-xs mt-1 ${sent ? "text-green-100" : "text-gray-600"}`}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  )
}
