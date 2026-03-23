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

    return {
        loading,
        users,
        metadata,
        fetchUsers,
        inviteUser
    };
};
