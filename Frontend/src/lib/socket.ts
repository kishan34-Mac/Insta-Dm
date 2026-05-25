import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../api/http";

// Dynamic socket URL resolution: Strips '/api/v1' from the end of the http API base URL
const SOCKET_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

console.log("🔌 [SocketClient] Inferred Socket.io server URL:", SOCKET_URL);

let socket: Socket | null = null;

/**
 * Lazily initialize and retrieve the authenticated Socket.io-client connection.
 * @param token - JWT access token
 * @returns {Socket} - Socket.io client instance
 */
export const getSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  } else {
    // If the socket exists but the token changed, refresh auth properties
    socket.auth = { token };
  }
  
  return socket;
};

/**
 * Disconnect the active Socket.io instance if one exists.
 */
export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 [SocketClient] Disconnecting Socket.io connection...");
    socket.disconnect();
    socket = null;
  }
};
