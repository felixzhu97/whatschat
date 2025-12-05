import { Call } from "../../entities/call.entity";

export interface ICallsService {
  startCall(
    contactId: string,
    type: "voice" | "video"
  ): Promise<Call>;
  endCall(callId: string, duration: number): void;
  answerCall(callId: string): void;
  declineCall(callId: string): void;
  getCallById(callId: string): Call | null;
  getCallsForContact(contactId: string): Call[];
  getMissedCalls(): Call[];
  getRecentCalls(limit?: number): Call[];
  getCallStats(): {
    total: number;
    missed: number;
    answered: number;
    totalDuration: number;
    averageDuration: number;
  };
}

