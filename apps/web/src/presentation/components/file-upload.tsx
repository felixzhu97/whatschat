"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/src/presentation/components/ui/button"
import { Card } from "@/src/presentation/components/ui/card"
import { ImageIcon, FileText, Camera } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File, type: "image" | "file") => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
    imageInputRef.current?.click()
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file, "image")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file, "file")
    }
  }

  return (
    <Card className="p-2 shadow-lg">
      <div className="grid grid-cols-3 gap-2 w-48">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImageClick}
          className="flex flex-col items-center space-y-1 h-auto p-3"
        >
          <ImageIcon className="h-6 w-6 text-blue-500" />
          <span className="text-xs">图片</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleFileClick}
          className="flex flex-col items-center space-y-1 h-auto p-3"
        >
          <FileText className="h-6 w-6 text-gray-500" />
          <span className="text-xs">文件</span>
        </Button>

        <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto p-3">
          <Camera className="h-6 w-6 text-purple-500" />
          <span className="text-xs">相机</span>
        </Button>
      </div>

      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

      <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
    </Card>
  )
}
