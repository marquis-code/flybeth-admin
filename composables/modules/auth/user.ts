import { ref, computed } from "vue";

// Shared state outside the composable function to ensure global reactivity
const user = ref<any>(null);

export const useUser = () => {
    // Persistent user state via cookies
    const userCookie = useCookie<any>("user_profile", {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        sameSite: 'lax',
        path: '/'
    });

    // Sync shared state with cookie on first call if not already set
    if (!user.value && userCookie.value) {
        user.value = userCookie.value;
    }

    const setUser = (newUser: any, tokens?: { accessToken?: string, refreshToken?: string }) => {
        user.value = newUser;
        userCookie.value = newUser;
        
        if (tokens?.accessToken) {
            const accessCookie = useCookie('accessToken', { maxAge: 7 * 24 * 60 * 60, path: '/' });
            accessCookie.value = tokens.accessToken;
            if (import.meta.client) {
                localStorage.setItem('accessToken', tokens.accessToken);
            }
        }
        if (tokens?.refreshToken) {
            const refreshCookie = useCookie('refreshToken', { maxAge: 30 * 24 * 60 * 60, path: '/' });
            refreshCookie.value = tokens.refreshToken;
        }
    };

    const logOut = () => {
        user.value = null;
        userCookie.value = null;
        
        // Clear all session cookies
        const accessToken = useCookie('accessToken');
        const refreshToken = useCookie('refreshToken');
        accessToken.value = null;
        refreshToken.value = null;
        
        if (import.meta.client) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user_profile');
            window.location.href = "/";
        }
    };

    const isLoggedIn = computed(() => {
        // Essential: Check both to handle hydration and cross-component updates
        return !!user.value || !!userCookie.value;
    });

    return {
        user,
        setUser,
        logOut,
        isLoggedIn,
    };
};
