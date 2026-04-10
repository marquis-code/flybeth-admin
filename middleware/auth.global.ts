import { useUser } from "@/composables/modules/auth/user";
export default defineNuxtRouteMiddleware((to, from) => {
    const { isLoggedIn } = useUser();
    
    // List of public routes that don't require authentication
    const publicRoutes = ['/', '/signup', '/forgot-password', '/reset-password'];
    
    // Check if the current route is public
    const isPublicRoute = publicRoutes.includes(to.path);
    
    // If not a public route and the user is not logged in, redirect to login
    if (!isPublicRoute && !isLoggedIn.value) {
        return navigateTo('/');
    }
    
    // If logged in and trying to access login/signup, redirect to dashboard
    if (isPublicRoute && isLoggedIn.value && (to.path === '/' || to.path === '/signup')) {
        return navigateTo('/dashboard');
    }
});
