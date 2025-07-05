import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { StorageManager } from "../lib/storage"

export interface AppSettings {
  // 主题设置
  theme: "light" | "dark" | "system"
  accentColor: string
  fontSize: "small" | "medium" | "large"

  // 通知设置
  notifications: {
    enabled: boolean
    sound: boolean
    vibration: boolean
    preview: boolean
    groupNotifications: boolean
    callNotifications: boolean
  }

  // 隐私设置
  privacy: {
    lastSeen: "everyone" | "contacts" | "nobody"
    profilePhoto: "everyone" | "contacts" | "nobody"
    status: "everyone" | "contacts" | "nobody"
    readReceipts: boolean
    onlineStatus: boolean
  }

  // 聊天设置
  chat: {
    enterToSend: boolean
    mediaAutoDownload: boolean
    linkPreview: boolean
    emojiSuggestions: boolean
    spellCheck: boolean
    messageGrouping: boolean
  }

  // 通话设置
  calls: {
    ringtone: string
    callWaiting: boolean
    lowDataUsage: boolean
    alwaysRelay: boolean
  }

  // 存储设置
  storage: {
    autoBackup: boolean
    backupFrequency: "daily" | "weekly" | "monthly"
    includeVideos: boolean
    wifiOnly: boolean
  }

  // 语言设置
  language: string

  // 实验性功能
  experimental: {
    betaFeatures: boolean
    debugMode: boolean
  }
}

const defaultSettings: AppSettings = {
  theme: "system",
  accentColor: "#25D366",
  fontSize: "medium",

  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    preview: true,
    groupNotifications: true,
    callNotifications: true,
  },

  privacy: {
    lastSeen: "everyone",
    profilePhoto: "everyone",
    status: "everyone",
    readReceipts: true,
    onlineStatus: true,
  },

  chat: {
    enterToSend: true,
    mediaAutoDownload: true,
    linkPreview: true,
    emojiSuggestions: true,
    spellCheck: true,
    messageGrouping: true,
  },

  calls: {
    ringtone: "default",
    callWaiting: true,
    lowDataUsage: false,
    alwaysRelay: false,
  },

  storage: {
    autoBackup: true,
    backupFrequency: "daily",
    includeVideos: false,
    wifiOnly: true,
  },

  language: "zh-CN",

  experimental: {
    betaFeatures: false,
    debugMode: false,
  },
}

interface SettingsState {
  settings: AppSettings

  // Actions
  updateSettings: (updates: Partial<AppSettings>) => void
  updateThemeSettings: (theme: Partial<AppSettings["theme"]>) => void
  updateNotificationSettings: (notifications: Partial<AppSettings["notifications"]>) => void
  updatePrivacySettings: (privacy: Partial<AppSettings["privacy"]>) => void
  updateChatSettings: (chat: Partial<AppSettings["chat"]>) => void
  updateCallSettings: (calls: Partial<AppSettings["calls"]>) => void
  updateStorageSettings: (storage: Partial<AppSettings["storage"]>) => void
  resetSettings: () => void

  // Computed
  getEffectiveTheme: () => "light" | "dark"
  isNotificationsEnabled: () => boolean
  shouldShowPreviews: () => boolean
  getLanguage: () => string

  // Import/Export
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      // Actions
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      updateThemeSettings: (themeUpdates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...themeUpdates,
          },
        })),

      updateNotificationSettings: (notifications) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, ...notifications },
          },
        })),

      updatePrivacySettings: (privacy) =>
        set((state) => ({
          settings: {
            ...state.settings,
            privacy: { ...state.settings.privacy, ...privacy },
          },
        })),

      updateChatSettings: (chat) =>
        set((state) => ({
          settings: {
            ...state.settings,
            chat: { ...state.settings.chat, ...chat },
          },
        })),

      updateCallSettings: (calls) =>
        set((state) => ({
          settings: {
            ...state.settings,
            calls: { ...state.settings.calls, ...calls },
          },
        })),

      updateStorageSettings: (storage) =>
        set((state) => ({
          settings: {
            ...state.settings,
            storage: { ...state.settings.storage, ...storage },
          },
        })),

      resetSettings: () => set({ settings: defaultSettings }),

      // Computed
      getEffectiveTheme: () => {
        const { settings } = get()
        if (settings.theme === "system") {
          return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        }
        return settings.theme
      },

      isNotificationsEnabled: () => {
        const { settings } = get()
        return settings.notifications.enabled
      },

      shouldShowPreviews: () => {
        const { settings } = get()
        return settings.notifications.enabled && settings.notifications.preview
      },

      getLanguage: () => {
        const { settings } = get()
        return settings.language
      },

      // Import/Export
      exportSettings: () => {
        const { settings } = get()
        return JSON.stringify(settings, null, 2)
      },

      importSettings: (settingsJson) => {
        try {
          const importedSettings = JSON.parse(settingsJson) as AppSettings
          set({ settings: { ...defaultSettings, ...importedSettings } })
          return true
        } catch (error) {
          console.error("Failed to import settings:", error)
          return false
        }
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => StorageManager.load(name, null),
        setItem: (name, value) => StorageManager.save(name, value),
        removeItem: (name) => StorageManager.remove(name),
      })),
    },
  ),
)
