"use client";

import { useState, useRef, useEffect } from "react";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  UserPlus,
  Users,
  MoreVertical,
  Minimize2,
  Grid3X3,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CallState, CallParticipant } from "../types";

interface GroupCallInterfaceProps {
  callState: CallState;
  localStream: MediaStream | null;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onInviteParticipant: () => void;
  onRemoveParticipant: (participantId: string) => void;
  onToggleParticipantMute: (participantId: string) => void;
  onMinimize?: () => void;
  formatDuration: (seconds: number) => string;
}

type ViewMode = "grid" | "speaker";

export function GroupCallInterface({
  callState,
  localStream,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onInviteParticipant,
  onRemoveParticipant,
  onToggleParticipantMute,
  onMinimize,
  formatDuration,
}: GroupCallInterfaceProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showParticipants, setShowParticipants] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const getStatusText = () => {
    switch (callState.status) {
      case "connecting":
        return "正在连接...";
      case "connected":
        return formatDuration(callState.duration);
      case "ended":
        return "通话已结束";
      default:
        return "";
    }
  };

  const activeParticipants = (callState.participants || []).filter(
    (p) => p.joinedAt > 0
  );
  const speakingParticipant = (callState.participants || []).find(
    (p) => p.isSpeaking
  );

  const renderParticipantVideo = (
    participant: CallParticipant,
    isMain = false
  ) => (
    <div
      key={participant.id}
      className={`relative bg-gray-800 rounded-lg overflow-hidden ${
        isMain ? "col-span-2 row-span-2" : ""
      } ${participant.isSpeaking ? "ring-2 ring-green-500" : ""}`}
    >
      {/* 视频区域 */}
      <div className="w-full h-full flex items-center justify-center">
        {callState.callType === "video" && !participant.isVideoOff ? (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <span className="text-white text-sm">📹 {participant.name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Avatar className={`${isMain ? "h-20 w-20" : "h-12 w-12"} mb-2`}>
              <AvatarImage src={participant.avatar || "/placeholder.svg"} />
              <AvatarFallback className={isMain ? "text-2xl" : "text-lg"}>
                {participant.name[0]}
              </AvatarFallback>
            </Avatar>
            <p
              className={`text-white font-medium ${isMain ? "text-lg" : "text-sm"}`}
            >
              {participant.name}
            </p>
          </div>
        )}
      </div>

      {/* 参与者状态 */}
      <div className="absolute top-2 left-2 flex items-center gap-1">
        {participant.isHost && (
          <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
            主持人
          </Badge>
        )}
        {participant.isSpeaking && (
          <Badge
            variant="secondary"
            className="text-xs bg-green-600 text-white animate-pulse"
          >
            正在说话
          </Badge>
        )}
      </div>

      {/* 静音状态 */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1">
        <span className="text-white text-sm font-medium">
          {participant.name}
        </span>
        {participant.isMuted && (
          <div className="bg-red-600 rounded-full p-1">
            <MicOff className="h-3 w-3 text-white" />
          </div>
        )}
        {participant.isVideoOff && callState.callType === "video" && (
          <div className="bg-gray-600 rounded-full p-1">
            <VideoOff className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* 参与者控制菜单 */}
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-gray-700"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onToggleParticipantMute(participant.id)}
            >
              {participant.isMuted ? "取消静音" : "静音"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onRemoveParticipant(participant.id)}
              className="text-red-600"
            >
              移除参与者
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const renderLocalVideo = () => (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden">
      {callState.callType === "video" && !callState.isVideoOff ? (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <Avatar className="h-12 w-12 mb-2">
            <AvatarImage src="/placeholder.svg?height=48&width=48&text=我" />
            <AvatarFallback>我</AvatarFallback>
          </Avatar>
          <p className="text-white font-medium text-sm">我</p>
        </div>
      )}

      {/* 本地状态指示 */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1">
        <span className="text-white text-sm font-medium">我</span>
        {callState.isMuted && (
          <div className="bg-red-600 rounded-full p-1">
            <MicOff className="h-3 w-3 text-white" />
          </div>
        )}
        {callState.isVideoOff && callState.callType === "video" && (
          <div className="bg-gray-600 rounded-full p-1">
            <VideoOff className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* 头部信息 */}
      <div className="flex items-center justify-between p-4 text-white bg-gray-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
            <AvatarFallback>{callState.contactName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{callState.contactName}</h3>
            <p className="text-sm text-gray-300">
              {getStatusText()} • {activeParticipants.length + 1} 人参与
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setViewMode(viewMode === "grid" ? "speaker" : "grid")
            }
            className="text-white hover:bg-gray-700"
          >
            {viewMode === "grid" ? (
              <User className="h-5 w-5" />
            ) : (
              <Grid3X3 className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-white hover:bg-gray-700"
          >
            <Users className="h-5 w-5" />
          </Button>
          {onMinimize && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMinimize}
              className="text-white hover:bg-gray-700"
            >
              <Minimize2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* 主视频区域 */}
        <div className="flex-1 p-4">
          {viewMode === "speaker" && speakingParticipant ? (
            /* 演讲者模式 */
            <div className="h-full">
              <div className="h-4/5 mb-4">
                {renderParticipantVideo(speakingParticipant, true)}
              </div>
              <div className="h-1/5 flex gap-2 overflow-x-auto">
                {renderLocalVideo()}
                {activeParticipants
                  .filter((p) => p.id !== speakingParticipant.id)
                  .map((participant) => renderParticipantVideo(participant))}
              </div>
            </div>
          ) : (
            /* 网格模式 */
            <div
              className={`grid gap-4 h-full ${
                activeParticipants.length + 1 <= 2
                  ? "grid-cols-2"
                  : activeParticipants.length + 1 <= 4
                    ? "grid-cols-2 grid-rows-2"
                    : activeParticipants.length + 1 <= 6
                      ? "grid-cols-3 grid-rows-2"
                      : "grid-cols-4 grid-rows-2"
              }`}
            >
              {renderLocalVideo()}
              {activeParticipants.map((participant) =>
                renderParticipantVideo(participant)
              )}
            </div>
          )}
        </div>

        {/* 参与者侧边栏 */}
        {showParticipants && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">
                  参与者 ({activeParticipants.length + 1})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onInviteParticipant}
                  className="text-white hover:bg-gray-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  邀请
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {/* 本人 */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-700">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg?height=40&width=40&text=我" />
                    <AvatarFallback>我</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-medium">我</p>
                    <p className="text-gray-400 text-sm">主持人</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {callState.isMuted && (
                      <MicOff className="h-4 w-4 text-red-400" />
                    )}
                    {callState.isVideoOff && callState.callType === "video" && (
                      <VideoOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* 其他参与者 */}
                {activeParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={participant.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">
                          {participant.name}
                        </p>
                        {participant.isSpeaking && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-600 text-white"
                          >
                            说话中
                          </Badge>
                        )}
                      </div>
                      {participant.isHost && (
                        <p className="text-blue-400 text-sm">主持人</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {participant.isMuted && (
                        <MicOff className="h-4 w-4 text-red-400" />
                      )}
                      {participant.isVideoOff &&
                        callState.callType === "video" && (
                          <VideoOff className="h-4 w-4 text-gray-400" />
                        )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:bg-gray-600"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              onToggleParticipantMute(participant.id)
                            }
                          >
                            {participant.isMuted ? "取消静音" : "静音"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onRemoveParticipant(participant.id)}
                            className="text-red-600"
                          >
                            移除参与者
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      <div className="p-6 bg-gray-800">
        <div className="flex items-center justify-center gap-6">
          {/* 静音按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-14 w-14 rounded-full ${
              callState.isMuted
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-700 hover:bg-gray-600"
            } text-white`}
            onClick={onToggleMute}
          >
            {callState.isMuted ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>

          {/* 扬声器按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-14 w-14 rounded-full ${
              callState.isSpeakerOn
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-700 hover:bg-gray-600"
            } text-white`}
            onClick={onToggleSpeaker}
          >
            {callState.isSpeakerOn ? (
              <Volume2 className="h-6 w-6" />
            ) : (
              <VolumeX className="h-6 w-6" />
            )}
          </Button>

          {/* 视频按钮 */}
          {callState.callType === "video" && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-14 w-14 rounded-full ${
                callState.isVideoOff
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-700 hover:bg-gray-600"
              } text-white`}
              onClick={onToggleVideo}
            >
              {callState.isVideoOff ? (
                <VideoOff className="h-6 w-6" />
              ) : (
                <Video className="h-6 w-6" />
              )}
            </Button>
          )}

          {/* 邀请按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            onClick={onInviteParticipant}
          >
            <UserPlus className="h-6 w-6" />
          </Button>

          {/* 挂断按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white"
            onClick={onEndCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
