import { ref } from "vue";
import { adminApiFactory } from "@/api_factory/modules/admin";

export const useBookings = () => {
    const loading = ref(false);
    const bookings = ref<any[]>([]);
    const metadata = ref(null);

    const fetchBookings = async (params?: any) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.getBookings(params);
            if (res.status === 200 || res.status === 201) {
                bookings.value = res.data.data;
                metadata.value = res.data.metadata;
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
        metadata,
        fetchBookings,
        createBooking
    };
};
