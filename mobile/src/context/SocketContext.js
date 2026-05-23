import React, { createContext, useContext, useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, onNewMessage, sendMessageViaSocket, getSocket } from '../services/socket';
import { useAuthStore } from '../store/useAuthStore';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      socketRef.current = connectSocket(user.id);
      return () => {
        disconnectSocket();
        socketRef.current = null;
      };
    }
  }, [user?.id]);

  const value = {
    sendMessage: (receiverId, content) => sendMessageViaSocket(receiverId, content),
    onNewMessage: (cb) => onNewMessage(cb),
    getSocket: () => socketRef.current || getSocket(),
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
