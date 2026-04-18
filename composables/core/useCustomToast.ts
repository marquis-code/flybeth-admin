import { ref } from "vue";

export interface ToastOptions {
    id?: string;
    title: string;
    message: string;
    toastType: "success" | "error" | "info" | "warning";
    duration?: number;
}

const toasts = ref<ToastOptions[]>([]);

export const useCustomToast = () => {
    const showToast = (options: ToastOptions) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { ...options, id };
        
        toasts.value.push(newToast);

        const duration = options.duration || 5000;
        
        setTimeout(() => {
            removeToast(id);
        }, duration);

        console.log(`[TOAST][${options.toastType.toUpperCase()}] ${options.title}: ${options.message}`);
    };

    const removeToast = (id: string) => {
        toasts.value = toasts.value.filter((t) => t.id !== id);
    };

    return {
        toasts,
        showToast,
        removeToast,
    };
};
