import { ref } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useCustomToast } from './useCustomToast';

export const useRealtime = () => {
  const { showToast } = useCustomToast();
  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);
  const notifications = ref<any[]>([]);
  const newMessages = ref<any[]>([]);

  const connect = () => {
    if (socket.value?.connected) return;

    // Retrieve token from cookies or localStorage
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return '';
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return '';
    };

    const token = getCookie('accessToken') || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '');
    
    // Connect to the unified 'chat' namespace
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // Ensure we don't have trailing slashes
    const socketUrl = `${baseUrl.replace(/\/+$/, '')}/chat`;
    
    console.log(`Connecting to WebSocket at: ${socketUrl}`);

    socket.value = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.value.on('connect', () => {
      isConnected.value = true;
      console.log('Connected to chat/realtime server');
    });

    socket.value.on('disconnect', () => {
      isConnected.value = false;
      console.log('Disconnected from chat/realtime server');
    });

    socket.value.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    // Handle global notifications
    socket.value.on('notification', (notification) => {
      notifications.value.unshift(notification);
      showToast({
        title: notification.title || 'Platform Notification',
        message: notification.message || notification.content,
        toastType: 'info',
      });
      
      // Sound cue
      if (typeof Audio !== 'undefined') {
        new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3').play().catch(() => {});
      }
    });

    // Handle incoming messages (useful for global badge counts)
    socket.value.on('newMessage', (message) => {
      newMessages.value.push(message);
    });
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
  };

  return {
    socket,
    isConnected,
    notifications,
    newMessages,
    connect,
    disconnect
  };
};
