import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from './apiClient';

let socket: Socket | null = null;

export function getSocket(): Socket {
  const socketUrl = getSocketUrl();
  
  if (!socket) {
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // Enable for production
      forceNew: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Socket.IO connection error:', error.message);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}