"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Sparkles, Palette, Sliders, Camera } from "lucide-react"

interface VideoEffectsPanelProps {
  isOpen: boolean
  onClose: () => void
  isBeautyMode?: boolean
  currentFilter?: string | null
  onToggleBeautyMode?: () => void
  onApplyFilter?: (filter: string | null) => void
}

const filters = [
  { id: null, name: "无滤镜", preview: "🚫" },
  { id: "warm", name: "暖色调", preview: "🌅" },
  { id: "cool", name: "冷色调", preview: "❄️" },
  { id: "vintage", name: "复古", preview: "📷" },
  { id: "black-white", name: "黑白", preview: "⚫" },
  { id: "sepia", name: "棕褐色", preview: "🟤" },
  { id: "vivid", name: "鲜艳", preview: "🌈" },
  { id: "soft", name: "柔和", preview: "☁️" },
]

const backgrounds = [
  { id: null, name: "无背景", preview: "🚫" },
  { id: "blur", name: "模糊背景", preview: "🌫️" },
  { id: "office", name: "办公室", preview: "🏢" },
  { id: "home", name: "居家", preview: "🏠" },
  { id: "nature", name: "自然", preview: "🌲" },
  { id: "space", name: "太空", preview: "🌌" },
  { id: "beach", name: "海滩", preview: "🏖️" },
  { id: "city", name: "城市", preview: "🌆" },
]

export function VideoEffectsPanel({
  isOpen,
  onClose,
  isBeautyMode = false,
  currentFilter = null,
  onToggleBeautyMode,
  onApplyFilter,
}: VideoEffectsPanelProps) {
  const [beautyLevel, setBeautyLevel] = useState([50])
  const [brightness, setBrightness] = useState([50])
  const [contrast, setContrast] = useState([50])
  const [saturation, setSaturation] = useState([50])
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">视频特效</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <Tabs defaultValue="beauty" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="beauty" className="flex flex-col gap-1 py-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs">美颜</span>
              </TabsTrigger>
              <TabsTrigger value="filters" className="flex flex-col gap-1 py-2">
                <Palette className="h-4 w-4" />
                <span className="text-xs">滤镜</span>
              </TabsTrigger>
              <TabsTrigger value="adjust" className="flex flex-col gap-1 py-2">
                <Sliders className="h-4 w-4" />
                <span className="text-xs">调节</span>
              </TabsTrigger>
              <TabsTrigger value="background" className="flex flex-col gap-1 py-2">
                <Camera className="h-4 w-4" />
                <span className="text-xs">背景</span>
              </TabsTrigger>
            </TabsList>

            {/* Beauty Tab */}
            <TabsContent value="beauty" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">美颜模式</span>
                <Switch checked={isBeautyMode} onCheckedChange={onToggleBeautyMode} />
              </div>

              {isBeautyMode && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">美颜强度</span>
                      <span className="text-sm text-gray-500">{beautyLevel[0]}%</span>
                    </div>
                    <Slider value={beautyLevel} onValueChange={setBeautyLevel} max={100} step={1} className="w-full" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      磨皮
                    </Button>
                    <Button variant="outline" size="sm">
                      美白
                    </Button>
                    <Button variant="outline" size="sm">
                      瘦脸
                    </Button>
                    <Button variant="outline" size="sm">
                      大眼
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Filters Tab */}
            <TabsContent value="filters" className="mt-4">
              <div className="grid grid-cols-4 gap-2">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={currentFilter === filter.id ? "default" : "outline"}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => onApplyFilter?.(filter.id)}
                  >
                    <span className="text-lg">{filter.preview}</span>
                    <span className="text-xs">{filter.name}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>

            {/* Adjust Tab */}
            <TabsContent value="adjust" className="space-y-4 mt-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">亮度</span>
                  <span className="text-sm text-gray-500">{brightness[0]}%</span>
                </div>
                <Slider value={brightness} onValueChange={setBrightness} max={100} step={1} className="w-full" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">对比度</span>
                  <span className="text-sm text-gray-500">{contrast[0]}%</span>
                </div>
                <Slider value={contrast} onValueChange={setContrast} max={100} step={1} className="w-full" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">饱和度</span>
                  <span className="text-sm text-gray-500">{saturation[0]}%</span>
                </div>
                <Slider value={saturation} onValueChange={setSaturation} max={100} step={1} className="w-full" />
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setBrightness([50])
                  setContrast([50])
                  setSaturation([50])
                }}
              >
                重置所有调节
              </Button>
            </TabsContent>

            {/* Background Tab */}
            <TabsContent value="background" className="mt-4">
              <div className="grid grid-cols-4 gap-2">
                {backgrounds.map((bg) => (
                  <Button
                    key={bg.id}
                    variant={selectedBackground === bg.id ? "default" : "outline"}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => setSelectedBackground(bg.id)}
                  >
                    <span className="text-lg">{bg.preview}</span>
                    <span className="text-xs">{bg.name}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              取消
            </Button>
            <Button className="flex-1" onClick={onClose}>
              应用
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
