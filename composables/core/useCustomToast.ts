import { ref } from "vue";

export interface ToastOptions {
    title: string;
    message: string;
    toastType: "success" | "error" | "info" | "warning";
    duration?: number;
}

export const useCustomToast = () => {
    const showToast = (options: ToastOptions) => {
        console.log(`[TOAST][${options.toastType.toUpperCase()}] ${options.title}: ${options.message}`);
        // Basic implementation, can be extended with a real toast library
    };

    return {
        showToast,
    };
};
