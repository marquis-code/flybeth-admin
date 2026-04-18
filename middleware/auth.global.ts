import { useUser } from "@/composables/modules/auth/user";

export default defineNuxtRouteMiddleware((to, from) => {
    const { isLoggedIn, user } = useUser();
    const userCookie = useCookie("user_profile");
    
    // Ensure state is synced if cookie exists but ref is empty (happens on first load)
    if (!user.value && userCookie.value) {
        user.value = userCookie.value;
    }

    const publicRoutes = ['/', '/signup', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.includes(to.path);
    const reallyLoggedIn = !!user.value || !!userCookie.value || isLoggedIn.value;
    
    // Diagnostic logging for debugging redirect loops
    if (import.meta.client) {
        console.log(`[AuthMiddleware] ${to.path} | LoggedIn: ${reallyLoggedIn} | UserRef: ${!!user.value} | Cookie: ${!!userCookie.value}`);
    }

    // Unauthenticated user trying to access private route
    if (!isPublicRoute && !reallyLoggedIn) {
        if (import.meta.client) console.warn("[AuthMiddleware] Redirecting to login: User not authenticated");
        return navigateTo('/');
    }
    
    // Authenticated user trying to access public route
    if (isPublicRoute && reallyLoggedIn) {
        if (import.meta.client) console.info("[AuthMiddleware] Redirecting to dashboard: Already authenticated");
        return navigateTo('/dashboard');
    }
});
