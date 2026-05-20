import { useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(BASE_URL, { transports: ['websocket', 'polling'] });
  }
  return socket;
}

export function useSocket() {
  const socketRef = useRef<Socket>(getSocket());
  return socketRef.current;
}