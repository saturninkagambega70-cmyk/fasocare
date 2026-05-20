import { io } from 'socket.io-client';
import { getServerURL } from './api';
import { useAuthStore } from '../store/useAuthStore';

let socket = null;
let refCount = 0;

export const connectSocket = (userId) => {
  refCount++;
  if (socket?.connected) return socket;
  const baseUrl = getServerURL().replace('/api/v1', '');
  if (!baseUrl) {
    if (__DEV__) console.warn('Socket: No server URL configured');
    return null;
  }
  const token = useAuthStore.getState()?.token || '';
  if (__DEV__) console.log(`Socket: connecting to ${baseUrl}/messages`);
  socket = io(`${baseUrl}/messages`, {
    transports: ['websocket'],
    query: { userId, token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 10000,
  });
  socket.on('connect', () => {
    if (__DEV__) console.log('Socket connected');
    socket.emit('join', userId);
  });
  socket.on('connect_error', (err) => {
    if (__DEV__) console.warn('Socket connection error:', err.message);
  });
  socket.on('error', (err) => {
    if (__DEV__) console.warn('Socket error:', err);
  });
  return socket;
};

export const disconnectSocket = () => {
  refCount = Math.max(0, refCount - 1);
  if (refCount > 0) {
    if (__DEV__) console.log(`Socket: ${refCount} references remaining, keeping connection`);
    return;
  }
  if (socket) { socket.removeAllListeners(); socket.disconnect(); socket = null; }
};

export const joinChat = (userId) => {
  if (socket?.connected) socket.emit('join', userId);
};

export const onNewMessage = (cb) => {
  socket?.on('new_message', cb);
  return () => socket?.off('new_message', cb);
};

export const sendMessageViaSocket = (receiverId, content) => {
  socket?.emit('send', { receiverId, content });
};
