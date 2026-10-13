import { ref } from "vue";
import { adminApiFactory } from "@/api_factory/modules/admin";
import { useCustomToast } from "@/composables/core/useCustomToast";

export const useBookings = () => {
    const loading = ref(false);
    const bookings = ref<any[]>([]);
    const meta = ref<any>(null);
    const { showToast } = useCustomToast();

    const fetchBookings = async (params?: any) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.getBookings(params);
            if (res.status === 200 || res.status === 201) {
                const responseData = res.data?.data || res.data;
                if (Array.isArray(responseData)) {
                    bookings.value = responseData;
                    meta.value = res.data?.meta || null;
                } else if (responseData?.data && responseData?.meta) {
                    bookings.value = responseData.data;
                    meta.value = responseData.meta;
                } else {
                    bookings.value = Array.isArray(responseData) ? responseData : [];
                    meta.value = null;
                }
                return res;
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    const createBooking = async (payload: any) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.createBooking(payload);
            if (res.status === 200 || res.status === 201) {
                // Success feedback is raised by the caller (the page owns the
                // modal + reload), so we only return the response here.
                return res;
            }
            showToast({
                title: "Booking not created",
                message: "The server returned an unexpected response. The record was not saved.",
                toastType: "error",
            });
        } catch (error: any) {
            // Never swallow: surface the backend/network message to the admin.
            console.error(error);
            showToast({
                title: "Booking not created",
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to create the booking record. Please try again.",
                toastType: "error",
            });
        } finally {
            loading.value = false;
        }
    };

    const cancelBooking = async (id: string) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.cancelBooking(id);
            if (res.status === 200 || res.status === 201) {
                return res;
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    const payBooking = async (id: string) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.payBooking(id);
            if (res.status === 200 || res.status === 201) {
                return res;
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        bookings,
        meta,
        fetchBookings,
        createBooking,
        cancelBooking,
        payBooking
    };
};
