"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/src/presentation/components/ui/button";
import { MicOff, VideoOff, PhoneOff, Maximize2, Volume2 } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import type { CallState } from "../../../hooks/use-call";

interface CallMiniWindowProps {
  callState: CallState;
  localStream?: MediaStream | null;
  onEndCall: () => void;
  onMaximize: () => void;
  formatDuration: (seconds: number) => string;
}

export function CallMiniWindow({
  callState,
  localStream,
  onEndCall,
  onMaximize,
  formatDuration,
}: CallMiniWindowProps) {
  const [position, setPosition] = useState({
    x: window.innerWidth - 320,
    y: 100,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Set up local video stream
  useEffect(() => {
    if (videoRef.current && localStream && callState.callType === "video") {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, callState.callType]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.target === windowRef.current ||
      (e.target as Element).closest(".drag-handle")
    ) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(
          0,
          Math.min(window.innerWidth - 300, e.clientX - dragOffset.x)
        );
        const newY = Math.max(
          0,
          Math.min(window.innerHeight - 200, e.clientY - dragOffset.y)
        );
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={windowRef}
      className={cn(
        "fixed z-50 bg-black/90 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 overflow-hidden transition-transform duration-200",
        isDragging ? "scale-105" : "scale-100"
      )}
      style={{
        left: position.x,
        top: position.y,
        width: 300,
        height: 200,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Video/Avatar Area */}
      <div className="relative h-32 bg-gray-900">
        {callState.callType === "video" && !callState.isVideoOff ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={callState.contactAvatar || "/placeholder.svg"}
              alt={callState.contactName}
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
        )}

        {/* Drag Handle */}
        <div className="drag-handle absolute inset-0" />

        {/* Status Indicators */}
        <div className="absolute top-2 left-2 flex space-x-1">
          {callState.isMuted && (
            <div className="bg-red-500 rounded-full p-1">
              <MicOff className="h-3 w-3 text-white" />
            </div>
          )}
          {callState.isVideoOff && callState.callType === "video" && (
            <div className="bg-red-500 rounded-full p-1">
              <VideoOff className="h-3 w-3 text-white" />
            </div>
          )}
          {callState.isSpeakerOn && (
            <div className="bg-blue-500 rounded-full p-1">
              <Volume2 className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Call Info and Controls */}
      <div className="p-3 bg-black/80">
        <div className="text-white text-sm mb-2">
          <p className="font-medium truncate">{callState.contactName}</p>
          <p className="text-xs text-gray-300">
            {formatDuration(callState.duration)}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
            onClick={onMaximize}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="p-2"
            onClick={onEndCall}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
