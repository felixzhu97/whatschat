"use client"

import { getWebSocketManager } from "@/src/infrastructure/adapters/websocket"
import { API_CONFIG } from "@/src/infrastructure/config/api.config"

export interface RTCCallState {
  isActive: boolean
  isIncoming: boolean
  contactId: string
  contactName: string
  contactAvatar: string
  callType: "voice" | "video"
  status: "calling" | "ringing" | "connected" | "ended"
  duration: number
  isMuted: boolean
  isVideoOff: boolean
  isSpeakerOn: boolean
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return (
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token") ||
    null
  )
}

function getCurrentUserId(): string | null {
  const token = getAuthToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || "{}"))
    return payload.userId ?? payload.sub ?? null
  } catch {
    return null
  }
}

class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private wsManager = getWebSocketManager()
  private listeners: Map<string, Function[]> = new Map()
  private callState: RTCCallState = {
    isActive: false,
    isIncoming: false,
    contactId: "",
    contactName: "",
    contactAvatar: "",
    callType: "voice",
    status: "ended",
    duration: 0,
    isMuted: false,
    isVideoOff: false,
    isSpeakerOn: false,
  }
  private durationTimer: NodeJS.Timeout | null = null
  /** Server call id and initiator (for signaling). */
  private currentCallId: string | null = null
  private currentInitiatorId: string | null = null
  /** ICE candidates received before remote description is set; applied after setRemoteDescription. */
  private pendingIceCandidates: RTCIceCandidateInit[] = []

  constructor() {
    this.setupWebSocketListeners()
  }

  private setupWebSocketListeners() {
    this.wsManager.on("call:incoming", this.handleCallIncoming.bind(this))
    this.wsManager.on("call:answer", this.handleCallAnswerServer.bind(this))
    this.wsManager.on("call:offer", this.handleCallOfferServer.bind(this))
    this.wsManager.on("call:webrtc-answer", this.handleWebRTCAnswerServer.bind(this))
    this.wsManager.on("call:ice-candidate", this.handleIceCandidateServer.bind(this))
    this.wsManager.on("call:end", this.handleCallEndServer.bind(this))
  }

  private async apiFetch(path: string, options: RequestInit = {}) {
    const token = getAuthToken()
    const res = await fetch(`${API_CONFIG.baseURL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
    return res.json().catch(() => ({}))
  }

  /** Other party's userId for ICE/signaling (caller: contactId, callee: initiatorId). */
  private targetUserIdForSignaling(): string {
    if (this.callState.isIncoming && this.currentInitiatorId) return this.currentInitiatorId
    return this.callState.contactId
  }

  private async createPeerConnection() {
    try {
      const configuration: RTCConfiguration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      }
      this.peerConnection = new RTCPeerConnection(configuration)
      const callId = this.currentCallId
      const targetUserId = this.targetUserIdForSignaling()

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && callId) {
          this.wsManager.send({
            type: "call:ice-candidate",
            data: { callId, targetUserId, candidate: event.candidate },
          })
        }
      }

      this.peerConnection.ontrack = (event) => {
        const stream = event.streams?.[0] ?? (() => {
          const s = new MediaStream()
          if (event.track) s.addTrack(event.track)
          return s
        })()
        const tracks = stream.getTracks()
        console.log("[WebRTC] ontrack", { streamsLen: event.streams?.length, trackKind: event.track?.kind, tracksInStream: tracks.length })
        if (tracks.length) {
          this.remoteStream = stream
          this.emit("remoteStream", this.remoteStream)
        }
      }

      this.peerConnection.onconnectionstatechange = () => {
        const connState = this.peerConnection?.connectionState
        console.log("[WebRTC] connectionstatechange", connState)
        if (connState === "connected") {
          this.updateCallState({ status: "connected" })
          this.startDurationTimer()
        } else if (connState === "disconnected" || connState === "failed") {
          this.endCall()
        }
      }
    } catch (error) {
      console.error("创建 PeerConnection 失败:", error)
      throw new Error("无法创建通话连接")
    }
  }

  private async getUserMedia(video = false): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: video ? { width: 640, height: 480 } : false,
      }

      return await navigator.mediaDevices.getUserMedia(constraints)
    } catch (error) {
      console.error("获取媒体设备失败:", error)
      throw new Error("无法访问摄像头或麦克风，请检查权限设置")
    }
  }

  public async startCall(
    contactId: string,
    contactName: string,
    contactAvatar: string,
    callType: "voice" | "video",
    options?: { chatId?: string }
  ) {
    try {
      this.updateCallState({
        isActive: true,
        isIncoming: false,
        contactId,
        contactName,
        contactAvatar,
        callType,
        status: "calling",
        isVideoOff: callType === "voice",
      })

      const apiType = callType === "video" ? "VIDEO" : "AUDIO"
      const body: { type: string; targetUserId?: string; chatId?: string } = { type: apiType }
      if (options?.chatId) {
        body.chatId = options.chatId
      } else {
        body.targetUserId = contactId
      }
      const created = await this.apiFetch("/calls", {
        method: "POST",
        body: JSON.stringify(body),
      })
      const callData = created?.data
      const callId = callData?.id
      if (!callId) throw new Error("Failed to create call")
      const myId = getCurrentUserId()
      const targetUserId =
        callData?.participants?.find((p: { userId: string }) => p.userId !== myId)?.userId ?? contactId
      this.currentCallId = callId
      this.currentInitiatorId = myId
      this.updateCallState({ contactId: targetUserId })

      this.wsManager.send({
        type: "call:incoming",
        data: {
          targetUserId,
          callId,
          type: callType,
          callerName: contactName,
          callerAvatar: contactAvatar,
        },
      })

      this.localStream = await this.getUserMedia(callType === "video")
      this.emit("localStream", this.localStream)
    } catch (error) {
      console.error("发起通话失败:", error)
      this.endCall()
      throw error
    }
  }

  private async handleCallIncoming(message: { data: any }) {
    const d = message.data || message
    const initiatorId = d.initiatorId
    const callId = d.callId
    const callType = (d.type || "voice") as "voice" | "video"
    console.log("[WebRTC] handleCallIncoming", { callId, initiatorId, callType })
    this.currentCallId = callId
    this.currentInitiatorId = initiatorId
    this.updateCallState({
      isActive: true,
      isIncoming: true,
      contactId: initiatorId,
      contactName: d.callerName ?? "Unknown",
      contactAvatar: d.callerAvatar ?? "",
      callType,
      status: "ringing",
      isVideoOff: callType === "voice",
    })
    this.emit("incomingCall", this.callState)
  }

  private async handleCallAnswerServer(message: { data: any }) {
    const d = message.data || message
    if (d.callId !== this.currentCallId || !this.callState.isActive || this.callState.isIncoming) return
    try {
      await this.createPeerConnection()
      if (!this.peerConnection || !this.localStream) return
      this.localStream.getTracks().forEach((t) => this.peerConnection!.addTrack(t, this.localStream!))
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      this.wsManager.send({
        type: "call:offer",
        data: {
          callId: this.currentCallId,
          targetUserId: this.callState.contactId,
          offer,
        },
      })
    } catch (err) {
      console.error("handleCallAnswerServer", err)
      this.endCall()
    }
  }

  /** Normalize SDP object to { type, sdp } (handles _type/_sdp from react-native-webrtc). */
  private normalizeSdp(desc: any): RTCSessionDescriptionInit | null {
    if (!desc || (desc.type == null && desc.sdp == null && desc._type == null && desc._sdp == null))
      return null
    const type = desc.type ?? desc._type ?? "offer"
    const sdp = typeof (desc.sdp ?? desc._sdp) === "string" ? desc.sdp ?? desc._sdp : ""
    return { type, sdp }
  }

  private async handleCallOfferServer(message: { data: any }) {
    const d = message.data || message
    console.log("[WebRTC] handleCallOfferServer received", {
      callId: d.callId,
      currentCallId: this.currentCallId,
      isIncoming: this.callState.isIncoming,
      hasOffer: !!d.offer,
      offerType: d.offer?.type ?? d.offer?._type,
      offerSdpLen: typeof d.offer?.sdp === "string" ? d.offer.sdp.length : (typeof d.offer?._sdp === "string" ? d.offer._sdp.length : 0),
    })
    if (d.callId !== this.currentCallId || !this.callState.isIncoming) {
      console.log("[WebRTC] handleCallOfferServer skip: callId or isIncoming mismatch")
      return
    }
    const offerInit = this.normalizeSdp(d.offer)
    if (!offerInit || offerInit.type !== "offer" || typeof offerInit.sdp !== "string" || !offerInit.sdp) {
      console.warn("[WebRTC] handleCallOfferServer invalid offer", { offerInit, need: "type=offer and non-empty sdp" })
      return
    }
    try {
      const pc = this.peerConnection
      const alreadyHaveOffer =
        pc &&
        (pc.signalingState === "have-remote-offer" || pc.signalingState === "have-local-pranswer")
      if (alreadyHaveOffer) {
        console.log("[WebRTC] handleCallOfferServer skip: alreadyHaveOffer, state=", pc?.signalingState)
        return
      }

      if (pc) {
        pc.close()
        this.peerConnection = null
        this.pendingIceCandidates = []
      }
      await this.createPeerConnection()
      if (!this.localStream) {
        this.localStream = await this.getUserMedia(this.callState.callType === "video")
        this.emit("localStream", this.localStream)
      }
      this.localStream.getTracks().forEach((t) => this.peerConnection!.addTrack(t, this.localStream!))
      console.log("[WebRTC] handleCallOfferServer setRemoteDescription(offer)", { sdpLen: offerInit.sdp.length })
      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offerInit))
      const stateAfterSet = this.peerConnection!.signalingState
      const hasRemoteDesc = !!this.peerConnection!.remoteDescription
      console.log("[WebRTC] handleCallOfferServer after setRemoteDescription", { stateAfterSet, hasRemoteDesc })
      if (stateAfterSet !== "have-remote-offer" && stateAfterSet !== "have-local-pranswer") {
        console.warn("[WebRTC] handleCallOfferServer skip createAnswer: state is", stateAfterSet)
        return
      }
      if (!hasRemoteDesc) {
        console.warn("[WebRTC] handleCallOfferServer skip: no remoteDescription")
        return
      }
      await this.drainPendingIceCandidates()
      const answer = await this.peerConnection!.createAnswer()
      await this.peerConnection!.setLocalDescription(answer)
      this.wsManager.send({
        type: "call:webrtc-answer",
        data: {
          callId: this.currentCallId,
          targetUserId: d.userId ?? this.currentInitiatorId,
          answer,
        },
      })
      console.log("[WebRTC] handleCallOfferServer sent answer ok")
      this.updateCallState({ status: "connected", isIncoming: false })
      this.startDurationTimer()
    } catch (err) {
      console.error("[WebRTC] handleCallOfferServer error", err)
      this.endCall()
    }
  }

  private async handleWebRTCAnswerServer(message: { data: any }) {
    const d = message.data || message
    const stateBefore = this.peerConnection?.signalingState
    console.log("[WebRTC] handleWebRTCAnswerServer received", {
      callId: d.callId,
      currentCallId: this.currentCallId,
      stateBefore,
      hasAnswer: !!d.answer,
    })
    if (d.callId !== this.currentCallId) return
    const answerInit = this.normalizeSdp(d.answer)
    if (!answerInit) {
      console.warn("[WebRTC] handleWebRTCAnswerServer invalid answer", d.answer)
      return
    }
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerInit))
        console.log("[WebRTC] handleWebRTCAnswerServer setRemoteDescription ok", { stateAfter: this.peerConnection.signalingState })
        await this.drainPendingIceCandidates()
        this.updateCallState({ status: "connected" })
        this.startDurationTimer()
      }
    } catch (err) {
      console.error("[WebRTC] handleWebRTCAnswerServer error", err)
      this.endCall()
    }
  }

  private async handleIceCandidateServer(message: { data: any }) {
    const d = message.data || message
    if (d.callId !== this.currentCallId || !this.peerConnection) return
    if (!d.candidate) return
    try {
      if (!this.peerConnection.remoteDescription) {
        this.pendingIceCandidates.push(d.candidate)
        return
      }
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(d.candidate))
    } catch (err) {
      console.error("handleIceCandidateServer", err)
    }
  }

  private async drainPendingIceCandidates() {
    if (!this.peerConnection) return
    for (const c of this.pendingIceCandidates) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(c))
      } catch (e) {
        console.warn("drainPendingIceCandidates", e)
      }
    }
    this.pendingIceCandidates = []
  }

  private handleCallEndServer() {
    this.endCall()
  }

  public async answerCall() {
    try {
      if (!this.callState.isIncoming) throw new Error("没有来电可接听")
      if (!this.currentCallId) throw new Error("Call id missing")
      await this.apiFetch(`/calls/${this.currentCallId}/answer`, { method: "PUT" })
      this.wsManager.send({
        type: "call:answer",
        data: { callId: this.currentCallId, initiatorId: this.currentInitiatorId },
      })
      this.localStream = await this.getUserMedia(this.callState.callType === "video")
      this.emit("localStream", this.localStream)
      await this.createPeerConnection()
      if (this.peerConnection && this.localStream) {
        this.localStream.getTracks().forEach((t) => this.peerConnection!.addTrack(t, this.localStream!))
      }
      this.updateCallState({ status: "calling", isIncoming: false })
    } catch (error) {
      console.error("接听通话失败:", error)
      this.endCall()
      throw error
    }
  }

  public endCall() {
    if (this.currentCallId) {
      const me = getCurrentUserId()
      const participants =
        me && this.currentInitiatorId
          ? this.callState.isIncoming
            ? [this.currentInitiatorId, me]
            : [me, this.callState.contactId]
          : [this.callState.contactId]
      this.apiFetch(`/calls/${this.currentCallId}/end`, { method: "PUT" }).catch(() => {})
      this.wsManager.send({
        type: "call:end",
        data: { callId: this.currentCallId, participants },
      })
    }

    // 停止计时器
    if (this.durationTimer) {
      clearInterval(this.durationTimer)
      this.durationTimer = null
    }

    // 关闭媒体流
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop())
      this.remoteStream = null
    }

    // 关闭 peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
    this.pendingIceCandidates = []

    this.currentCallId = null
    this.currentInitiatorId = null
    this.updateCallState({
      isActive: false,
      status: "ended",
      duration: 0,
    })

    this.emit("callEnded", null)
  }

  public toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = this.callState.isMuted
        this.updateCallState({ isMuted: !this.callState.isMuted })
      }
    }
  }

  public toggleVideo() {
    if (this.localStream && this.callState.callType === "video") {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = this.callState.isVideoOff
        this.updateCallState({ isVideoOff: !this.callState.isVideoOff })
      }
    }
  }

  public toggleSpeaker() {
    this.updateCallState({ isSpeakerOn: !this.callState.isSpeakerOn })
  }

  private startDurationTimer() {
    this.durationTimer = setInterval(() => {
      this.updateCallState({ duration: this.callState.duration + 1 })
    }, 1000)
  }

  private updateCallState(updates: Partial<RTCCallState>) {
    this.callState = { ...this.callState, ...updates }
    this.emit("callStateChanged", this.callState)
  }

  public getCallState(): RTCCallState {
    return { ...this.callState }
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream
  }

  public getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  public off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }

}

// 单例模式
let rtcManager: WebRTCManager | null = null

export const getWebRTCManager = () => {
  if (!rtcManager) {
    rtcManager = new WebRTCManager()
  }
  return rtcManager
}
