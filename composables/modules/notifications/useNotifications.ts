import { ref } from "vue";
import { notificationApiFactory } from "@/api_factory/modules/notifications";
import { useCustomToast } from "@/composables/core/useCustomToast";

export const useNotifications = () => {
    const loading = ref(false);
    const seeding = ref(false);
    const templates = ref<any[]>([]);
    const template = ref<any>(null);
    const { showToast } = useCustomToast();

    const fetchTemplates = async () => {
        loading.value = true;
        try {
            const res = await notificationApiFactory.getTemplates();
            if (res.status === 200 || res.status === 201) {
                templates.value = res.data.data || res.data;
            }
        } catch (error: any) {
            showToast({
                title: "Error",
                message: error.response?.data?.message || "Failed to fetch templates",
                toastType: "error",
            });
        } finally {
            loading.value = false;
        }
    };

    const fetchTemplateById = async (id: string) => {
        loading.value = true;
        try {
            const res = await notificationApiFactory.getTemplateById(id);
            if (res.status === 200 || res.status === 201) {
                template.value = res.data.data || res.data;
            }
        } catch (error: any) {
            showToast({
                title: "Error",
                message: error.response?.data?.message || "Failed to fetch template",
                toastType: "error",
            });
        } finally {
            loading.value = false;
        }
    };

    const seedTemplates = async () => {
        seeding.value = true;
        try {
            const res = await notificationApiFactory.seedTemplates();
            if (res.status === 200 || res.status === 201) {
                showToast({
                    title: "Success",
                    message: "Templates seeded successfully",
                    toastType: "success",
                });
                await fetchTemplates();
            }
        } catch (error: any) {
            showToast({
                title: "Error",
                message: error.response?.data?.message || "Failed to seed templates",
                toastType: "error",
            });
        } finally {
            seeding.value = false;
        }
    };

    const saveTemplate = async (payload: any, id?: string) => {
        loading.value = true;
        try {
            const res = id 
                ? await notificationApiFactory.updateTemplate(id, payload)
                : await notificationApiFactory.createTemplate(payload);
            
            if (res.status === 200 || res.status === 201) {
                showToast({
                    title: "Success",
                    message: `Template ${id ? 'updated' : 'created'} successfully`,
                    toastType: "success",
                });
                return res.data.data || res.data;
            }
        } catch (error: any) {
            showToast({
                title: "Error",
                message: error.response?.data?.message || "Failed to save template",
                toastType: "error",
            });
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        seeding,
        templates,
        template,
        fetchTemplates,
        fetchTemplateById,
        seedTemplates,
        saveTemplate
    };
};
