import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import config from "@/config";
import logger from "@/utils/logger";

class SocketManager {
  private static instance: SocketManager;
  private io: Server | null = null;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public initialize(server: HttpServer): Server {
    this.io = new Server(server, {
      cors: {
        origin: config.security.cors.origin,
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupEventHandlers();
    return this.io;
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error("Socket.IO not initialized. Call initialize() first.");
    }
    return this.io;
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket) => {
      logger.info(`用户连接: ${socket.id}`);

      socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        logger.info(`用户 ${socket.id} 加入房间 ${roomId}`);
      });

      socket.on("leave-room", (roomId: string) => {
        socket.leave(roomId);
        logger.info(`用户 ${socket.id} 离开房间 ${roomId}`);
      });

      socket.on("disconnect", () => {
        logger.info(`用户断开连接: ${socket.id}`);
      });
    });
  }
}

export default SocketManager;