import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "../lib/socket";
import { useAuth } from "../store/AuthContext";

/**
 * Custom React hook to establish, manage, and expose Socket.io connection state.
 * Automatically reconnects when token refreshes, and handles event listener cleanups on unmount.
 * 
 * @returns {{ socket: Socket | null, isConnected: boolean }} - Socket instance and connection status
 */
export function useRealtime() {
  const { accessToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // If user is not authenticated or access token is missing, do not attempt connection
    if (!accessToken) {
      console.log("🔌 [useRealtime] Missing access token, skipping socket connection.");
      setIsConnected(false);
      setSocket(null);
      return;
    }

    // Get (or initialize) singleton socket instance
    const socketInstance = getSocket(accessToken);
    setSocket(socketInstance);

    // Initial connection state
    setIsConnected(socketInstance.connected);

    // Connect automatically if disconnected
    if (!socketInstance.connected) {
      console.log("🔌 [useRealtime] Socket disconnected, initiating connection...");
      socketInstance.connect();
    }

    const handleConnect = () => {
      console.log("🔌 [useRealtime] Realtime socket connected successfully. ID:", socketInstance.id);
      setIsConnected(true);
    };

    const handleDisconnect = (reason: string) => {
      console.log("🔌 [useRealtime] Realtime socket disconnected. Reason:", reason);
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error("🔌 [useRealtime] Socket connection handshake error:", error.message || error);
      setIsConnected(false);
    };

    // Attach listeners
    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("connect_error", handleConnectError);

    // If socket is already connected when hook mounts
    if (socketInstance.connected) {
      setIsConnected(true);
    }

    // Clean up event listeners on unmount
    return () => {
      console.log("🔌 [useRealtime] Cleaning up socket connection event listeners...");
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("connect_error", handleConnectError);
    };
  }, [accessToken]);

  return { socket, isConnected };
}
