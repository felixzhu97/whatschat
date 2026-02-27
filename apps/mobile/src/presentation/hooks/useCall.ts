import { useCall as useRtcCall } from "@whatschat/im";
import { useSocketStore } from "@/src/presentation/stores";
import { getCallManager } from "@/src/infrastructure/call/callManagerLoader";

export function useCall() {
  const socket = useSocketStore((s) => s.socket);
  return useRtcCall({
    getCallManager: () => getCallManager(),
    socket,
  });
}
