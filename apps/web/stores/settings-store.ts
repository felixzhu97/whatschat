import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { StorageManager } from "../lib/storage"

export interface NotificationSettings {
  enabled: boolean
  sound: boolean
  vibration: boolean
  showPreview: boolean
  groupNotifications: boolean
  callNotifications: boolean
}

export interface PrivacySettings {
  lastSeen: "everyone" | "contacts" | "nobody"
  profilePhoto: "everyone" | "contacts" | "nobody"
  status: "everyone" | "contacts" | "nobody"
  readReceipts: boolean
  onlineStatus: boolean
  blockedContacts: string[]
}

export interface ChatSettings {
  fontSize: "small" | "medium" | "large"
  wallpaper: string
  enterToSend: boolean
  mediaAutoDownload: boolean
  backupFrequency: "daily" | "weekly" | "monthly" | "never"
  archiveSettings: boolean
}

export interface CallSettings {
  lowDataUsage: boolean
  callWaiting: boolean
  autoAnswer: boolean
  speakerphone: boolean
  noiseReduction: boolean
}

export interface AppSettings {
  theme: "light" | "dark" | "system"
  language: string
  notifications: NotificationSettings
  privacy: PrivacySettings
  chat: ChatSettings
  calls: CallSettings
  storage: {
    autoBackup: boolean
    backupLocation: string
    maxStorageSize: number
  }
  advanced: {
    debugMode: boolean
    betaFeatures: boolean
    crashReports: boolean
  }
}

interface SettingsState {
  settings: AppSettings
  isLoading: boolean
  error: string | null

  // Actions
  updateSettings: (updates: Partial<AppSettings>) => void
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void
  updatePrivacySettings: (updates: Partial<PrivacySettings>) => void
  updateChatSettings: (updates: Partial<ChatSettings>) => void
  updateCallSettings: (updates: Partial<CallSettings>) => void
  resetSettings: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean

  // Getters
  getTheme: () => "light" | "dark" | "system"
  getEffectiveTheme: () => "light" | "dark"
  isNotificationsEnabled: () => boolean
  getLanguage: () => string
  getFontSize: () => "small" | "medium" | "large"

  // Privacy
  canSeeLastSeen: (contactId: string) => boolean
  canSeeProfilePhoto: (contactId: string) => boolean
  canSeeStatus: (contactId: string) => boolean
  isContactBlocked: (contactId: string) => boolean
  blockContact: (contactId: string) => void
  unblockContact: (contactId: string) => void

  // Sync
  syncSettings: () => Promise<void>
}

const defaultSettings: AppSettings = {
  theme: "system",
  language: "zh-CN",
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    showPreview: true,
    groupNotifications: true,
    callNotifications: true,
  },
  privacy: {
    lastSeen: "everyone",
    profilePhoto: "everyone",
    status: "everyone",
    readReceipts: true,
    onlineStatus: true,
    blockedContacts: [],
  },
  chat: {
    fontSize: "medium",
    wallpaper: "default",
    enterToSend: true,
    mediaAutoDownload: true,
    backupFrequency: "daily",
    archiveSettings: false,
  },
  calls: {
    lowDataUsage: false,
    callWaiting: true,
    autoAnswer: false,
    speakerphone: false,
    noiseReduction: true,
  },
  storage: {
    autoBackup: true,
    backupLocation: "local",
    maxStorageSize: 1024, // MB
  },
  advanced: {
    debugMode: false,
    betaFeatures: false,
    crashReports: true,
  },
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,
      error: null,

      // Actions
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      updateNotificationSettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, ...updates },
          },
        })),

      updatePrivacySettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            privacy: { ...state.settings.privacy, ...updates },
          },
        })),

      updateChatSettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            chat: { ...state.settings.chat, ...updates },
          },
        })),

      updateCallSettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            calls: { ...state.settings.calls, ...updates },
          },
        })),

      resetSettings: () => set({ settings: defaultSettings }),

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

      // Getters
      getTheme: () => get().settings.theme,

      getEffectiveTheme: () => {
        const { theme } = get().settings
        if (theme === "system") {
          return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        }
        return theme
      },

      isNotificationsEnabled: () => get().settings.notifications.enabled,

      getLanguage: () => get().settings.language,

      getFontSize: () => get().settings.chat.fontSize,

      // Privacy
      canSeeLastSeen: (contactId) => {
        const { privacy } = get().settings
        if (privacy.blockedContacts.includes(contactId)) return false

        switch (privacy.lastSeen) {
          case "everyone":
            return true
          case "contacts":
            return true // 简化处理，假设都是联系人
          case "nobody":
            return false
          default:
            return true
        }
      },

      canSeeProfilePhoto: (contactId) => {
        const { privacy } = get().settings
        if (privacy.blockedContacts.includes(contactId)) return false

        switch (privacy.profilePhoto) {
          case "everyone":
            return true
          case "contacts":
            return true // 简化处理
          case "nobody":
            return false
          default:
            return true
        }
      },

      canSeeStatus: (contactId) => {
        const { privacy } = get().settings
        if (privacy.blockedContacts.includes(contactId)) return false

        switch (privacy.status) {
          case "everyone":
            return true
          case "contacts":
            return true // 简化处理
          case "nobody":
            return false
          default:
            return true
        }
      },

      isContactBlocked: (contactId) => {
        const { privacy } = get().settings
        return privacy.blockedContacts.includes(contactId)
      },

      blockContact: (contactId) => {
        const { privacy } = get().settings
        if (!privacy.blockedContacts.includes(contactId)) {
          get().updatePrivacySettings({
            blockedContacts: [...privacy.blockedContacts, contactId],
          })
        }
      },

      unblockContact: (contactId) => {
        const { privacy } = get().settings
        get().updatePrivacySettings({
          blockedContacts: privacy.blockedContacts.filter((id) => id !== contactId),
        })
      },

      // Sync
      syncSettings: async () => {
        set({ isLoading: true, error: null })
        try {
          // 这里可以实现与服务器同步设置的逻辑
          await new Promise((resolve) => setTimeout(resolve, 1000))
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false, error: "同步设置失败" })
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
