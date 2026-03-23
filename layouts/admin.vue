<template>
  <div class="min-h-screen bg-gray-50 flex font-sans text-brand-gray overflow-hidden">
    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
      @click="isMobileMenuOpen = false"
    />

    <!-- Sidebar -->
    <aside 
      class="fixed inset-y-0 left-0 w-72 bg-brand-blue text-white flex-shrink-0 flex flex-col z-[70] transition-transform duration-300 transform lg:relative lg:translate-x-0 overflow-hidden"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <!-- Decorator Background -->
      <div class="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/5 blur-3xl p-interact-none" />
      <div class="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-brand-green/10 blur-3xl p-interact-none" />

      <div class="p-8 pb-10 flex items-center justify-between relative z-10">
        <div class="flex items-center space-x-3">
          <div class="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg transition-transform hover:rotate-3 cursor-pointer">
            <PaperAirplaneIcon class="h-6 w-6 text-brand-blue" />
          </div>
          <div class="flex flex-col">
            <span class="text-2xl  font-black tracking-tighter text-white">FLYBETH</span>
            <span class="text-[9px] font-black uppercase tracking-[0.3em] text-brand-green/80 -mt-1">Admin Panel</span>
          </div>
        </div>
        <!-- Close button for mobile -->
        <button @click="isMobileMenuOpen = false" class="lg:hidden p-2 text-white/60 hover:text-white">
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
      
      <nav class="mt-4 flex-grow px-4 space-y-1 relative z-10 overflow-y-auto custom-scrollbar">
        <div class="px-4 mb-4">
           <p class="text-sm font-black text-white/30 uppercase tracking-[0.2em]">Management</p>
        </div>
        <NuxtLink 
          v-for="item in navigation" 
          :key="item.name" 
          :to="item.href"
          class="flex items-center px-5 py-3 text-sm font-bold rounded-xl transition-all duration-200 group relative"
          :class="[route.path.startsWith(item.href) && (item.href !== '/dashboard' || route.path === '/dashboard') ? 'bg-white text-brand-blue shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5']"
          @click="isMobileMenuOpen = false"
        >
          <component :is="item.icon" class="h-5 w-5 mr-4 flex-shrink-0 transition-transform group-hover:scale-110" />
          {{ item.name }}
          <div v-if="route.path.startsWith(item.href) && (item.href !== '/dashboard' || route.path === '/dashboard')" class="absolute right-4 h-1.5 w-1.5 rounded-full bg-brand-green" />
        </NuxtLink>
      </nav>

      <div class="p-6 relative z-10 border-t border-white/5">
        <div class="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10 cursor-pointer">
            <div class="h-10 w-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center font-black">SA</div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-black text-white truncate">Super Admin</p>
              <p class="text-sm text-white/50 font-medium truncate uppercase tracking-widest mt-0.5">Administrator</p>
            </div>
        </div>
        
        <button 
          @click="handleLogout" 
          class="mt-6 flex items-center justify-center space-x-3 w-full py-3.5 text-xs font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest border border-white/5 rounded-xl hover:bg-red-500/10 hover:border-red-500/20"
        >
          <ArrowLeftOnRectangleIcon class="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
      <!-- Top header -->
      <header class="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 md:h-20 flex items-center justify-between px-6 md:px-10 sticky top-0 z-50">
        <div class="flex items-center space-x-4">
           <button @click="isMobileMenuOpen = true" class="lg:hidden p-2 -ml-2 text-brand-blue hover:bg-gray-50 rounded-lg">
             <Bars3CenterLeftIcon class="h-6 w-6" />
           </button>
           <h2 class="text-xl md:text-2xl  font-black text-brand-blue tracking-tight">{{ currentPageTitle }}</h2>
        </div>
        
        <div class="flex items-center space-x-4 md:space-x-10">
          <div class="hidden lg:flex items-center bg-gray-50 border border-transparent focus-within:border-brand-blue/10 focus-within:bg-white rounded-xl px-4 py-2 transition-all group min-w-[320px]">
            <MagnifyingGlassIcon class="h-4 w-4 text-brand-gray/40 mr-3 group-focus-within:text-brand-blue" />
            <input type="text" placeholder="Quick search..." class="bg-transparent border-none text-sm font-medium focus:outline-none w-full placeholder:text-brand-gray/30 text-brand-blue">
          </div>
          
          <div class="flex items-center space-x-2 md:space-x-3">
            <button class="h-10 w-10 flex items-center justify-center rounded-xl text-brand-gray/50 hover:bg-gray-50 hover:text-brand-blue transition-colors relative bg-white border border-gray-100 shadow-sm">
              <BellIcon class="h-5 w-5" />
              <span class="absolute top-2.5 right-2.5 h-2 w-2 bg-brand-green ring-2 ring-white rounded-full"></span>
            </button>
            <button class="h-10 w-10 flex items-center justify-center rounded-xl text-brand-gray/50 hover:bg-gray-50 hover:text-brand-blue transition-colors bg-white border border-gray-100 shadow-sm">
              <Cog6ToothIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth bg-gray-50/50">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/modules/auth/useAuth'
import { 
  Squares2X2Icon as HomeIcon, 
  UsersIcon, 
  BuildingOfficeIcon as TenantIcon,
  TicketIcon, 
  BanknotesIcon as RevenueIcon,
  ShieldCheckIcon as RolesIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  Bars3CenterLeftIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const isMobileMenuOpen = ref(false)

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Agents (Tenants)', href: '/tenants', icon: TenantIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'All Bookings', href: '/bookings', icon: TicketIcon },
  { name: 'Financials', href: '/revenue', icon: RevenueIcon },
  { name: 'Email Templates', href: '/emails', icon: EnvelopeIcon },
  { name: 'Roles & Access', href: '/roles', icon: RolesIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

const currentPageTitle = computed(() => {
  const item = navigation.find(n => route.path.startsWith(n.href))
  return item ? item.name : 'Super Admin'
})

const { logout } = useAuth()
const handleLogout = async () => {
  await logout()
}
</script>

<style>
/* Custom Scrollbar for better UX */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  @apply bg-transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-gray-200 rounded-full hover:bg-brand-blue/20 transition-premium;
}
</style>
