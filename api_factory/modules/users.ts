import { GATEWAY_ENDPOINT_WITH_AUTH } from "@/api_factory/axios.config";

export const usersApiFactory = {
    getProfile() {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/users/me");
    },
    updateProfile(payload: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.patch("/users/me", payload);
    },
    findAll(params?: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/users", { params });
    },
    findById(id: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get(`/users/${id}`);
    },
    updateRole(id: string, payload: { role: string }) {
        return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/users/${id}/role`, payload);
    }
};
