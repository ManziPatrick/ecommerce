import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";

export class SocketManager {
  private io: SocketIOServer;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? ["https://ecommerce-nu-rosy.vercel.app"]
            : ["http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.on("connection", (socket: Socket) => {
      console.log("New client connected:", socket.id);

      // Generic Room Joining (Chat, User, Vendor, Admin)
      socket.on("joinRoom", (roomName: string) => {
        socket.join(roomName);
        console.log(`Client ${socket.id} joined room: ${roomName}`);
      });

      // Legacy support for joinChat (used by old frontend components)
      socket.on("joinChat", (chatId: string) => {
        socket.join(`chat:${chatId}`);
        console.log(`Client ${socket.id} joined chat:${chatId} (Legacy)`);
      });

      // Legacy support for joinAdmin
      socket.on("joinAdmin", () => {
        socket.join("admin");
        console.log(`Client ${socket.id} joined admin room (Legacy)`);
      });

      // * This listens when a client makes a call
      socket.on("callOffer", ({ chatId, offer }) => {
        socket
          .to(`chat:${chatId}`)
          .emit("callOffer", { offer, from: socket.id });
        console.log(`Call offer sent for chat:${chatId} from ${socket.id}`);
      });

      // * This listens when a client answers a call
      socket.on("callAnswer", ({ chatId, answer, to }) => {
        socket.to(to).emit("callAnswer", { answer });
        console.log(`Call answer sent to ${to} for chat:${chatId}`);
      });

      socket.on("iceCandidate", ({ chatId, candidate, to }) => {
        console.log("candidate => ", candidate);
        socket.to(to).emit("iceCandidate", { candidate });
        console.log(`ICE candidate sent to ${to} for chat:${chatId}`);
      });

      socket.on("endCall", ({ chatId }) => {
        socket.to(`chat:${chatId}`).emit("callEnded");
        console.log(`Call ended for chat:${chatId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}
