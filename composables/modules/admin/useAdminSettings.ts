import { ref } from 'vue';
import { adminApiFactory } from '@/api_factory/modules/admin';
import { useCustomToast } from '@/composables/core/useCustomToast';

export const useAdminSettings = () => {
    const { showToast } = useCustomToast();
    const loading = ref(false);
    const saving = ref(false);
    const integrationsList = ref<any[]>([]);
    const config = ref<any>({
        platformName: '',
        b2bCommission: 0,
        b2cCommission: 0,
        whitelistedStates: [],
        isWhitelistingEnabled: false
    });

    const fetchConfig = async () => {
        loading.value = true;
        try {
            const res = await adminApiFactory.getSystemConfig();
            config.value = res.data?.data || res.data;
            return res;
        } catch (e) {
            showToast({ title: 'Fetch Error', message: 'Could not retrieve platform parameters.', toastType: 'error' });
        } finally {
            loading.value = false;
        }
    };

    const saveConfig = async (payload: any) => {
        saving.value = true;
        try {
            const res = await adminApiFactory.updateSystemConfig(payload || config.value);
            showToast({ title: 'Params Committed', message: 'Global governance rules updated successfully.', toastType: 'success' });
            return res;
        } catch (e) {
            showToast({ title: 'Sync Failure', message: 'Parameters could not be synchronized.', toastType: 'error' });
        } finally {
            saving.value = false;
        }
    };

    const fetchIntegrations = async () => {
        loading.value = true;
        try {
            const res = await adminApiFactory.getIntegrations();
            integrationsList.value = res.data?.providers || [];
            return res;
        } catch (e) {
            console.error('Failed to fetch integrations', e);
        } finally {
            loading.value = false;
        }
    };

    const toggleProvider = async (providerName: string, enabled: boolean) => {
        try {
            await adminApiFactory.toggleIntegration({ providerName, enabled });
            await fetchIntegrations();
            showToast({ title: 'Provider Updated', message: `Status changed for ${providerName}`, toastType: 'success' });
        } catch (e) {
            showToast({ title: 'Error', message: 'Failed to toggle provider.', toastType: 'error' });
        }
    };

    return {
        loading,
        saving,
        config,
        integrationsList,
        fetchConfig,
        saveConfig,
        fetchIntegrations,
        toggleProvider
    };
};
