import { io } from "socket.io-client";

let socket;

const socketService = {
  /**
   * Initialize socket connection with JWT auth
   * @param {string} token - User's authorization token
   */
  connect: (token) => {
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000", {
        auth: {
          token
        }
      });

      socket.on("connect", () => {
        console.log("🟢 Connected to Socket.io Server", socket.id);
      });

      socket.on("disconnect", (reason) => {
        console.log("🔴 Disconnected from Socket.io Server:", reason);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket Connection Error:", err.message);
      });
    }
  },

  /**
   * Disconnect and clear socket instance
   */
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Expose underlying socket instance for custom component usages
   * @returns {Socket}
   */
  getSocket: () => socket,

  /**
   * Emit an event
   * @param {string} ev - Event name
   * @param {any} data - Data payload
   */
  emit: (ev, data) => {
    if (socket) {
      socket.emit(ev, data);
    }
  },

  /**
   * Listen for an event
   * @param {string} ev - Event name
   * @param {function} cb - Callback
   */
  on: (ev, cb) => {
    if (socket) {
      socket.on(ev, cb);
    }
  },

  /**
   * Remove listener
   * @param {string} ev - Event name
   */
  off: (ev) => {
    if (socket) {
      socket.off(ev);
    }
  }
};

export default socketService;
