import { ref } from 'vue';
import { adminApiFactory } from '@/api_factory/modules/admin';
import { useCustomToast } from '@/composables/core/useCustomToast';

export const useRoles = () => {
    const { showToast } = useCustomToast();
    const loading = ref(false);
    const saving = ref(false);
    const roles = ref<any[]>([]);
    const availablePermissions = ref<any[]>([]);

    const fetchRolesAndPermissions = async () => {
        loading.value = true;
        try {
            const [rolesRes, permsRes] = await Promise.all([
                adminApiFactory.getRoles(),
                adminApiFactory.getPermissions()
            ]);
            roles.value = rolesRes.data || [];
            availablePermissions.value = permsRes.data || [];
            return { roles: roles.value, permissions: availablePermissions.value };
        } catch (e) {
            showToast({ title: 'Sync Error', message: 'Failed to retrieve security tiers.', toastType: 'error' });
        } finally {
            loading.value = false;
        }
    };

    const createRole = async (data: any) => {
        saving.value = true;
        try {
            const res = await adminApiFactory.createRole(data);
            showToast({ title: 'Role Established', message: 'New security tier architected.', toastType: 'success' });
            return res;
        } catch (e) {
            showToast({ title: 'Protocol Failure', message: 'Failed to save security policy.', toastType: 'error' });
            throw e;
        } finally {
            saving.value = false;
        }
    };

    const updateRole = async (id: string, data: any) => {
        saving.value = true;
        try {
            const res = await adminApiFactory.updateRole(id, data);
            showToast({ title: 'Policy Updated', message: 'Security tier has been synchronized.', toastType: 'success' });
            return res;
        } catch (e) {
            showToast({ title: 'Protocol Failure', message: 'Failed to update security policy.', toastType: 'error' });
            throw e;
        } finally {
            saving.value = false;
        }
    };

    const deleteRole = async (id: string) => {
        try {
            const res = await adminApiFactory.deleteRole(id);
            showToast({ title: 'Deconstructed', message: 'Security tier removed.', toastType: 'success' });
            return res;
        } catch (e) {
            showToast({ title: 'Error', message: 'Failed to delete role.', toastType: 'error' });
            throw e;
        }
    };

    return {
        loading,
        saving,
        roles,
        availablePermissions,
        fetchRolesAndPermissions,
        createRole,
        updateRole,
        deleteRole
    };
};
