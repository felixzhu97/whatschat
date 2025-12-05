"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react"
import { Button } from "@/src/presentation/components/ui/button"
import { Slider } from "@/src/presentation/components/ui/slider"

interface VoiceMessagePlayerProps {
  audioUrl: string
  duration: number
  sent: boolean
}

export function VoiceMessagePlayer({ audioUrl, duration, sent }: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(false)

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

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio || !audioLoaded) return

    const newTime = (value[0] / 100) * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handlePlaybackRateChange = () => {
    const audio = audioRef.current
    if (!audio) return

    const rates = [1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextRate = rates[(currentIndex + 1) % rates.length]

    setPlaybackRate(nextRate)
    audio.playbackRate = nextRate
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = value[0] / 100
    setVolume(newVolume)
    audio.volume = newVolume
  }

  const resetPlayback = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    setCurrentTime(0)
    if (isPlaying) {
      setIsPlaying(false)
      audio.pause()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // 生成简单的波形可视化
  const generateWaveform = () => {
    const bars = 20
    const heights = []
    for (let i = 0; i < bars; i++) {
      // 模拟波形数据
      const height = Math.random() * 100 + 20
      heights.push(height)
    }
    return heights
  }

  const waveformHeights = generateWaveform()

  return (
    <div
      className="flex items-center gap-3 min-w-[250px] p-2"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" onLoadedData={() => setAudioLoaded(true)} />

      {/* 播放/暂停按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-10 w-10 rounded-full flex-shrink-0 ${
          sent ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        }`}
        onClick={togglePlayback}
        disabled={!audioLoaded}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>

      <div className="flex-1 space-y-1">
        {/* 波形可视化 */}
        <div className="relative h-8 flex items-center gap-0.5">
          {waveformHeights.map((height, index) => (
            <div
              key={index}
              className={`w-1 rounded-full transition-all duration-200 ${sent ? "bg-green-200" : "bg-gray-400"}`}
              style={{
                height: `${Math.max(height * 0.3, 8)}px`,
                opacity: (index / waveformHeights.length) * 100 <= progress ? 1 : 0.3,
              }}
            />
          ))}

          {/* 进度条覆盖层 */}
          <div className="absolute inset-0 flex items-center">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={1}
              className="w-full opacity-0 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>

        {/* 时间和控制 */}
        <div className="flex items-center justify-between">
          <div className={`text-xs ${sent ? "text-green-100" : "text-gray-600"}`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {showControls && (
            <div className="flex items-center gap-1">
              {/* 播放速度 */}
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-xs ${
                  sent ? "text-green-100 hover:bg-green-600" : "text-gray-600 hover:bg-gray-200"
                }`}
                onClick={handlePlaybackRateChange}
              >
                {playbackRate}x
              </Button>

              {/* 重置按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 ${sent ? "text-green-100 hover:bg-green-600" : "text-gray-600 hover:bg-gray-200"}`}
                onClick={resetPlayback}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>

              {/* 音量控制 */}
              <div className="flex items-center gap-1">
                <Volume2 className={`h-3 w-3 ${sent ? "text-green-100" : "text-gray-600"}`} />
                <Slider value={[volume * 100]} onValueChange={handleVolumeChange} max={100} step={1} className="w-12" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
