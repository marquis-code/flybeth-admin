import { GATEWAY_ENDPOINT_WITH_AUTH } from '@/api_factory/axios.config';

export const fraudApiFactory = {
  getHighRiskBookings(params?: any) {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/fraud/high-risk-bookings', { params });
  },
  getBotEvents(params?: any) {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/fraud/bot-events', { params });
  },
  getStats() {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/fraud/stats');
  },
  approveBooking(id: string) {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/fraud/bookings/${id}/approve`);
  },
  rejectBooking(id: string) {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/fraud/bookings/${id}/reject`);
  }
};
