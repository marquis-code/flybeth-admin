export const useApi = () => {
    const config = useRuntimeConfig()
    const baseUrl = (config.public.apiBase || 'http://localhost:3000') + '/api/v1'

    const request = async (url: string, options: any = {}) => {
        const token = localStorage.getItem('token')

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
