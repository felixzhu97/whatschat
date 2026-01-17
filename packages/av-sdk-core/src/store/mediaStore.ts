import { create } from "zustand";
import { MediaDeviceInfo } from "../types";

interface MediaStore {
  audioEnabled: boolean;
  videoEnabled: boolean;
  audioMuted: boolean;
  videoMuted: boolean;
  selectedAudioDevice: string | null;
  selectedVideoDevice: string | null;
  devices: MediaDeviceInfo[];
  setAudioEnabled: (enabled: boolean) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setAudioMuted: (muted: boolean) => void;
  setVideoMuted: (muted: boolean) => void;
  setSelectedAudioDevice: (deviceId: string | null) => void;
  setSelectedVideoDevice: (deviceId: string | null) => void;
  setDevices: (devices: MediaDeviceInfo[]) => void;
  reset: () => void;
}

export const useMediaStore = create<MediaStore>((set) => ({
  audioEnabled: true,
  videoEnabled: true,
  audioMuted: false,
  videoMuted: false,
  selectedAudioDevice: null,
  selectedVideoDevice: null,
  devices: [],
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
  setVideoEnabled: (enabled) => set({ videoEnabled: enabled }),
  setAudioMuted: (muted) => set({ audioMuted: muted }),
  setVideoMuted: (muted) => set({ videoMuted: muted }),
  setSelectedAudioDevice: (deviceId) => set({ selectedAudioDevice: deviceId }),
  setSelectedVideoDevice: (deviceId) => set({ selectedVideoDevice: deviceId }),
  setDevices: (devices) => set({ devices }),
  reset: () =>
    set({
      audioEnabled: true,
      videoEnabled: true,
      audioMuted: false,
      videoMuted: false,
      selectedAudioDevice: null,
      selectedVideoDevice: null,
      devices: [],
    }),
}));
