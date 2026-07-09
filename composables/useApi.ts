import { useCustomToast } from '~/composables/core/useCustomToast'

// ─── Module-level refresh state (shared across all useApi instances) ──────
let isRefreshing = false
let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token!)
        }
    })
    failedQueue = []
}

const AUTH_FLOW_PATTERN = /\/auth\/(login|verify-otp|register|resend-otp|forgot-password|reset-password|refresh)/

export const useApi = () => {
    const config = useRuntimeConfig()
    const baseUrl = (config.public.apiBase || 'http://localhost:3000') + '/api/v1'
    const { showToast } = useCustomToast()

    const getToken = (): string | null => {
        // 1. Nuxt cookie
        let token = useCookie('accessToken').value || null
        
        // 2. Browser cookie fallback
        if (!token && import.meta.client) {
            const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'))
            if (match) token = match[2]
        }

        // 3. localStorage fallback
        if (!token && import.meta.client) {
            token = localStorage.getItem('accessToken')
        }

        return token
    }

    const getRefreshToken = (): string | null => {
        let token = useCookie('refreshToken').value || null
        if (!token && import.meta.client) {
            const match = document.cookie.match(new RegExp('(^| )refreshToken=([^;]+)'))
            if (match) token = match[2]
        }
        return token
    }

    const setTokens = (accessToken: string, refreshToken?: string) => {
        if (import.meta.client) {
            // Cookie
            document.cookie = `accessToken=${accessToken}; path=/; max-age=${7 * 86400}; SameSite=Lax`
            localStorage.setItem('accessToken', accessToken)

            if (refreshToken) {
                document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${30 * 86400}; SameSite=Lax`
            }
        }
    }

    const clearTokensAndRedirect = () => {
        if (import.meta.client) {
            document.cookie = 'accessToken=; path=/; max-age=0'
            document.cookie = 'refreshToken=; path=/; max-age=0'
            document.cookie = 'user_profile=; path=/; max-age=0'
            localStorage.removeItem('accessToken')
            localStorage.removeItem('user_profile')
            showToast({
                title: "Session Expired",
                message: "Your session has expired. Please log in again.",
                toastType: "error",
            })
            window.location.href = "/"
        }
    }

    const attemptRefresh = async (): Promise<string> => {
        const refreshToken = getRefreshToken()
        if (!refreshToken) throw new Error('No refresh token available')

        const response = await $fetch<any>(`${baseUrl}/auth/refresh`, {
            method: 'POST',
            body: { refreshToken },
            headers: { 'x-refresh-token': refreshToken },
            credentials: 'include',
        })

        const newAccessToken = response?.accessToken || response?.data?.accessToken
        const newRefreshToken = response?.refreshToken || response?.data?.refreshToken

        if (!newAccessToken) throw new Error('No access token in refresh response')

        setTokens(newAccessToken, newRefreshToken)
        return newAccessToken
    }

    const request = async (url: string, options: any = {}): Promise<{ data: any; error: any }> => {
        const token = getToken()

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
            const status = err?.response?.status || err?.status || err?.statusCode

            // ── 401: Attempt silent refresh ──────────────────────────────
            const isAuthFlow = AUTH_FLOW_PATTERN.test(url)
            if (status === 401 && !isAuthFlow) {
                if (isRefreshing) {
                    // Queue this request until the active refresh completes
                    try {
                        const newToken = await new Promise<string>((resolve, reject) => {
                            failedQueue.push({ resolve, reject })
                        })
                        // Retry with new token
                        const retryResponse = await $fetch(`${baseUrl}${url}`, {
                            ...options,
                            headers: {
                                ...options.headers,
                                Authorization: `Bearer ${newToken}`,
                            },
                        })
                        return { data: retryResponse, error: null }
                    } catch (queueErr) {
                        return { data: null, error: queueErr }
                    }
                }

                isRefreshing = true
                try {
                    const newToken = await attemptRefresh()
                    processQueue(null, newToken)
                    console.log(`[useApi] Token refreshed silently. Retrying ${url}`)

                    // Retry the original request
                    const retryResponse = await $fetch(`${baseUrl}${url}`, {
                        ...options,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${newToken}`,
                        },
                    })
                    return { data: retryResponse, error: null }
                } catch (refreshErr) {
                    console.error('[useApi] Refresh failed. Logging out.', refreshErr)
                    processQueue(refreshErr, null)
                    clearTokensAndRedirect()
                    return { data: null, error: refreshErr }
                } finally {
                    isRefreshing = false
                }
            }

            // ── Non-401 or auth-flow errors ──────────────────────────────
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
