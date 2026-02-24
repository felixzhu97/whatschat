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
  private simulatedMode = true
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
    if (this.simulatedMode) return

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
        this.remoteStream = event.streams[0]
        this.emit("remoteStream", this.remoteStream)
      }

      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection?.connectionState === "connected") {
          this.updateCallState({ status: "connected" })
          this.startDurationTimer()
        } else if (
          this.peerConnection?.connectionState === "disconnected" ||
          this.peerConnection?.connectionState === "failed"
        ) {
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

      if (this.simulatedMode) {
        // 在模拟模式下创建一个虚拟的媒体流
        return this.createSimulatedStream(video)
      }

      throw new Error("无法访问摄像头或麦克风，请检查权限设置")
    }
  }

  private createSimulatedStream(video: boolean): MediaStream {
    // 创建一个模拟的媒体流用于演示
    const canvas = document.createElement("canvas")
    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext("2d")!

    // 绘制一个简单的背景
    ctx.fillStyle = "#2563eb"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"
    ctx.font = "24px Arial"
    ctx.textAlign = "center"
    ctx.fillText("模拟视频流", canvas.width / 2, canvas.height / 2)

    const stream = new MediaStream()

    if (video) {
      // 添加视频轨道
      const videoTrack = canvas.captureStream(30).getVideoTracks()[0]
      stream.addTrack(videoTrack)
    }

    // 创建一个静音的音频轨道
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    gainNode.gain.value = 0 // 静音
    oscillator.connect(gainNode)

    const destination = audioContext.createMediaStreamDestination()
    gainNode.connect(destination)
    oscillator.start()

    const audioTrack = destination.stream.getAudioTracks()[0]
    stream.addTrack(audioTrack)

    return stream
  }

  public async startCall(contactId: string, contactName: string, contactAvatar: string, callType: "voice" | "video") {
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

      if (this.simulatedMode) {
        this.localStream = await this.getUserMedia(callType === "video")
        this.emit("localStream", this.localStream)
        setTimeout(
          () => {
            this.updateCallState({ status: "connected" })
            this.startDurationTimer()
            if (callType === "video") {
              this.remoteStream = this.createSimulatedStream(true)
              this.emit("remoteStream", this.remoteStream)
            }
          },
          2000 + Math.random() * 3000,
        )
        return
      }

      const apiType = callType === "video" ? "VIDEO" : "AUDIO"
      const created = await this.apiFetch("/calls", {
        method: "POST",
        body: JSON.stringify({ type: apiType, targetUserId: contactId }),
      })
      const callId = created?.data?.id
      if (!callId) throw new Error("Failed to create call")
      this.currentCallId = callId
      this.currentInitiatorId = getCurrentUserId()

      this.wsManager.send({
        type: "call:incoming",
        data: {
          targetUserId: contactId,
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

  private async handleCallOfferServer(message: { data: any }) {
    const d = message.data || message
    if (d.callId !== this.currentCallId || !this.callState.isIncoming) return
    try {
      if (!this.peerConnection) await this.createPeerConnection()
      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(d.offer))
      if (!this.localStream) {
        this.localStream = await this.getUserMedia(this.callState.callType === "video")
        this.emit("localStream", this.localStream)
      }
      this.localStream.getTracks().forEach((t) => this.peerConnection!.addTrack(t, this.localStream!))
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
      this.updateCallState({ status: "connected", isIncoming: false })
      this.startDurationTimer()
    } catch (err) {
      console.error("handleCallOfferServer", err)
      this.endCall()
    }
  }

  private async handleWebRTCAnswerServer(message: { data: any }) {
    const d = message.data || message
    if (d.callId !== this.currentCallId) return
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(d.answer))
        this.updateCallState({ status: "connected" })
        this.startDurationTimer()
      }
    } catch (err) {
      console.error("handleWebRTCAnswerServer", err)
      this.endCall()
    }
  }

  private async handleIceCandidateServer(message: { data: any }) {
    const d = message.data || message
    if (d.callId !== this.currentCallId || !this.peerConnection) return
    try {
      if (d.candidate) await this.peerConnection.addIceCandidate(new RTCIceCandidate(d.candidate))
    } catch (err) {
      console.error("handleIceCandidateServer", err)
    }
  }

  private handleCallEndServer() {
    this.endCall()
  }

  public async answerCall() {
    try {
      if (!this.callState.isIncoming) throw new Error("没有来电可接听")

      if (this.simulatedMode) {
        this.localStream = await this.getUserMedia(this.callState.callType === "video")
        this.emit("localStream", this.localStream)
        this.updateCallState({ status: "connected", isIncoming: false })
        this.startDurationTimer()
        if (this.callState.callType === "video") {
          this.remoteStream = this.createSimulatedStream(true)
          this.emit("remoteStream", this.remoteStream)
        }
        return
      }

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
    if (!this.simulatedMode && this.currentCallId) {
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

  public setSimulatedMode(enabled: boolean) {
    this.simulatedMode = enabled
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
