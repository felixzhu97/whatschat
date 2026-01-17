import {
  IDatabaseManager,
  CallHistory,
  UserSettings,
  Recording,
  DatabaseStats,
} from "@whatschat/av-sdk-database";
import { openDB, DBSchema, IDBPDatabase } from "idb";
import { generateId } from "@whatschat/av-sdk-database";
import { databaseSchema } from "@whatschat/av-sdk-database";

interface AVSDKSchema extends DBSchema {
  call_history: {
    key: string;
    value: CallHistory;
    indexes: { "by-start-time": number; "by-room-id": string };
  };
  user_settings: {
    key: string;
    value: UserSettings;
  };
  recordings: {
    key: string;
    value: Recording;
    indexes: { "by-call-history-id": string; "by-created-at": number };
  };
}

export class DatabaseManager implements IDatabaseManager {
  private db: IDBPDatabase<AVSDKSchema> | null = null;
  private readonly DB_NAME = "av-sdk-db";
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    this.db = await openDB<AVSDKSchema>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Create call_history store
        if (!db.objectStoreNames.contains("call_history")) {
          const callHistoryStore = db.createObjectStore("call_history", {
            keyPath: "id",
          });
          callHistoryStore.createIndex("by-start-time", "startTime");
          callHistoryStore.createIndex("by-room-id", "roomId");
        }

        // Create user_settings store
        if (!db.objectStoreNames.contains("user_settings")) {
          db.createObjectStore("user_settings", { keyPath: "id" });
        }

        // Create recordings store
        if (!db.objectStoreNames.contains("recordings")) {
          const recordingsStore = db.createObjectStore("recordings", {
            keyPath: "id",
          });
          recordingsStore.createIndex("by-call-history-id", "callHistoryId");
          recordingsStore.createIndex("by-created-at", "createdAt");
        }
      },
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async saveCallRecord(
    record: Omit<CallHistory, "id" | "createdAt">
  ): Promise<CallHistory> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const callHistory: CallHistory = {
      ...record,
      id: generateId(),
      createdAt: Date.now(),
    };

    await this.db.put("call_history", callHistory);
    return callHistory;
  }

  async getCallRecord(id: string): Promise<CallHistory | null> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return (await this.db.get("call_history", id)) || null;
  }

  async getCallHistory(limit = 100, offset = 0): Promise<CallHistory[]> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const index = this.db.transaction("call_history").store.index("by-start-time");
    const allRecords = await index.getAll();
    return allRecords
      .sort((a, b) => b.startTime - a.startTime)
      .slice(offset, offset + limit);
  }

  async deleteCallRecord(id: string): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    await this.db.delete("call_history", id);
  }

  async updateCallRecord(
    id: string,
    updates: Partial<CallHistory>
  ): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const record = await this.db.get("call_history", id);
    if (record) {
      await this.db.put("call_history", { ...record, ...updates });
    }
  }

  async getUserSettings(): Promise<UserSettings | null> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const settings = await this.db.getAll("user_settings");
    if (settings.length === 0) {
      // Create default settings
      const defaultSettings: UserSettings = {
        id: "default",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await this.db.put("user_settings", defaultSettings);
      return defaultSettings;
    }
    return settings[0];
  }

  async updateUserSettings(
    settings: Partial<Omit<UserSettings, "id" | "createdAt" | "updatedAt">>
  ): Promise<UserSettings> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const existing = await this.getUserSettings();
    const updated: UserSettings = {
      ...(existing || { id: "default", createdAt: Date.now(), updatedAt: Date.now() }),
      ...settings,
      updatedAt: Date.now(),
    };

    await this.db.put("user_settings", updated);
    return updated;
  }

  async saveRecording(
    recording: Omit<Recording, "id" | "createdAt">
  ): Promise<Recording> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const rec: Recording = {
      ...recording,
      id: generateId(),
      createdAt: Date.now(),
    };

    await this.db.put("recordings", rec);
    return rec;
  }

  async getRecording(id: string): Promise<Recording | null> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return (await this.db.get("recordings", id)) || null;
  }

  async getRecordings(limit = 100, offset = 0): Promise<Recording[]> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const index = this.db.transaction("recordings").store.index("by-created-at");
    const allRecordings = await index.getAll();
    return allRecordings
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(offset, offset + limit);
  }

  async deleteRecording(id: string): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    await this.db.delete("recordings", id);
  }

  async getStats(): Promise<DatabaseStats> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const calls = await this.db.getAll("call_history");
    const recordings = await this.db.getAll("recordings");

    const totalDuration = calls.reduce(
      (sum, call) => sum + (call.duration || 0),
      0
    );
    const totalRecordingsSize = recordings.reduce(
      (sum, rec) => sum + rec.fileSize,
      0
    );

    return {
      totalCalls: calls.length,
      totalDuration,
      totalRecordings: recordings.length,
      totalRecordingsSize,
    };
  }

  async clearAll(): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    await this.db.clear("call_history");
    await this.db.clear("user_settings");
    await this.db.clear("recordings");
  }
}
