import { GATEWAY_ENDPOINT_WITH_AUTH } from '@/api_factory/axios.config';

export const chatApiFactory = {
  getRooms(params: any) {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/chat/all', { params });
  },
  createRoom(participantId: string) {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/chat/rooms', { participantId });
  },
  getMessages(roomId: string, params: any) {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/chat/rooms/${roomId}/messages`, { params });
  },
  createGroup(data: any) {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/chat/rooms/group', data);
  }
};
