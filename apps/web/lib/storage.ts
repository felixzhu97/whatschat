export class StorageManager {
  private static readonly PREFIX = "whatsapp_"
  private static readonly MAX_LOCALSTORAGE_SIZE = 5 * 1024 * 1024 // 5MB

  // localStorage操作
  static save(key: string, data: any): boolean {
    try {
      const prefixedKey = this.PREFIX + key
      const serialized = JSON.stringify(data)

      // 检查数据大小
      if (serialized.length > this.MAX_LOCALSTORAGE_SIZE) {
        console.warn(`Data too large for localStorage: ${key}`)
        return this.saveToIndexedDB(key, data)
      }

      localStorage.setItem(prefixedKey, serialized)
      return true
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
      return this.saveToIndexedDB(key, data)
    }
  }

  static load<T>(key: string, defaultValue: T): T {
    try {
      const prefixedKey = this.PREFIX + key
      const stored = localStorage.getItem(prefixedKey)

      if (stored === null) {
        // 尝试从IndexedDB加载
        this.loadFromIndexedDB(key).then((data) => {
          if (data !== null) {
            return data as T
          }
        })
        return defaultValue
      }

      return JSON.parse(stored) as T
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
      return defaultValue
    }
  }

  static remove(key: string): boolean {
    try {
      const prefixedKey = this.PREFIX + key
      localStorage.removeItem(prefixedKey)
      this.removeFromIndexedDB(key)
      return true
    } catch (error) {
      console.error("Failed to remove from storage:", error)
      return false
    }
  }

  static clear(): boolean {
    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith(this.PREFIX))
      keys.forEach((key) => localStorage.removeItem(key))
      this.clearIndexedDB()
      return true
    } catch (error) {
      console.error("Failed to clear storage:", error)
      return false
    }
  }

  // IndexedDB操作
  private static async saveToIndexedDB(key: string, data: any): Promise<boolean> {
    try {
      const db = await this.openIndexedDB()
      const transaction = db.transaction(["storage"], "readwrite")
      const store = transaction.objectStore("storage")

      await store.put({ key, data, timestamp: Date.now() })
      return true
    } catch (error) {
      console.error("Failed to save to IndexedDB:", error)
      return false
    }
  }

  private static async loadFromIndexedDB(key: string): Promise<any> {
    try {
      const db = await this.openIndexedDB()
      const transaction = db.transaction(["storage"], "readonly")
      const store = transaction.objectStore("storage")

      const result = await store.get(key)
      return result?.data || null
    } catch (error) {
      console.error("Failed to load from IndexedDB:", error)
      return null
    }
  }

  private static async removeFromIndexedDB(key: string): Promise<boolean> {
    try {
      const db = await this.openIndexedDB()
      const transaction = db.transaction(["storage"], "readwrite")
      const store = transaction.objectStore("storage")

      await store.delete(key)
      return true
    } catch (error) {
      console.error("Failed to remove from IndexedDB:", error)
      return false
    }
  }

  private static async clearIndexedDB(): Promise<boolean> {
    try {
      const db = await this.openIndexedDB()
      const transaction = db.transaction(["storage"], "readwrite")
      const store = transaction.objectStore("storage")

      await store.clear()
      return true
    } catch (error) {
      console.error("Failed to clear IndexedDB:", error)
      return false
    }
  }

  private static openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("WhatsAppStorage", 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains("storage")) {
          db.createObjectStore("storage", { keyPath: "key" })
        }
      }
    })
  }

  // 工具方法
  static getStorageInfo() {
    const used = new Blob(Object.values(localStorage)).size
    const quota = 10 * 1024 * 1024 // 估算10MB配额

    return {
      used,
      quota,
      available: quota - used,
      percentage: (used / quota) * 100,
    }
  }

  static exportData(): string {
    const data: Record<string, any> = {}

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.PREFIX)) {
        const cleanKey = key.replace(this.PREFIX, "")
        data[cleanKey] = JSON.parse(localStorage.getItem(key) || "{}")
      }
    })

    return JSON.stringify(data, null, 2)
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)

      Object.entries(data).forEach(([key, value]) => {
        this.save(key, value)
      })

      return true
    } catch (error) {
      console.error("Failed to import data:", error)
      return false
    }
  }
}
