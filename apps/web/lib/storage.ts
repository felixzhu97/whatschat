export class StorageManager {
  private static readonly PREFIX = "whatsapp_"
  private static db: IDBDatabase | null = null
  private static dbName = "WhatsAppDB"
  private static dbVersion = 1

  // 初始化 IndexedDB
  static async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建对象存储
        if (!db.objectStoreNames.contains("contacts")) {
          db.createObjectStore("contacts", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("messages")) {
          db.createObjectStore("messages", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("calls")) {
          db.createObjectStore("calls", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" })
        }
      }
    })
  }

  // 保存数据到 localStorage
  static save(key: string, data: any): void {
    try {
      const serializedData = JSON.stringify(data)
      localStorage.setItem(this.PREFIX + key, serializedData)
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  // 从 localStorage 加载数据
  static load<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.PREFIX + key)
      if (item === null) return defaultValue
      return JSON.parse(item)
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
      return defaultValue
    }
  }

  // 从 localStorage 删除数据
  static remove(key: string): void {
    try {
      localStorage.removeItem(this.PREFIX + key)
    } catch (error) {
      console.error("Failed to remove from localStorage:", error)
    }
  }

  // 清空所有数据
  static clear(): void {
    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith(this.PREFIX))
      keys.forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.error("Failed to clear localStorage:", error)
    }
  }

  // IndexedDB 操作
  static async saveToIndexedDB(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  static async loadFromIndexedDB<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  static async removeFromIndexedDB(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  // 获取存储使用情况
  static getStorageUsage(): { localStorage: number; indexedDB: number } {
    let localStorageSize = 0
    try {
      for (const key in localStorage) {
        if (key.startsWith(this.PREFIX)) {
          localStorageSize += localStorage[key].length
        }
      }
    } catch (error) {
      console.error("Failed to calculate localStorage usage:", error)
    }

    return {
      localStorage: localStorageSize,
      indexedDB: 0, // IndexedDB 大小计算比较复杂，这里简化处理
    }
  }

  // 导出数据
  static exportData(): string {
    const data: { [key: string]: any } = {}

    try {
      for (const key in localStorage) {
        if (key.startsWith(this.PREFIX)) {
          const cleanKey = key.replace(this.PREFIX, "")
          data[cleanKey] = JSON.parse(localStorage[key])
        }
      }
    } catch (error) {
      console.error("Failed to export data:", error)
    }

    return JSON.stringify(data, null, 2)
  }

  // 导入数据
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)

      for (const key in data) {
        this.save(key, data[key])
      }

      return true
    } catch (error) {
      console.error("Failed to import data:", error)
      return false
    }
  }

  // 数据备份
  static async backup(): Promise<Blob> {
    const data = this.exportData()
    return new Blob([data], { type: "application/json" })
  }

  // 数据恢复
  static async restore(file: File): Promise<boolean> {
    try {
      const text = await file.text()
      return this.importData(text)
    } catch (error) {
      console.error("Failed to restore data:", error)
      return false
    }
  }
}

// 初始化存储管理器
if (typeof window !== "undefined") {
  StorageManager.initDB().catch(console.error)
}
