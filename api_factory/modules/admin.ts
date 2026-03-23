import { GATEWAY_ENDPOINT_WITH_AUTH } from "../axios.config";

export const adminApiFactory = {
    getDashboard() {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/admin/dashboard");
    },
    getRevenue(params?: { period?: string; tenantId?: string }) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/admin/revenue", { params });
    },
    getTenants(params?: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/admin/tenants", { params });
    },
    getUsers(params?: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/admin/users", { params });
    },
    getBookings(params?: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/admin/bookings", { params });
    },
    getSystemHealth() {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/admin/system-health");
    },
    inviteUser(data: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/admin/users/invite", data);
    },
    createBooking(data: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/admin/bookings", data);
    }
};
