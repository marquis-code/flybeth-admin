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
        b2bCommission: 5,
        b2cCommission: 10,
        whitelistedStates: [],
        isWhitelistingEnabled: false,
        ancillaryMargin: 15,
        flightFees: {
            domestic: {
                b2cType: 'percentage',
                b2cValue: 10,
                b2bType: 'percentage',
                b2bValue: 5,
                marginType: 'percentage',
                marginValue: 15,
            },
            international: {
                b2cType: 'percentage',
                b2cValue: 10,
                b2bType: 'percentage',
                b2bValue: 5,
                marginType: 'percentage',
                marginValue: 15,
            },
        },
        exchangeRates: [],
        ancillaryPrices: {
            bags: 0,
            seats: 0,
            insurance: 0,
            vipSupport: 15
        },
        ancillaryPricingTypes: {
            bags: 'fixed',
            seats: 'fixed',
            insurance: 'fixed',
            vipSupport: 'fixed'
        },
        bankAccounts: [
            {
                currency: 'NGN',
                accountName: 'Flybeth Limited',
                accountNumber: '0124034266',
                bankName: 'Wema Bank',
                routingNumber: '',
                swiftCode: '',
                instructions: 'Please include your Booking Reference in the transfer memo.',
                isActive: true
            },
            {
                currency: 'USD',
                accountName: 'Flybeth Ltd',
                accountNumber: '0620862082',
                bankName: 'Wema Bank',
                routingNumber: '',
                swiftCode: '',
                instructions: 'Zelle: payments@flybeth.com. Please include your Booking Reference in the transfer memo.',
                isActive: true
            }
        ]
    });

    const fetchConfig = async () => {
        loading.value = true;
        try {
            // Bypass potential caching with timestamp
            const res = await adminApiFactory.getSystemConfig({ params: { t: Date.now() } });
            const data = res.data?.data || res.data;
            
            // Merge with defaults to prevent UI breakage
            const flightFees = {
                domestic: {
                    b2cType: data?.flightFees?.domestic?.b2cType || 'percentage',
                    b2cValue: data?.flightFees?.domestic?.b2cValue ?? (data?.b2cCommission ?? 10),
                    b2bType: data?.flightFees?.domestic?.b2bType || 'percentage',
                    b2bValue: data?.flightFees?.domestic?.b2bValue ?? (data?.b2bCommission ?? 5),
                    marginType: data?.flightFees?.domestic?.marginType || 'percentage',
                    marginValue: data?.flightFees?.domestic?.marginValue ?? (data?.ancillaryMargin ?? 15),
                },
                international: {
                    b2cType: data?.flightFees?.international?.b2cType || 'percentage',
                    b2cValue: data?.flightFees?.international?.b2cValue ?? (data?.b2cCommission ?? 10),
                    b2bType: data?.flightFees?.international?.b2bType || 'percentage',
                    b2bValue: data?.flightFees?.international?.b2bValue ?? (data?.b2bCommission ?? 5),
                    marginType: data?.flightFees?.international?.marginType || 'percentage',
                    marginValue: data?.flightFees?.international?.marginValue ?? (data?.ancillaryMargin ?? 15),
                },
            };

            config.value = {
                ...config.value,
                ...data,
                flightFees,
                ancillaryPrices: {
                    ...(config.value.ancillaryPrices || {}),
                    ...(data?.ancillaryPrices || {})
                },
                ancillaryPricingTypes: {
                    ...(config.value.ancillaryPricingTypes || {}),
                    ...(data?.ancillaryPricingTypes || {})
                },
                exchangeRates: data?.exchangeRates || config.value.exchangeRates || [],
                bankAccounts: (data?.bankAccounts && data.bankAccounts.length > 0)
                    ? data.bankAccounts
                    : (config.value.bankAccounts || [])
            };
            
            return res;
        } catch (e) {
            showToast({ title: 'Fetch Error', message: 'Could not retrieve platform parameters.', toastType: 'error' });
        } finally {
            loading.value = false;
        }
    };

    const resetConfig = async () => {
        loading.value = true;
        try {
            const res = await adminApiFactory.resetSystemConfig();
            const data = res.data?.data || res.data;
            config.value = data;
            showToast({ title: 'System Reset', message: 'Master economic blueprint has been restored.', toastType: 'success' });
            return res;
        } catch (e) {
            showToast({ title: 'Reset Failed', message: 'Could not restore defaults.', toastType: 'error' });
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
            integrationsList.value = res.data?.data?.providers || res.data?.providers || [];
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
