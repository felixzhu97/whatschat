import {
  IConnectionManager,
  ConnectionConfig,
} from "@whatschat/sdk-communication";
import {
  IMediaManager,
  IStreamManager,
} from "@whatschat/sdk-media";
import {
  ICodecManager,
  IFilterManager,
} from "@whatschat/sdk-processing";
import {
  IRecordManager,
  IScreenShareManager,
} from "@whatschat/sdk-recording";
import { IDatabaseManager } from "@whatschat/sdk-storage";
import { ConnectionManager } from "./ConnectionManager";
import { MediaManager } from "./MediaManager";
import { StreamManager } from "./StreamManager";
import { RecordManager } from "./RecordManager";
import { ScreenShareManager } from "./ScreenShareManager";
import { CodecManager } from "./CodecManager";
import { FilterManager } from "./FilterManager";
import { DatabaseManager } from "./DatabaseManager";

export interface AVSDKConfig extends ConnectionConfig {
  // Additional config options
}

export interface AVSDK {
  connection: IConnectionManager;
  media: IMediaManager;
  stream: IStreamManager;
  record: IRecordManager;
  screenShare: IScreenShareManager;
  codec: ICodecManager;
  filter: IFilterManager;
  database: IDatabaseManager;

  // Event listeners
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler: (...args: unknown[]) => void): void;

  // Lifecycle
  destroy(): Promise<void>;
}

export function createAVSDK(config: AVSDKConfig): AVSDK {
  const connection = new ConnectionManager();
  const media = new MediaManager();
  const stream = new StreamManager();
  const record = new RecordManager();
  const screenShare = new ScreenShareManager();
  const codec = new CodecManager();
  const filter = new FilterManager();
  const database = new DatabaseManager();

  // Initialize database
  database.initialize().catch((error) => {
    console.error("Failed to initialize database:", error);
  });

  return {
    connection,
    media,
    stream,
    record,
    screenShare,
    codec,
    filter,
    database,

    on(event: string, handler: (...args: unknown[]) => void) {
      connection.on(event, handler);
      media.on(event, handler);
      stream.on(event, handler);
      record.on(event, handler);
      screenShare.on(event, handler);
      codec.on(event, handler);
      filter.on(event, handler);
    },

    off(event: string, handler: (...args: unknown[]) => void) {
      connection.off(event, handler);
      media.off(event, handler);
      stream.off(event, handler);
      record.off(event, handler);
      screenShare.off(event, handler);
      codec.off(event, handler);
      filter.off(event, handler);
    },

    async destroy() {
      await connection.disconnect();
      await database.close();
    },
  };
}
