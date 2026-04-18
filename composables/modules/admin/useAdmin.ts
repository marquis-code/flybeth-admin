import { ref } from "vue";
import { adminApiFactory } from "@/api_factory/modules/admin";

export interface DashboardData {
    overview: {
        totalTenants: number;
        totalUsers: number;
        totalBookings: number;
        bookingTrend: string;
        userTrend: string;
        currentMonthPerformance: {
            newBookings: number;
            newUsers: number;
        };
    };
    revenue: {
        byCurrency: any[];
        totalTransactions: number;
        topPartners: any[];
    };
    analytics: {
        bookingStatus: any[];
        successRate: string;
    };
    recentBookings: any[];
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

    const downloadRevenueLedger = async () => {
        try {
            const res = await adminApiFactory.downloadLedger();
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `flybeth-ledger-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            console.error('Ledger download failed', error);
        }
    };

    const initiateGlobalSettlement = async () => {
        loading.value = true;
        try {
            await adminApiFactory.initiateSettlement();
            return true;
        } catch (error: any) {
            console.error('Settlement failed', error);
            return false;
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
        downloadRevenueLedger,
        initiateGlobalSettlement,
    };
};
