import { ref } from 'vue';
import { supportApi } from '@/api_factory/modules/support';
import { useCustomToast } from '@/composables/core/useCustomToast';

export const useManageSupport = () => {
  const loading = ref(false);
  const subscriptions = ref<any[]>([]);
  const inquiries = ref<any[]>([]);
  const { showToast } = useCustomToast();

  const fetchSubscriptions = async () => {
    loading.value = true;
    try {
      const { data, status } = await supportApi.getSubscriptions();
      if (status === 200 || status === 201) {
        subscriptions.value = data?.data || data || [];
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchInquiries = async () => {
    loading.value = true;
    try {
      const { data, status } = await supportApi.getInquiries();
      if (status === 200 || status === 201) {
        inquiries.value = data?.data || data || [];
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      loading.value = false;
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { status: resStatus } = await supportApi.updateInquiryStatus(id, status);
      if (resStatus === 200 || resStatus === 201) {
        showToast({
          title: 'Success',
          message: 'Inquiry status updated successfully',
          toastType: 'success'
        });
        await fetchInquiries();
        return true;
      }
    } catch (error) {
      // Errors handled by global interceptor
    }
    return false;
  };

  return {
    loading,
    subscriptions,
    inquiries,
    fetchSubscriptions,
    fetchInquiries,
    updateStatus
  };
};
