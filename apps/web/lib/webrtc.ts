"use client"

import { getWebSocketManager } from "./websocket"

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

class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private wsManager = getWebSocketManager()
  private listeners: Map<string, Function[]> = new Map()
  private simulatedMode = true // 使用模拟模式避免实际 WebRTC 复杂性
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

  constructor() {
    this.setupWebSocketListeners()
  }

  private setupWebSocketListeners() {
    this.wsManager.on("call_offer", this.handleCallOffer.bind(this))
    this.wsManager.on("call_answer", this.handleCallAnswer.bind(this))
    this.wsManager.on("call_ice_candidate", this.handleIceCandidate.bind(this))
    this.wsManager.on("call_end", this.handleCallEnd.bind(this))
  }

  private async createPeerConnection() {
    if (this.simulatedMode) {
      // 在模拟模式下不创建真实的 PeerConnection
      return
    }

    try {
      const configuration: RTCConfiguration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
      }

      this.peerConnection = new RTCPeerConnection(configuration)

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.wsManager.send({
            type: "call_ice_candidate",
            to: this.callState.contactId,
            data: event.candidate,
          })
        }
      }

      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0]
        this.emit("remoteStream", this.remoteStream)
      }

      this.peerConnection.onconnectionstatechange = () => {
        console.log("连接状态:", this.peerConnection?.connectionState)
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
        // 模拟获取媒体流
        this.localStream = await this.getUserMedia(callType === "video")
        this.emit("localStream", this.localStream)

        // 模拟呼叫过程
        setTimeout(
          () => {
            this.updateCallState({ status: "connected" })
            this.startDurationTimer()

            // 模拟远程流
            if (callType === "video") {
              this.remoteStream = this.createSimulatedStream(true)
              this.emit("remoteStream", this.remoteStream)
            }
          },
          2000 + Math.random() * 3000,
        )
      } else {
        this.localStream = await this.getUserMedia(callType === "video")
        this.emit("localStream", this.localStream)

        await this.createPeerConnection()

        // 添加本地流到连接
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection!.addTrack(track, this.localStream!)
        })

        // 创建 offer
        const offer = await this.peerConnection!.createOffer()
        await this.peerConnection!.setLocalDescription(offer)

        // 发送 offer 给对方
        this.wsManager.send({
          type: "call_offer",
          to: contactId,
          data: {
            offer,
            callType,
            callerName: "Me",
            callerAvatar: "/placeholder.svg?height=40&width=40&text=我",
          },
        })
      }
    } catch (error) {
      console.error("发起通话失败:", error)
      this.endCall()
      throw error
    }
  }

  private async handleCallOffer(message: any) {
    try {
      const { offer, callType, callerName, callerAvatar } = message.data

      this.updateCallState({
        isActive: true,
        isIncoming: true,
        contactId: message.from,
        contactName: callerName,
        contactAvatar: callerAvatar,
        callType,
        status: "ringing",
        isVideoOff: callType === "voice",
      })

      if (!this.simulatedMode) {
        await this.createPeerConnection()
        await this.peerConnection!.setRemoteDescription(offer)
      }

      this.emit("incomingCall", this.callState)
    } catch (error) {
      console.error("处理来电失败:", error)
      this.endCall()
    }
  }

  public async answerCall() {
    try {
      if (!this.callState.isIncoming) {
        throw new Error("没有来电可接听")
      }

      if (this.simulatedMode) {
        // 模拟接听过程
        this.localStream = await this.getUserMedia(this.callState.callType === "video")
        this.emit("localStream", this.localStream)

        this.updateCallState({ status: "connected", isIncoming: false })
        this.startDurationTimer()

        // 模拟远程流
        if (this.callState.callType === "video") {
          this.remoteStream = this.createSimulatedStream(true)
          this.emit("remoteStream", this.remoteStream)
        }
      } else {
        if (!this.peerConnection) {
          throw new Error("通话连接未建立")
        }

        this.localStream = await this.getUserMedia(this.callState.callType === "video")
        this.emit("localStream", this.localStream)

        // 添加本地流到连接
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection!.addTrack(track, this.localStream!)
        })

        // 创建 answer
        const answer = await this.peerConnection!.createAnswer()
        await this.peerConnection!.setLocalDescription(answer)

        // 发送 answer 给对方
        this.wsManager.send({
          type: "call_answer",
          to: this.callState.contactId,
          data: answer,
        })

        this.updateCallState({ status: "connected", isIncoming: false })
      }
    } catch (error) {
      console.error("接听通话失败:", error)
      this.endCall()
      throw error
    }
  }

  private async handleCallAnswer(message: any) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(message.data)
        this.updateCallState({ status: "connected" })
        this.startDurationTimer()
      }
    } catch (error) {
      console.error("处理通话应答失败:", error)
      this.endCall()
    }
  }

  private async handleIceCandidate(message: any) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(message.data)
      }
    } catch (error) {
      console.error("处理 ICE 候选失败:", error)
    }
  }

  private handleCallEnd(message: any) {
    this.endCall()
  }

  public endCall() {
    // 通知对方结束通话
    if (this.callState.isActive && this.callState.contactId) {
      this.wsManager.send({
        type: "call_end",
        to: this.callState.contactId,
        data: {},
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
