import { ICallsService } from "../../domain/interfaces/services/calls.service.interface";
import { Call } from "../../domain/entities/call.entity";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getStorageAdapter } from "../../infrastructure/adapters/storage/storage.adapter";

interface CallsState {
  calls: Call[];
  activeCall: Call | null;
  incomingCall: Call | null;
  callHistory: Call[];
}

const storageAdapter = getStorageAdapter();

const useCallsStore = create<CallsState>()(
  persist(
    (set, get) => ({
      calls: [],
      activeCall: null,
      incomingCall: null,
      callHistory: [],
    }),
    {
      name: "calls-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => storageAdapter.load(name, null),
        setItem: (name, value) => storageAdapter.save(name, value),
        removeItem: (name) => storageAdapter.remove(name),
      })),
    }
  )
);

export class CallsService implements ICallsService {
  private store = useCallsStore.getState();

  async startCall(
    contactId: string,
    type: "voice" | "video"
  ): Promise<Call> {
    const call = Call.create({
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contactId,
      contactName: `联系人${contactId}`,
      contactAvatar: `/placeholder.svg?height=40&width=40&text=${contactId}`,
      type,
      status: "outgoing",
      startTime: new Date().toISOString(),
    });

    useCallsStore.setState({
      activeCall: call,
      calls: [...this.store.calls, call],
      callHistory: [...this.store.callHistory, call],
    });

    return call;
  }

  endCall(callId: string, duration: number): void {
    const call = this.store.calls.find((c) => c.id === callId);
    if (call) {
      const endedCall = call.end(new Date().toISOString(), duration);
      useCallsStore.setState({
        activeCall: null,
        calls: this.store.calls.map((c) =>
          c.id === callId ? endedCall : c
        ),
        callHistory: this.store.callHistory.map((c) =>
          c.id === callId ? endedCall : c
        ),
      });
    }
  }

  answerCall(callId: string): void {
    const call = this.store.calls.find((c) => c.id === callId);
    if (call) {
      const answeredCall = call.answer();
      useCallsStore.setState({
        activeCall: answeredCall,
        incomingCall: null,
        calls: this.store.calls.map((c) =>
          c.id === callId ? answeredCall : c
        ),
        callHistory: this.store.callHistory.map((c) =>
          c.id === callId ? answeredCall : c
        ),
      });
    }
  }

  declineCall(callId: string): void {
    const call = this.store.calls.find((c) => c.id === callId);
    if (call) {
      const missedCall = call.markAsMissed();
      useCallsStore.setState({
        incomingCall: null,
        calls: this.store.calls.map((c) =>
          c.id === callId ? missedCall : c
        ),
        callHistory: this.store.callHistory.map((c) =>
          c.id === callId ? missedCall : c
        ),
      });
    }
  }

  getCallById(callId: string): Call | null {
    return this.store.calls.find((c) => c.id === callId) || null;
  }

  getCallsForContact(contactId: string): Call[] {
    return this.store.calls.filter((c) => c.contactId === contactId);
  }

  getMissedCalls(): Call[] {
    return this.store.calls.filter((c) => c.status === "missed");
  }

  getRecentCalls(limit: number = 50): Call[] {
    return this.store.callHistory
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
      .slice(0, limit);
  }

  getCallStats(): {
    total: number;
    missed: number;
    answered: number;
    totalDuration: number;
    averageDuration: number;
  } {
    const calls = this.store.calls;
    const total = calls.length;
    const missed = calls.filter((c) => c.status === "missed").length;
    const answered = calls.filter(
      (c) => c.status === "answered" || c.status === "ended"
    ).length;
    const totalDuration = calls.reduce(
      (sum, c) => sum + (c.duration || 0),
      0
    );
    const averageDuration = answered > 0 ? totalDuration / answered : 0;

    return {
      total,
      missed,
      answered,
      totalDuration,
      averageDuration,
    };
  }
}

// 创建单例实例
let callsServiceInstance: CallsService | null = null;

export const getCallsService = (): ICallsService => {
  if (!callsServiceInstance) {
    callsServiceInstance = new CallsService();
  }
  return callsServiceInstance;
};

