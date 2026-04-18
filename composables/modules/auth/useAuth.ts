import { ref } from "vue";
import { authApiFactory } from "@/api_factory/modules/auth";
import { useUser } from "./user";
import { useCustomToast } from "@/composables/core/useCustomToast";

export const useAuth = () => {
    const loading = ref(false);
    const resendLoading = ref(false);
    const passwordLoading = ref(false);
    const { setUser, logOut, user } = useUser();
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
                const responseData = res.data.data || res.data;
                const { user, accessToken, refreshToken } = responseData;
                setUser(user, { accessToken, refreshToken });
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
                message: Array.isArray(error.response?.data?.message) ? error.response?.data?.message[0] : (error.response?.data?.message || "Invalid credentials"),
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
                message: Array.isArray(error.response?.data?.message) ? error.response?.data?.message[0] : (error.response?.data?.message || "Something went wrong"),
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
            const responseData = res.data.data || res.data;
            if (res.status === 200 || res.status === 201) {
                const { user, accessToken, refreshToken } = responseData;
                setUser(user, { accessToken, refreshToken });
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
                message: Array.isArray(error.response?.data?.message) ? error.response?.data?.message[0] : (error.response?.data?.message || "Invalid or expired OTP"),
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

    const resendOtp = async (payload: { email: string }) => {
        resendLoading.value = true;
        try {
            const res = await authApiFactory.resendOtp(payload);
            if (res.status === 200 || res.status === 201) {
                showToast({
                    title: "OTP Sent",
                    message: "A new verification code has been sent to your email",
                    toastType: "success",
                });
                return res;
            }
        } catch (error: any) {
            showToast({
                title: "Resend Failed",
                message: Array.isArray(error.response?.data?.message) ? error.response?.data?.message[0] : (error.response?.data?.message || "Failed to resend OTP"),
                toastType: "error",
            });
            throw error;
        } finally {
            resendLoading.value = false;
        }
    };

    const forgotPassword = async (payload: { email: string }) => {
        passwordLoading.value = true;
        try {
            const res = await authApiFactory.forgotPassword(payload);
            if (res.status === 200 || res.status === 201) {
                showToast({
                    title: "Email Sent",
                    message: "Password reset instructions have been sent to your email if it exists in our system",
                    toastType: "success",
                });
                return res;
            }
        } catch (error: any) {
            showToast({
                title: "Action Failed",
                message: Array.isArray(error.response?.data?.message) ? error.response?.data?.message[0] : (error.response?.data?.message || "Failed to initiate password reset"),
                toastType: "error",
            });
            throw error;
        } finally {
            passwordLoading.value = false;
        }
    };

    const resetPassword = async (payload: any) => {
        passwordLoading.value = true;
        try {
            const res = await authApiFactory.resetPassword(payload);
            if (res.status === 200 || res.status === 201) {
                showToast({
                    title: "Success",
                    message: "Your password has been successfully reset",
                    toastType: "success",
                });
                return res;
            }
        } catch (error: any) {
            showToast({
                title: "Reset Failed",
                message: Array.isArray(error.response?.data?.message) ? error.response?.data?.message[0] : (error.response?.data?.message || "The reset token is invalid or has expired"),
                toastType: "error",
            });
            throw error;
        } finally {
            passwordLoading.value = false;
        }
    };

    return {
        loading,
        resendLoading,
        passwordLoading,
        login,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        logout,
        user,
    };
};
