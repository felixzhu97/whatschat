"use client"

import { useEffect } from "react"

interface SearchShortcutsProps {
  onOpenSearch: () => void
  onOpenAdvancedSearch: () => void
}

export function SearchShortcuts({ onOpenSearch, onOpenAdvancedSearch }: SearchShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + F 打开搜索
      if ((event.ctrlKey || event.metaKey) && event.key === "f") {
        event.preventDefault()
        onOpenSearch()
      }

      // Ctrl/Cmd + Shift + F 打开高级搜索
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "F") {
        event.preventDefault()
        onOpenAdvancedSearch()
      }

      // ESC 键关闭搜索（这个逻辑应该在各个搜索组件中处理）
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onOpenSearch, onOpenAdvancedSearch])

  return null // 这个组件不渲染任何内容，只处理快捷键
}
