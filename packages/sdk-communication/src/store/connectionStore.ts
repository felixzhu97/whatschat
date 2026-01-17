import { create } from "zustand";
import { ConnectionState } from "../types";

interface ConnectionStore {
  state: ConnectionState;
  roomId: string | null;
  peerId: string | null;
  signalingUrl: string | null;
  setState: (state: ConnectionState) => void;
  setRoomId: (roomId: string | null) => void;
  setPeerId: (peerId: string | null) => void;
  setSignalingUrl: (url: string | null) => void;
  reset: () => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  state: ConnectionState.Disconnected,
  roomId: null,
  peerId: null,
  signalingUrl: null,
  setState: (state) => set({ state }),
  setRoomId: (roomId) => set({ roomId }),
  setPeerId: (peerId) => set({ peerId }),
  setSignalingUrl: (signalingUrl) => set({ signalingUrl }),
  reset: () =>
    set({
      state: ConnectionState.Disconnected,
      roomId: null,
      peerId: null,
      signalingUrl: null,
    }),
}));
