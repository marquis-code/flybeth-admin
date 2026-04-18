import { GATEWAY_ENDPOINT_WITH_AUTH } from "@/api_factory/axios.config";

export const notificationApiFactory = {
    getTemplates() {
        return GATEWAY_ENDPOINT_WITH_AUTH.get("/notifications/templates");
    },
    getTemplateById(id: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.get(`/notifications/templates/${id}`);
    },
    createTemplate(payload: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/notifications/templates", payload);
    },
    updateTemplate(id: string, payload: any) {
        return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/notifications/templates/${id}`, payload);
    },
    deleteTemplate(id: string) {
        return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/notifications/templates/${id}`);
    },
    seedTemplates() {
        return GATEWAY_ENDPOINT_WITH_AUTH.post("/notifications/templates/seed");
    }
};
