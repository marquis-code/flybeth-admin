import { useCustomToast } from '~/composables/core/useCustomToast'

export const useApi = () => {
    const config = useRuntimeConfig()
    const baseUrl = (config.public.apiBase || 'http://localhost:3000') + '/api/v1'
    const { showToast } = useCustomToast()

    const request = async (url: string, options: any = {}) => {
        // Aggressive token discovery
        let token = useCookie('accessToken').value
        
        // Browser fallback for cases where Nuxt cookie state might be lagging
        if (!token && import.meta.client) {
            const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'))
            if (match) {
                token = match[2]
            } else {
                // Last ditch effort: localStorage
                token = localStorage.getItem('accessToken') || localStorage.getItem('token')
            }
        }

        if (import.meta.client) {
            console.log(`[API Request] ${url} | Token exists: ${!!token}`);
        }

        try {
            const response = await $fetch(`${baseUrl}${url}`, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: token ? `Bearer ${token}` : '',
                },
            })
            return { data: response, error: null }
        } catch (err: any) {
            console.error(`API Error (${url}):`, err)
            const errorMessage = err.data?.message || err.message || "An unexpected error occurred"
            
            showToast({
                title: "Error",
                message: errorMessage,
                toastType: "error",
            })
            
            return { data: null, error: err.data || err.message }
        }
    }

    return {
        get: (url: string, params?: any) => request(url, { method: 'GET', params }),
        post: (url: string, body?: any) => request(url, { method: 'POST', body }),
        patch: (url: string, body?: any) => request(url, { method: 'PATCH', body }),
        delete: (url: string) => request(url, { method: 'DELETE' }),
    }
}
