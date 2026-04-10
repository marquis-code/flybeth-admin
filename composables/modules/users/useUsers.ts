import { ref } from "vue";
import { adminApiFactory } from "@/api_factory/modules/admin";

export const useUsers = () => {
    const loading = ref(false);
    const users = ref<any[]>([]);
    const metadata = ref(null);

    const fetchUsers = async (params?: any) => {
        loading.value = true;
        try {
            const res = await adminApiFactory.getUsers(params);
            if (res.status === 200 || res.status === 201) {
                users.value = res.data.data;
                metadata.value = res.data.metadata;
                return res;
            }
        } catch (error: any) {
            console.error(error);
        } finally {
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
 
    return {
        loading,
        users,
        metadata,
        fetchUsers,
        fetchUser,
        updateAgentStatus,
        createAdminUser,
        verifyInvitation,
        inviteUser,
        deleteUser
    };
};
