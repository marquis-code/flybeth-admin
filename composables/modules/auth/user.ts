import { ref, computed } from "vue";

// Use Nuxt's useCookie for persistent user state that works with SSR
// Note: Tokens are now HttpOnly cookies set by the backend, so we don't handle them here.
export const useUser = () => {
    const userCookie = useCookie<any>("user_profile", {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        sameSite: 'lax'
    });

    const user = ref(userCookie.value || null);

    const setUser = (newUser: any) => {
        user.value = newUser;
        userCookie.value = newUser;
    };

    const logOut = () => {
        user.value = null;
        userCookie.value = null;
        
        // Redirect to login
        if (import.meta.client) {
            window.location.href = "/";
        }
    };

    const isLoggedIn = computed(() => !!user.value);

    return {
        user,
        setUser,
        logOut,
        isLoggedIn,
    };
};
