"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Paperclip, ImageIcon, FileText, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

interface FileUploadProps {
  onFileSelect: (file: File, type: "image" | "file") => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [previewFiles, setPreviewFiles] = useState<File[]>([])

  const handleFileSelect = (files: FileList | null, type: "image" | "file") => {
    if (!files) return

    Array.from(files).forEach((file) => {
      // 验证文件大小 (最大 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert(`文件 "${file.name}" 太大，最大支持 50MB`)
        return
      }

      // 验证文件类型
      if (type === "image" && !file.type.startsWith("image/")) {
        alert(`"${file.name}" 不是有效的图片文件`)
        return
      }

      // 模拟上传进度
      simulateUpload(file, type)
    })
  }

  const simulateUpload = (file: File, type: "image" | "file") => {
    const fileId = `${file.name}-${Date.now()}`
    setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))

    // 添加到预览列表
    setPreviewFiles((prev) => [...prev, file])

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const currentProgress = prev[fileId] || 0
        const newProgress = currentProgress + Math.random() * 20

        if (newProgress >= 100) {
          clearInterval(interval)
          // 上传完成，调用回调
          setTimeout(() => {
            onFileSelect(file, type)
            setUploadProgress((prev) => {
              const { [fileId]: _, ...rest } = prev
              return rest
            })
            setPreviewFiles((prev) => prev.filter((f) => f !== file))
          }, 500)
          return { ...prev, [fileId]: 100 }
        }

        return { ...prev, [fileId]: newProgress }
      })
    }, 200)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      // 自动判断文件类型
      Array.from(files).forEach((file) => {
        const type = file.type.startsWith("image/") ? "image" : "file"
        handleFileSelect(files, type)
      })
    }
  }

  const removePreviewFile = (file: File) => {
    setPreviewFiles((prev) => prev.filter((f) => f !== file))
    const fileId = `${file.name}-${Date.now()}`
    setUploadProgress((prev) => {
      const { [fileId]: _, ...rest } = prev
      return rest
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="relative">
      {/* 文件上传按钮 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Paperclip className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
            <ImageIcon className="h-4 w-4 mr-2" />
            图片
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <FileText className="h-4 w-4 mr-2" />
            文档
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 隐藏的文件输入 */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files, "image")}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files, "file")}
      />

      {/* 拖拽上传区域 */}
      {isDragging && (
        <div
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-white rounded-lg p-8 shadow-xl border-2 border-dashed border-green-500">
            <div className="text-center">
              <Upload className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">释放文件以上传</p>
              <p className="text-sm text-gray-500">支持图片和文档文件</p>
            </div>
          </div>
        </div>
      )}

      {/* 上传进度显示 */}
      {previewFiles.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-3 min-w-[300px]">
          <div className="space-y-3">
            {previewFiles.map((file, index) => {
              const fileId = `${file.name}-${Date.now()}`
              const progress = uploadProgress[fileId] || 0

              return (
                <div key={index} className="flex items-center gap-3">
                  {/* 文件图标 */}
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="h-5 w-5 text-gray-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-gray-600" />
                    )}
                  </div>

                  {/* 文件信息 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    <Progress value={progress} className="h-1 mt-1" />
                  </div>

                  {/* 移除按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => removePreviewFile(file)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
