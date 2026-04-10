<template>
  <div class="min-h-screen bg-white flex font-sans text-gray-800 overflow-hidden">
    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
      @click="isMobileMenuOpen = false"
    />

    <!-- Sidebar -->
    <aside 
      class="fixed inset-y-0 left-0 w-[272px] bg-white flex-shrink-0 flex flex-col z-[70] transition-transform duration-300 transform lg:relative lg:translate-x-0 border-r border-gray-100"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <!-- Logo -->
      <div class="px-7 py-6 flex items-center space-x-3 border-b border-gray-100">
        <img src="https://agent.flybeth.com/_nuxt/logo.CJ2BWGNK.png" class="h-9 w-auto" alt="Flybeth" />
        <div class="flex flex-col">
          <span class="text-lg font-bold text-gray-900 tracking-tight leading-tight">Flybeth</span>
          <span class="text-[10px] font-semibold text-gray-400 tracking-wide">Admin console</span>
        </div>
        <!-- Close button for mobile -->
        <button @click="isMobileMenuOpen = false" class="lg:hidden ml-auto p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
      
      <!-- Navigation -->
      <nav class="mt-2 flex-grow px-4 py-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        <p class="px-3 pt-3 pb-2 text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Main</p>
        <NuxtLink 
          v-for="item in navigation" 
          :key="item.name" 
          :to="item.href"
          class="flex items-center px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200 group"
          :class="[isActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50']"
          @click="isMobileMenuOpen = false"
        >
          <component :is="item.icon" class="h-[18px] w-[18px] mr-3 flex-shrink-0 transition-colors" :class="isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" />
          {{ item.name }}
          <div v-if="isActive(item.href)" class="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
        </NuxtLink>
      </nav>

      <!-- User Section -->
      <div class="p-4 border-t border-gray-100">
        <div class="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
          <div class="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">SA</div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-gray-900 truncate">Super admin</p>
            <p class="text-xs text-gray-400 truncate">Administrator</p>
          </div>
        </div>
        
        <button 
          @click="showLogoutModal = true" 
          class="mt-3 flex items-center justify-center space-x-2 w-full py-2.5 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 border border-gray-100 hover:border-red-100"
        >
          <ArrowLeftOnRectangleIcon class="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
      <!-- Top header -->
      <header class="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-50">
        <div class="flex items-center space-x-3">
           <button @click="isMobileMenuOpen = true" class="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg">
             <Bars3CenterLeftIcon class="h-5 w-5" />
           </button>
           <h2 class="text-lg font-semibold text-gray-900">{{ currentPageTitle }}</h2>
        </div>
        
        <div class="flex items-center space-x-3">
          <div class="hidden lg:flex items-center bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 transition-all group focus-within:border-blue-200 focus-within:bg-white min-w-[280px]">
            <MagnifyingGlassIcon class="h-4 w-4 text-gray-400 mr-2 group-focus-within:text-blue-500" />
            <input type="text" placeholder="Quick search..." class="bg-transparent border-none text-sm focus:outline-none w-full placeholder:text-gray-400 text-gray-700">
          </div>
          
          <button class="h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors relative border border-gray-100">
            <BellIcon class="h-[18px] w-[18px]" />
            <span class="absolute top-2 right-2 h-2 w-2 bg-blue-500 ring-2 ring-white rounded-full"></span>
          </button>
          <button class="h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors border border-gray-100">
            <Cog6ToothIcon class="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth bg-gray-50/30">
        <slot />
      </main>
    </div>

    <!-- Logout Confirmation Modal -->
    <Teleport to="body" v-if="mounted">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showLogoutModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showLogoutModal = false" />
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div v-if="showLogoutModal" class="relative bg-white rounded-2xl w-full max-w-sm p-8 shadow-xl text-center space-y-5">
              <div class="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <ArrowLeftOnRectangleIcon class="h-7 w-7" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-1.5">Sign out of your account?</h3>
                <p class="text-sm text-gray-500">You will need to sign in again to access the admin console.</p>
              </div>
              <div class="flex space-x-3 pt-1">
                <button @click="showLogoutModal = false" class="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button @click="handleLogoutConfirm" class="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all">Sign out</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Global Confirmation Modal -->
    <UiBaseModal 
      :show="isVisible" 
      :title="options.title" 
      @close="handleCancel"
    >
      <div class="space-y-4 text-center">
        <div class="h-14 w-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <ExclamationTriangleIcon class="h-7 w-7" />
        </div>
        <p class="text-gray-500 font-medium leading-relaxed">
          {{ options.message }}
        </p>
      </div>

      <template #footer>
        <div class="flex items-center space-x-3 w-full">
          <UiBaseButton 
            variant="ghost" 
            block 
            @click="handleCancel"
          >
            {{ options.cancelText }}
          </UiBaseButton>
          <UiBaseButton 
            variant="primary" 
            block 
            class="!bg-red-500 !text-white hover:!bg-red-600 !shadow-none !border-none"
            @click="handleConfirm"
          >
            {{ options.confirmText }}
          </UiBaseButton>
        </div>
      </template>
    </UiBaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/modules/auth/useAuth'
import { useConfirmation } from '@/composables/core/useConfirmation'
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
  EnvelopeIcon,
  Bars3CenterLeftIcon,
  XMarkIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const isMobileMenuOpen = ref(false)
const showLogoutModal = ref(false)
const mounted = ref(false)
const { isVisible, options, handleConfirm, handleCancel } = useConfirmation()

onMounted(() => {
  mounted.value = true
})

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Agents', href: '/agents', icon: UsersIcon },
  { name: 'Agency management', href: '/tenants', icon: TenantIcon },
  { name: 'Staff accounts', href: '/users', icon: UsersIcon },
  { name: 'Bookings', href: '/bookings', icon: TicketIcon },
  { name: 'Revenue', href: '/revenue', icon: RevenueIcon },
  { name: 'File storage', href: '/storage', icon: FolderIcon },
  { name: 'Email templates', href: '/emails', icon: EnvelopeIcon },
  { name: 'Campaigns', href: '/campaigns', icon: EnvelopeIcon },
  { name: 'Fraud prevention', href: '/fraud', icon: ShieldExclamationIcon },
  { name: 'Roles & access', href: '/roles', icon: RolesIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

const isActive = (href: string) => {
  if (href === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(href)
}

const currentPageTitle = computed(() => {
  const item = navigation.find(n => isActive(n.href))
  return item ? item.name : 'Dashboard'
})

const { logout } = useAuth()
const handleLogoutConfirm = async () => {
  showLogoutModal.value = false
  await logout()
}
</script>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
