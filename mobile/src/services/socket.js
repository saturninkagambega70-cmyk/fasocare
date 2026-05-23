import { io } from 'socket.io-client';
import { getServerURL } from './api';
import { useAuthStore } from '../store/useAuthStore';

let socket = null;

const getBaseUrl = () => getServerURL().replace('/api/v1', '');

export const connectSocket = (userId) => {
  if (socket?.connected) return socket;

  const baseUrl = getBaseUrl();
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
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const joinChat = (userId) => {
  if (socket?.connected) socket.emit('join', userId);
};

export const onNewMessage = (cb) => {
  if (!socket) return () => {};
  socket.on('new_message', cb);
  return () => { socket?.off('new_message', cb); };
};

export const sendMessageViaSocket = (receiverId, content) => {
  socket?.emit('send', { receiverId, content });
};

export const getSocket = () => socket;
