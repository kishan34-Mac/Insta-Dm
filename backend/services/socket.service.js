let io = null;

/**
 * Initialize the Socket.io server instance.
 * @param {import("socket.io").Server} socketIoInstance
 */
export const initSocket = (socketIoInstance) => {
  io = socketIoInstance;
  console.log("✅ Socket.io initialized successfully in SocketService");
};

/**
 * Emit a realtime socket event to a specific user's private room.
 * @param {string} userId - The target user's ID
 * @param {string} eventName - Name of the socket event
 * @param {any} data - Event payload
 */
export const emitToUser = (userId, eventName, data) => {
  if (!io) {
    console.warn(`⚠️ [SocketService] Cannot emit '${eventName}'. Socket.io instance is not initialized.`);
    return;
  }

  const roomName = `user:${userId}`;
  io.to(roomName).emit(eventName, data);
  console.log(`📡 [SocketService] Emitted event '${eventName}' to room '${roomName}'`);
};

export default {
  initSocket,
  emitToUser,
};
