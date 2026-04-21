import { GATEWAY_ENDPOINT_WITH_AUTH, GATEWAY_ENDPOINT } from "@/api_factory/axios.config";

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
    getSystemConfig(config?: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/system-config", config);
    },
    getRoles() {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/access-control/roles");
    },
    createRole(data: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/access-control/roles", data);
    },
    updateRole(id: string, data: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.put(`/access-control/roles/${id}`, data);
    },
    deleteRole(id: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/access-control/roles/${id}`);
    },
    getPermissions() {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/access-control/permissions");
    },
    updateSystemConfig(data: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.patch("/system-config", data);
    },
    resetSystemConfig() {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/system-config/reset");
    },
    downloadLedger() {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/admin/revenue/ledger", { responseType: 'blob' });
    },
    initiateSettlement() {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/admin/revenue/settle");
    },
    inviteUser(data: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/admin/users/invite", data);
    },
    createBooking(data: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/admin/bookings", data);
    },
    getUser(id: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get(`/users/${id}`);
    },
    updateAgentStatus(id: string, status: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/users/${id}/agent-status`, { status });
    },
    createAdminUser(data: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/admin/users/create", data);
    },
    updateUserRole(id: string, role: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/users/${id}/role`, { role });
    },
    verifyInvitation(token: string) {
        return GATEWAY_ENDPOINT.get(`/admin/invitations/verify/${token}`);
    },
    deleteUser(id: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/admin/users/${id}`);
    },
    getStorageFiles(params?: { folder?: string }) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/admin/storage", { params });
    },
    deleteStorageFile(publicId: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/admin/storage/${publicId}`);
    },
    createCampaign(data: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/admin/campaigns", data);
    },
    seedCampaigns() {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/admin/campaigns/seed");
    },
    getCampaigns() {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/admin/campaigns");
    },
    updateCampaign(id: string, data: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.put(`/admin/campaigns/${id}`, data);
    },
    sendCampaign(id: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/campaigns/${id}/send`);
    },
    deleteCampaign(id: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/admin/campaigns/${id}`);
    },
    triggerReminders() {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/admin/scheduler/trigger-user-reminders");
    },
    uploadFile(data: FormData) {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/upload/image", data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    updateKycStatus(id: string, data: { docType: string; status: string; feedback?: string }) {
        return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/users/${id}/kyc-status`, data);
    },
    getIntegrations() {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/integrations/providers");
    },
    toggleIntegration(data: { providerName: string; enabled: boolean }) {
        return GATEWAY_ENDPOINT_WITH_AUTH.patch("/integrations/providers/toggle", data);
    }
};
