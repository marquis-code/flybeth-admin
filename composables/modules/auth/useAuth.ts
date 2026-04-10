import { ref } from "vue";
import { authApiFactory } from "@/api_factory/modules/auth";
import { useUser } from "./user";
import { useCustomToast } from "@/composables/core/useCustomToast";

export const useAuth = () => {
    const loading = ref(false);
    const { setUser, logOut } = useUser();
    const { showToast } = useCustomToast();

    const login = async (payload: any) => {
        loading.value = true;
        try {
            const res = await authApiFactory.login(payload);
            if (res.status === 200 || res.status === 201) {
                if (res.data.data.requiresOtp) {
                    showToast({
                        title: "Success",
                        message: "Verification code sent to your email",
                        toastType: "success",
                    });
                    return { requiresOtp: true, email: payload.email };
                }
                const { user } = res.data.data || res.data;
                setUser(user);
                showToast({
                    title: "Success",
                    message: "Welcome back to Flybeth Admin",
                    toastType: "success",
                });
                return res;
            }
        } catch (error: any) {
            showToast({
                title: "Login Failed",
                message: error.response?.data?.message || "Invalid credentials",
                toastType: "error",
            });
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    const register = async (payload: any) => {
        loading.value = true;
        try {
            const res = await authApiFactory.register(payload);
            if (res.status === 200 || res.status === 201) {
                const responseData = res.data.data || res.data;
                if (!responseData.requiresOtp) {
                    setUser(responseData.user);
                    showToast({
                        title: "Registration Successful",
                        message: "Welcome to Flybeth Admin",
                        toastType: "success",
                    });
                } else {
                    showToast({
                        title: "Success",
                        message: "Registration successful. Please verify your email.",
                        toastType: "success",
                    });
                }
                return res;
            }
        } catch (error: any) {
            showToast({
                title: "Registration Failed",
                message: error.response?.data?.message || "Something went wrong",
                toastType: "error",
            });
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    const verifyOtp = async (payload: any) => {
        loading.value = true;
        try {
            const res = await authApiFactory.verifyOtp(payload);
            if (res.status === 200 || res.status === 201) {
                const { user } = res.data.data;
                setUser(user);
                showToast({
                    title: "Success",
                    message: "Verification successful",
                    toastType: "success",
                });
                return res;
            }
        } catch (error: any) {
            showToast({
                title: "Verification Failed",
                message: error.response?.data?.message || "Invalid or expired OTP",
                toastType: "error",
            });
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
        register,
        verifyOtp,
        logout,
    };
};
