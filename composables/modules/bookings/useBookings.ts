import { ref } from "vue";
import { adminApiFactory } from "@/api_factory/modules/admin";

export const useBookings = () => {
    const loading = ref(false);
    const bookings = ref<any[]>([]);
    const meta = ref<any>(null);

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
        createBooking
    };
};
