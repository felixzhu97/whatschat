"use client"

import { useState } from "react"
import { X, Sparkles, Palette, RotateCcw, Sun, Moon, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

interface VideoEffectsPanelProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilter: (filter: string) => void
  currentFilter: string
  beautyMode: boolean
  onToggleBeauty: () => void
}

export function VideoEffectsPanel({
  isOpen,
  onClose,
  onApplyFilter,
  currentFilter,
  beautyMode,
  onToggleBeauty,
}: VideoEffectsPanelProps) {
  const [beautyIntensity, setBeautyIntensity] = useState(50)
  const [brightness, setBrightness] = useState(50)
  const [contrast, setContrast] = useState(50)
  const [saturation, setSaturation] = useState(50)

  const filters = [
    { id: "none", name: "无滤镜", preview: "bg-gray-500" },
    { id: "warm", name: "暖色调", preview: "bg-orange-400" },
    { id: "cool", name: "冷色调", preview: "bg-blue-400" },
    { id: "vintage", name: "复古", preview: "bg-amber-600" },
    { id: "bw", name: "黑白", preview: "bg-gray-700" },
    { id: "sepia", name: "棕褐色", preview: "bg-yellow-700" },
    { id: "vivid", name: "鲜艳", preview: "bg-pink-500" },
  ]

  const presets = [
    { id: "sunny", name: "阳光明媚", icon: Sun, settings: { brightness: 70, contrast: 60, saturation: 80 } },
    { id: "night", name: "夜晚模式", icon: Moon, settings: { brightness: 30, contrast: 70, saturation: 40 } },
    { id: "vivid", name: "鲜艳模式", icon: Zap, settings: { brightness: 60, contrast: 80, saturation: 90 } },
  ]

  const applyPreset = (preset: any) => {
    setBrightness(preset.settings.brightness)
    setContrast(preset.settings.contrast)
    setSaturation(preset.settings.saturation)
  }

  const resetSettings = () => {
    setBeautyIntensity(50)
    setBrightness(50)
    setContrast(50)
    setSaturation(50)
    onApplyFilter("none")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-gray-900 rounded-t-2xl p-6 shadow-2xl border-t border-gray-700">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-semibold text-white">视频特效</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 美颜控制 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-white">美颜效果</label>
            <Button variant={beautyMode ? "default" : "outline"} size="sm" onClick={onToggleBeauty} className="text-xs">
              {beautyMode ? "已开启" : "已关闭"}
            </Button>
          </div>
          {beautyMode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>强度</span>
                <span>{beautyIntensity}%</span>
              </div>
              <Slider
                value={[beautyIntensity]}
                onValueChange={(value) => setBeautyIntensity(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* 滤镜选择 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-purple-400" />
            <label className="text-sm font-medium text-white">滤镜效果</label>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onApplyFilter(filter.id)}
                className={`relative p-3 rounded-lg border-2 transition-all ${
                  currentFilter === filter.id
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-gray-600 hover:border-gray-500"
                }`}
              >
                <div className={`w-full h-8 rounded ${filter.preview} mb-2`}></div>
                <span className="text-xs text-white">{filter.name}</span>
                {currentFilter === filter.id && (
                  <Badge className="absolute -top-1 -right-1 bg-blue-500 text-xs px-1">✓</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 高级调节 */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-white mb-3">高级调节</h4>
          <div className="space-y-4">
            {/* 亮度 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>亮度</span>
                <span>{brightness}%</span>
              </div>
              <Slider
                value={[brightness]}
                onValueChange={(value) => setBrightness(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* 对比度 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>对比度</span>
                <span>{contrast}%</span>
              </div>
              <Slider
                value={[contrast]}
                onValueChange={(value) => setContrast(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* 饱和度 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>饱和度</span>
                <span>{saturation}%</span>
              </div>
              <Slider
                value={[saturation]}
                onValueChange={(value) => setSaturation(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* 快速预设 */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-white mb-3">快速预设</h4>
          <div className="flex gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-2 text-white border-gray-600 hover:border-gray-500"
              >
                <preset.icon className="w-4 h-4" />
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={resetSettings}
            className="flex items-center gap-2 text-gray-400 bg-transparent"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </Button>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            完成
          </Button>
        </div>
      </div>
    </div>
  )
}
