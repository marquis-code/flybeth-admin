import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
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

// ─── Refresh Token State Machine ──────────────────────────────────────────
// These are module-level singletons shared across all interceptors.
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// Robust cookie retrieval for non-Nuxt contexts (interceptors run outside setup)
const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

const setCookie = (name: string, value: string, maxAgeDays: number) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAgeDays * 86400}; SameSite=Lax`;
};

// Auth-flow URL patterns that should NOT trigger refresh attempts
const AUTH_FLOW_PATTERN = /\/auth\/(login|verify-otp|register|resend-otp|forgot-password|reset-password|refresh)/;

// ─── Request Interceptor (shared) ─────────────────────────────────────────
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
    const token = getCookie('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

// ─── Response Interceptor (shared) ────────────────────────────────────────
const createResponseInterceptor = (instance: ReturnType<typeof axios.create>) => {
    return [
        (response: AxiosResponse) => response,
        async (err: any) => {
            const originalRequest = err.config;

            // No response at all = network error
            if (!err.response) {
                if (typeof window !== 'undefined') {
                    const { showToast } = useCustomToast();
                    showToast({
                        title: "Network Error",
                        message: "Please check your internet connection",
                        toastType: "error",
                    });
                }
                return Promise.reject(err);
            }

            const status = err.response.status;
            const isAuthFlow = AUTH_FLOW_PATTERN.test(originalRequest.url || '');

            // ── 401 Handling with Silent Refresh ──────────────────────────
            if (
                status === 401 && 
                !isAuthFlow && 
                !originalRequest._retry &&
                !originalRequest.url?.includes('/auth/login')
            ) {
                // Mark this request so we don't infinite-loop
                originalRequest._retry = true;

                if (isRefreshing) {
                    // Another request is already refreshing — queue this one
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then((newToken: any) => {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return instance(originalRequest);
                        })
                        .catch((queueErr) => Promise.reject(queueErr));
                }

                isRefreshing = true;

                try {
                    // Retrieve the current refresh token (might be null if it's an httpOnly cookie)
                    const refreshToken = getCookie('refreshToken');

                    // Prepare the body and headers conditionally
                    const body = refreshToken ? { refreshToken } : {};
                    const headers = refreshToken ? { 'x-refresh-token': refreshToken } : {};

                    // Call the refresh endpoint
                    const refreshResponse = await axios.post(
                        `${BASE_URL}/auth/refresh`,
                        body,
                        {
                            withCredentials: true,
                            headers
                        }
                    );

                    const newAccessToken = refreshResponse.data?.accessToken || refreshResponse.data?.data?.accessToken;
                    const newRefreshToken = refreshResponse.data?.refreshToken || refreshResponse.data?.data?.refreshToken;

                    if (!newAccessToken) {
                        throw new Error('Refresh response did not contain a new access token');
                    }

                    // Persist the new tokens
                    setCookie('accessToken', newAccessToken, 7);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('accessToken', newAccessToken);
                    }

                    if (newRefreshToken) {
                        setCookie('refreshToken', newRefreshToken, 30);
                    }

                    console.log('[AxiosInterceptor] Token refreshed silently.');

                    // Replay all queued requests with the new token
                    processQueue(null, newAccessToken);

                    // Retry the original request
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return instance(originalRequest);

                } catch (refreshError) {
                    console.error('[AxiosInterceptor] Refresh failed. Logging out.', refreshError);
                    processQueue(refreshError, null);

                    // Refresh failed — session is truly expired
                    if (typeof window !== 'undefined') {
                        const { showToast } = useCustomToast();
                        const { logOut } = useUser();
                        showToast({
                            title: "Session Expired",
                            message: "Your session has expired. Please log in again.",
                            toastType: "error",
                        });
                        logOut();
                    }

                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            // ── Auth-flow 401s (login failures etc.) ─────────────────────
            if (status === 401 && isAuthFlow) {
                console.warn(`[AxiosInterceptor] 401 Auth Failure for ${originalRequest.url}. Component will handle toast.`);
                return Promise.reject(err);
            }

            // ── All other errors ─────────────────────────────────────────
            if (typeof window !== 'undefined') {
                const { showToast } = useCustomToast();
                const message = err.response.data?.message || "An unexpected error occurred";
                console.error(`[AxiosInterceptor] ${status} Error:`, err.response.data);
                showToast({
                    title: "Error",
                    message,
                    toastType: "error",
                });
            }

            return Promise.reject(err);
        },
    ] as const;
};

// ─── Apply Interceptors ───────────────────────────────────────────────────
const instances = [GATEWAY_ENDPOINT, GATEWAY_ENDPOINT_WITH_AUTH];

instances.forEach((instance) => {
    instance.interceptors.request.use(requestInterceptor);
    const [onFulfilled, onRejected] = createResponseInterceptor(instance);
    instance.interceptors.response.use(onFulfilled, onRejected);
});
