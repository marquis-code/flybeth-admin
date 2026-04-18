import { ref } from 'vue';
import { fraudApiFactory } from '@/api_factory/modules/fraud';

export const useFraud = () => {
    const loading = ref(false);
    const highRiskBookings = ref<any[]>([]);
    const botEvents = ref<any[]>([]);
    const stats = ref<any>(null);

    const fetchHighRiskBookings = async (params?: any) => {
        loading.value = true;
        try {
            const res = await fraudApiFactory.getHighRiskBookings(params);
            highRiskBookings.value = res.data?.data || [];
            return res;
        } catch (err) {
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    const fetchBotEvents = async (params?: any) => {
        loading.value = true;
        try {
            const res = await fraudApiFactory.getBotEvents(params);
            botEvents.value = res.data?.data || [];
            return res;
        } catch (err) {
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    const fetchStats = async () => {
        loading.value = true;
        try {
            const res = await fraudApiFactory.getStats();
            stats.value = res.data?.data;
            return res;
        } catch (err) {
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    const approveBooking = async (id: string) => {
        loading.value = true;
        try {
            const res = await fraudApiFactory.approveBooking(id);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const rejectBooking = async (id: string) => {
        loading.value = true;
        try {
            const res = await fraudApiFactory.rejectBooking(id);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        highRiskBookings,
        botEvents,
        stats,
        fetchHighRiskBookings,
        fetchBotEvents,
        fetchStats,
        approveBooking,
        rejectBooking
    };
};
