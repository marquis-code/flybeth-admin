import { ref } from "vue";
import { authApiFactory } from "@/api_factory/modules/auth";
import { useUser } from "./user";
import { useCustomToast } from "@/composables/core/useCustomToast";

export const useAuth = () => {
    const loading = ref(false);
    const { setToken, setRefreshToken, setUser, logOut } = useUser();
    const { showToast } = useCustomToast();

    const login = async (payload: any) => {
        loading.value = true;
        try {
            const res = await authApiFactory.login(payload);
            if (res.status === 200 || res.status === 201) {
                const { accessToken, refreshToken, user } = res.data.data;
                setToken(accessToken);
                setRefreshToken(refreshToken);
                setUser(user);
                showToast({
                    title: "Success",
                    message: "Welcome back to Flybeth Admin",
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

    const logout = async () => {
        loading.value = true;
        try {
            await authApiFactory.logout();
            logOut();
        } catch (error: any) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        login,
        logout,
    };
};
