import { ref } from 'vue';
import { chatApiFactory } from '@/api_factory/modules/chat';

export const useChat = () => {
    const loadingRooms = ref(false);
    const loadingMessages = ref(false);
    const rooms = ref<any[]>([]);
    const messages = ref<any[]>([]);

    const fetchRooms = async (params: any = { page: 1, limit: 50 }) => {
        loadingRooms.value = true;
        try {
            const res = await chatApiFactory.getRooms(params);
            rooms.value = res.data?.data || [];
            return res;
        } catch (err) {
            console.error('Fetch rooms failed', err);
            throw err;
        } finally {
            loadingRooms.value = false;
        }
    };

    const fetchMessages = async (roomId: string, params: any = { page: 1, limit: 50 }) => {
        loadingMessages.value = true;
        try {
            const res = await chatApiFactory.getMessages(roomId, params);
            // We usually want messages in chronological order for the UI
            messages.value = (res.data?.data || []).reverse();
            return res;
        } catch (err) {
            console.error('Fetch messages failed', err);
            throw err;
        } finally {
            loadingMessages.value = false;
        }
    };

    const createRoom = async (participantId: string) => {
        try {
            const res = await chatApiFactory.createRoom(participantId);
            return res.data;
        } catch (err) {
            console.error('Create room failed', err);
            throw err;
        }
    };

    const createGroup = async (data: any) => {
        try {
            const res = await chatApiFactory.createGroup(data);
            return res.data;
        } catch (err) {
            console.error('Create group failed', err);
            throw err;
        }
    };

    return {
        loadingRooms,
        loadingMessages,
        rooms,
        messages,
        fetchRooms,
        fetchMessages,
        createRoom,
        createGroup
    };
};
