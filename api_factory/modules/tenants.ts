import { GATEWAY_ENDPOINT_WITH_AUTH } from "../axios.config";

export const tenantsApiFactory = {
    create(payload: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/tenants", payload);
    },
    findAll(params?: { page?: number; limit?: number; status?: string }) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/tenants", { params });
    },
    findById(id: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get(`/tenants/${id}`);
    },
    findBySlug(slug: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get(`/tenants/slug/${slug}`);
    },
    update(id: string, payload: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/tenants/${id}`, payload);
    },
    updateStatus(id: string, payload: { status: string }) {
        return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/tenants/${id}/status`, payload);
    },
    delete(id: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/tenants/${id}`);
    },
    getStats(id: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get(`/tenants/${id}/stats`);
    }
};
