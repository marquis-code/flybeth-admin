import { GATEWAY_ENDPOINT, GATEWAY_ENDPOINT_WITH_AUTH } from "../axios.config";

export const authApiFactory = {
    login(payload: any) {
        return GATEWAY_ENDPOINT.post("/auth/login", payload);
    },
    register(payload: any) {
        return GATEWAY_ENDPOINT.post("/auth/register", payload);
    },
    refreshToken(payload: any) {
        return GATEWAY_ENDPOINT.post("/auth/refresh", payload); // Note: Backend uses jwt-refresh guard
    },
    forgotPassword(payload: any) {
        return GATEWAY_ENDPOINT.post("/auth/forgot-password", payload);
    },
    resetPassword(payload: any) {
        return GATEWAY_ENDPOINT.post("/auth/reset-password", payload);
    },
    verifyOtp(payload: any) {
        return GATEWAY_ENDPOINT.post("/auth/verify-otp", payload);
    },
    logout() {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/auth/logout");
    }
};
