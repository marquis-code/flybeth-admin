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
    
    // Aggressive check: if any indicator of auth exists, consider logged in
    const reallyLoggedIn = !!user.value || !!userCookie.value || isLoggedIn.value;
    
    // Unauthenticated user trying to access private route
    if (!isPublicRoute && !reallyLoggedIn) {
        return navigateTo('/');
    }
    
    // Authenticated user trying to access public route - Aggressive redirect to dashboard
    if (isPublicRoute && reallyLoggedIn) {
        return navigateTo('/dashboard');
    }
});
