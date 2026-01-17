import { create } from "zustand";
import { CodecState, EncoderConfig, DecoderConfig } from "../types";

interface CodecStore {
  encoderState: CodecState;
  decoderState: CodecState;
  encoderConfig: EncoderConfig | null;
  decoderConfig: DecoderConfig | null;
  hardwareSupported: boolean;
  setEncoderState: (state: CodecState) => void;
  setDecoderState: (state: CodecState) => void;
  setEncoderConfig: (config: EncoderConfig | null) => void;
  setDecoderConfig: (config: DecoderConfig | null) => void;
  setHardwareSupported: (supported: boolean) => void;
  reset: () => void;
}

export const useCodecStore = create<CodecStore>((set) => ({
  encoderState: CodecState.Idle,
  decoderState: CodecState.Idle,
  encoderConfig: null,
  decoderConfig: null,
  hardwareSupported: false,
  setEncoderState: (state) => set({ encoderState: state }),
  setDecoderState: (state) => set({ decoderState: state }),
  setEncoderConfig: (config) => set({ encoderConfig: config }),
  setDecoderConfig: (config) => set({ decoderConfig: config }),
  setHardwareSupported: (supported) => set({ hardwareSupported: supported }),
  reset: () =>
    set({
      encoderState: CodecState.Idle,
      decoderState: CodecState.Idle,
      encoderConfig: null,
      decoderConfig: null,
      hardwareSupported: false,
    }),
}));
