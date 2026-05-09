import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.utils.js";
import User from "../models/User.model.js";

let io;

// Map of userId to active socket references
const userSocketMap = new Map();

/**
 * Configure and initialize Socket.io Server logic
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:3000",
      ],
      credentials: true,
    },
  });

  // Socket Auth Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication Error: Token missing"));
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user || !user.isActive) {
        return next(new Error("Authentication Error: Invalid or inactive user"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication Error: Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 User connected: ${userId} (Socket ID: ${socket.id})`);

    // Track online user
    userSocketMap.set(userId, socket.id);
    io.emit("user_online", { userId });

    // Join specific conversation room
    socket.on("join_conversation", ({ conversationId }) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined room ${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave_conversation", ({ conversationId }) => {
      socket.leave(conversationId);
      console.log(`User ${userId} left room ${conversationId}`);
    });

    // Handle typing events inside rooms
    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("typing", { userId, conversationId });
    });

    socket.on("stop_typing", ({ conversationId }) => {
      socket.to(conversationId).emit("stop_typing", { userId, conversationId });
    });

    // The 'send_message' internal routing is usually better handled 
    // strictly via HTTP Post controller, which then calls io.emit.
    // However, if direct websocket message routing is needed, it can go here.

    // Disconnection logic
    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${userId}`);
      userSocketMap.delete(userId);
      io.emit("user_offline", { userId });
    });
  });

  return io;
};

/**
 * Get Socket.io instance globally
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocket first.");
  }
  return io;
};

/**
 * Returns the currently active socket id for a given user id
 */
export const getUserSocketId = (userId) => {
  return userSocketMap.get(userId.toString());
};
