import { ref } from "vue";
import { adminApiFactory } from "@/api_factory/modules/admin";

export interface DashboardData {
    totalRevenue: string;
    revenueTrend: string;
    activeTenants: string | number;
    tenantGrowth: string;
    totalBookings: string | number;
    bookingTrend: string;
    totalUsers: string | number;
    userGrowth: string;
    topTenants: any[];
}

export interface SystemHealth {
    name: string;
    uptime: string;
    icon: any;
    status?: string;
}

export const useAdmin = () => {
    const loading = ref(false);
    const dashboardData = ref<DashboardData | null>(null);
    const revenueData = ref<any[] | null>(null);
    const systemHealth = ref<SystemHealth[] | null>(null);

    const fetchDashboard = async () => {
        loading.value = true;
        try {
            const res = await adminApiFactory.getDashboard();
            if (res.status === 200 || res.status === 201) {
                dashboardData.value = res.data.data;
                return res;
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    const fetchRevenue = async (params?: any) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.getRevenue(params);
            if (res.status === 200 || res.status === 201) {
                revenueData.value = res.data.data;
                return res;
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    const fetchSystemHealth = async () => {
        loading.value = true;
        try {
            const res = await adminApiFactory.getSystemHealth();
            if (res.status === 200 || res.status === 201) {
                systemHealth.value = res.data.data;
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
        dashboardData,
        revenueData,
        systemHealth,
        fetchDashboard,
        fetchRevenue,
        fetchSystemHealth,
    };
};
