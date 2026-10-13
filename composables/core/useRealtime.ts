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
    
    // Unified 'chat' namespace on the main backend (see
    // backend/src/modules/chat/chat.gateway.ts → namespace: "chat").
    // Uses the SAME env var as `api_factory/axios.config.ts` (VITE_BASE_URL /
    // NUXT_PUBLIC_API_BASE) instead of the orphaned `VITE_API_URL`.
    const configuredBase =
      import.meta.env.VITE_BASE_URL ||
      import.meta.env.NUXT_PUBLIC_API_BASE ||
      'http://localhost:3000';
    // Strip a trailing slash and any `/api/v1` REST global prefix — the socket
    // namespace is mounted at the origin, not under the REST prefix.
    const socketOrigin = String(configuredBase)
      .replace(/\/+$/, '')
      .replace(/\/api\/v1$/, '');
    const socketUrl = `${socketOrigin}/chat`;
    
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
