import { ref } from "vue";
import { adminApiFactory } from "@/api_factory/modules/admin";

// Keep users state global to this composable to prevent redundant fetching and sync issues across modals
const sharedUsers = ref<any[]>([]);
const sharedMeta = ref<any>(null);
const sharedLoading = ref(false);

export const useUsers = () => {
    const loading = ref(false);
    
    // Internal method to fetch users and update shared state
    const fetchUsers = async (params: any = {}) => {
        sharedLoading.value = true;
        loading.value = true;
        try {
            console.log('Fetching users with params:', params);
            const res = await adminApiFactory.getUsers(params);
            console.log(res, 'users list')
            
            // Step 1: Extract the root data object
            const root = res.data;
            
            // Step 2: Determine if we have a paginated structure { data: [], meta: {} } 
            // or if it's a direct array, or weirdly nested { data: { data: [], meta: {} } }
            let extractedUsers: any[] = [];
            let extractedMeta: any = null;

            if (root?.data && Array.isArray(root.data)) {
                // Standard pagination return { data: [], meta: {} }
                extractedUsers = root.data;
                extractedMeta = root.meta;
            } else if (Array.isArray(root)) {
                // Direct array return
                extractedUsers = root;
            } else if (root?.data?.data && Array.isArray(root.data.data)) {
                // Double nested { data: { data: [], meta: {} } }
                extractedUsers = root.data.data;
                extractedMeta = root.data.meta;
            } else if (root?.docs && Array.isArray(root.docs)) {
                // Some pagination libs use 'docs'
                extractedUsers = root.docs;
                extractedMeta = root;
            }

            sharedUsers.value = extractedUsers;
            sharedMeta.value = extractedMeta;
            
            console.log(`Successfully loaded ${extractedUsers.length} users`);
            return res;
        } catch (error: any) {
            console.error('Failed to fetch users:', error);
            throw error;
        } finally {
            sharedLoading.value = false;
            loading.value = false;
        }
    };

    const inviteUser = async (data: any) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.inviteUser(data);
            return res;
        } catch (error: any) {
            console.error(error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const fetchUser = async (id: string) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.getUser(id);
            return res;
        } catch (error: any) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    const updateAgentStatus = async (id: string, status: string) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.updateAgentStatus(id, status);
            return res;
        } catch (error: any) {
            console.error(error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const updateUserRole = async (id: string, role: string) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.updateUserRole(id, role);
            return res;
        } catch (error: any) {
            console.error(error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const createAdminUser = async (data: any) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.createAdminUser(data);
            return res;
        } catch (error: any) {
            console.error(error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const verifyInvitation = async (token: string) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.verifyInvitation(token);
            return res;
        } catch (error: any) {
            console.error(error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const deleteUser = async (id: string) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.deleteUser(id);
            return res;
        } catch (error: any) {
            console.error(error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const updateKycStatus = async (id: string, data: any) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.updateKycStatus(id, data);
            return res;
        } catch (error: any) {
            console.error(error);
            throw error;
        } finally {
            loading.value = false;
        }
    };
 
    return {
        loading: sharedLoading,
        users: sharedUsers,
        meta: sharedMeta,
        fetchUsers,
        fetchUser,
        updateAgentStatus,
        updateUserRole,
        updateKycStatus,
        createAdminUser,
        verifyInvitation,
        inviteUser,
        deleteUser
    };
};
