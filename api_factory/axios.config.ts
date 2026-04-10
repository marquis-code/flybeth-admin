import axios, { type AxiosResponse } from "axios";
import { useUser } from "@/composables/modules/auth/user";
import { useCustomToast } from '@/composables/core/useCustomToast'

const BASE_URL = 'http://localhost:3000/api/v1';

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
    // We no longer need to manually set the Authorization header
    // as it will be sent via HttpOnly cookies
    instance.interceptors.request.use((config) => {
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

            if (status === 401) {
                // If the user's session is active but gets a 401, it means the cookie expired or is invalid
                showToast({
                    title: "Session Expired",
                    message: "Your session has expired. Please log in again.",
                    toastType: "error",
                });
                logOut();
            } else {
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
