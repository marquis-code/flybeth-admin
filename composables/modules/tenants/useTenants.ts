import { ref } from "vue";
import { tenantsApiFactory } from "@/api_factory/modules/tenants";
import { useCustomToast } from "@/composables/core/useCustomToast";

export const useTenants = () => {
    const loading = ref(false);
    const tenants = ref<any[]>([]);
    const tenant = ref<any>(null);
    const stats = ref(null);
    const { showToast } = useCustomToast();

    const fetchTenants = async (params?: any) => {
        loading.value = true;
        try {
            const res = await tenantsApiFactory.findAll(params);
            if (res.status === 200 || res.status === 201) {
                tenants.value = res.data.data;
                return res;
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    const createTenant = async (payload: any) => {
        loading.value = true;
        try {
            const res = await tenantsApiFactory.create(payload);
            if (res.status === 200 || res.status === 201) {
                showToast({
                    title: "Success",
                    message: "New partner agency added successfully",
                    toastType: "success",
                });
                return res;
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    const updateTenantStatus = async (id: string, status: string) => {
        loading.value = true;
        try {
            const res = await tenantsApiFactory.updateStatus(id, { status });
            if (res.status === 200 || res.status === 201) {
                showToast({
                    title: "Success",
                    message: `Partner status updated to ${status}`,
                    toastType: "success",
                });
                return res;
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    const getTenant = async (id: string) => {
        loading.value = true;
        try {
            const res = await tenantsApiFactory.findById(id);
            if (res.status === 200 || res.status === 201) {
                tenant.value = res.data;
                return res.data;
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        tenants,
        tenant,
        stats,
        fetchTenants,
        createTenant,
        updateTenantStatus,
        getTenant,
    };
};
