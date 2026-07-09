import { GATEWAY_ENDPOINT } from "../axios.config";

export const packagesApi = {
    getAll(params: any = {}) {
        return GATEWAY_ENDPOINT.get("/packages", { params });
    },
    getById(id: string) {
        return GATEWAY_ENDPOINT.get(`/packages/${id}`);
    },
    create(data: any) {
        return GATEWAY_ENDPOINT.post("/packages", data);
    },
    update(id: string, data: any) {
        return GATEWAY_ENDPOINT.post(`/packages/${id}`, data);
    },
    delete(id: string) {
        return GATEWAY_ENDPOINT.delete(`/packages/${id}`);
    }
};
