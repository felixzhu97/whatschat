/**
 * 数据库模式定义
 */

export const callHistorySchema = `
CREATE TABLE IF NOT EXISTS call_history (
  id TEXT PRIMARY KEY,
  room_id TEXT,
  participants TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  duration INTEGER,
  type TEXT NOT NULL CHECK(type IN ('audio', 'video')),
  status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'missed')),
  signaling_url TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_call_history_start_time ON call_history(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_call_history_room_id ON call_history(room_id);
`;

export const userSettingsSchema = `
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY,
  default_resolution_width INTEGER,
  default_resolution_height INTEGER,
  default_bitrate INTEGER,
  default_frame_rate INTEGER,
  default_audio_bitrate INTEGER,
  default_beauty_intensity REAL,
  default_filter_preset TEXT,
  codec_preference TEXT CHECK(codec_preference IN ('hardware', 'software')),
  recording_format TEXT,
  recording_quality TEXT CHECK(recording_quality IN ('low', 'medium', 'high')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
`;

export const recordingSchema = `
CREATE TABLE IF NOT EXISTS recordings (
  id TEXT PRIMARY KEY,
  call_history_id TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  format TEXT NOT NULL,
  resolution_width INTEGER,
  resolution_height INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(call_history_id) REFERENCES call_history(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_recordings_call_history_id ON recordings(call_history_id);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at DESC);
`;

export const databaseSchema = {
  callHistory: callHistorySchema,
  userSettings: userSettingsSchema,
  recording: recordingSchema,
};
