import { GATEWAY_ENDPOINT } from '../axios.config';

export const supportApi = {
  getSubscriptions() {
    return GATEWAY_ENDPOINT.get('/support/newsletter');
  },

  getInquiries() {
    return GATEWAY_ENDPOINT.get('/support/contact');
  },

  updateInquiryStatus(id: string, status: string) {
    return GATEWAY_ENDPOINT.patch(`/support/contact/${id}/status`, { status });
  }
};
