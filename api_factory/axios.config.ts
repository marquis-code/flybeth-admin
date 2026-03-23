import axios, { type AxiosResponse } from "axios";
import { useUser } from "@/composables/modules/auth/user";
import { useCustomToast } from '@/composables/core/useCustomToast'

const { showToast } = useCustomToast();
const { token, logOut } = useUser();

const BASE_URL = 'http://localhost:3000/api/v1';

export const GATEWAY_ENDPOINT = axios.create({
    baseURL: BASE_URL,
});

export const GATEWAY_ENDPOINT_WITH_AUTH = axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: token.value ? `Bearer ${token.value}` : '',
    },
});

const instances = [GATEWAY_ENDPOINT, GATEWAY_ENDPOINT_WITH_AUTH];

instances.forEach((instance) => {
    instance.interceptors.request.use((config) => {
        if (token.value) {
            config.headers.Authorization = `Bearer ${token.value}`;
        }
        return config;
    });

    instance.interceptors.response.use(
        (response) => response,
        (err) => {
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
                if (token.value) {
                    showToast({
                        title: "Session Expired",
                        message: "Your session has expired. Please log in again.",
                        toastType: "error",
                    });
                    logOut();
                }
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
