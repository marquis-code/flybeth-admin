import axios, { type AxiosResponse } from "axios";
import { useUser } from "@/composables/modules/auth/user";
import { useCustomToast } from '@/composables/core/useCustomToast'

const rawBaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const BASE_URL = rawBaseUrl.endsWith("/api/v1") 
  ? rawBaseUrl 
  : `${rawBaseUrl.replace(/\/+$/, '')}/api/v1`;

// Standard instance for public requests
export const GATEWAY_ENDPOINT = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Instance for authenticated requests
export const GATEWAY_ENDPOINT_WITH_AUTH = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

const instances = [GATEWAY_ENDPOINT, GATEWAY_ENDPOINT_WITH_AUTH];

instances.forEach((instance) => {
    instance.interceptors.request.use((config) => {
        // Robust cookie retrieval for non-Nuxt contexts
        const getCookie = (name: string) => {
            if (typeof document === 'undefined') return null;
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
        };

        const token = getCookie('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    });

    instance.interceptors.response.use(
        (response) => response,
        (err) => {
            // Lazily initialize composables within the context-aware interceptor
            const { showToast } = useCustomToast();
            const { logOut } = useUser();

            if (!err.response) {
                showToast({
                    title: "Network Error",
                    message: "Please check your internet connection",
                    toastType: "error",
                });
                return Promise.reject(err);
            }

            const status = err.response.status;
            const message = err.response.data?.message || "An unexpected error occurred";

            const isAuthFlow = err.config.url?.match(/\/auth\/(login|verify-otp|register|resend-otp|forgot-password|reset-password)/);

            if (status === 401 && !isAuthFlow) {
                // If the user's session is active but gets a 401, it means the cookie expired or is invalid
                console.error(`[AxiosInterceptor] 401 Unauthorized for ${err.config.url}. Triggering logOut.`);
                showToast({
                    title: "Session Expired",
                    message: "Your session has expired. Please log in again.",
                    toastType: "error",
                });
                logOut();
            } else if (status === 401 && isAuthFlow) {
                // For login/auth flow, just log the error and let the component handle it
                console.warn(`[AxiosInterceptor] 401 Auth Failure for ${err.config.url}. Component will handle toast.`);
            } else {
                console.error(`[AxiosInterceptor] ${status} Error:`, err.response.data);
                showToast({
                    title: "Error",
                    message,
                    toastType: "error",
                });
            }
            return Promise.reject(err);
        }
    );
});
