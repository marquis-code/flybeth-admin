<template>
  <div class="relative">
    <button 
      @click="isOpen = !isOpen"
      class="h-10 w-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition-all relative border border-gray-100 shadow-sm"
      :class="{ 'bg-blue-50 text-blue-600 border-blue-100': isOpen }"
    >
      <BellIcon class="h-5 w-5" />
      <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 ring-4 ring-white rounded-full flex items-center justify-center text-[10px]  text-white shadow-lg animate-bounce">
        {{ unreadCount }}
      </span>
    </button>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div v-if="isOpen" class="absolute right-0 mt-3 w-[420px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-[100] overflow-hidden origin-top-right">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 class="text-base  text-gray-900 leading-tight">Intelligence Stream</h3>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Real-time Operations Logic</p>
          </div>
          <button @click="markAllAsRead" class="text-[10px]  text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg transition-all">
            Dismiss All
          </button>
        </div>

        <div class="max-h-[480px] overflow-y-auto custom-scrollbar">
          <div v-if="notifications.length === 0" class="p-12 text-center flex flex-col items-center justify-center">
             <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <BellSlashIcon class="h-8 w-8 text-gray-200" />
             </div>
             <p class="text-sm font-bold text-gray-400 ">No operational alerts triggered</p>
          </div>
          
          <div v-else class="divide-y divide-gray-50">
            <div 
              v-for="n in notifications" 
              :key="n._id"
              class="p-6 hover:bg-gray-50/50 transition-colors cursor-pointer group relative"
              @click="handleNotificationClick(n)"
              :class="{ 'bg-blue-50/30': !n.isRead }"
            >
              <div v-if="!n.isRead" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
              
              <div class="flex gap-4">
                <div class="h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center border shadow-sm" :class="getTypeClass(n.type)">
                   <component :is="getTypeIcon(n.type)" class="h-5 w-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-xs  text-gray-900 truncate">{{ n.title }}</p>
                    <span class="text-[9px] font-bold text-gray-400 whitespace-nowrap ml-2">{{ formatTime(n.createdAt) }}</span>
                  </div>
                  <p class="text-[13px] text-gray-500 leading-relaxed line-clamp-2 font-medium">{{ n.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-gray-50/50 border-t border-gray-100">
           <NuxtLink to="/settings" class="block w-full text-center py-3 text-[11px]  text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">
              Configure Notification Matrices
           </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { 
  BellIcon, 
  BellSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChatBubbleLeftIcon,
  TicketIcon
} from '@heroicons/vue/24/outline'
import { useRealtime } from '@/composables/core/useRealtime'

const isOpen = ref(false)
const { notifications, connect, socket } = useRealtime()

onMounted(() => {
  connect()
  // Close dropdown on click outside
  window.addEventListener('click', closeOnClickOutside)
})

onUnmounted(() => {
    window.removeEventListener('click', closeOnClickOutside)
})

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

const closeOnClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (isOpen.value && !target.closest('.relative')) {
        isOpen.value = false;
    }
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const getTypeIcon = (type: string) => {
  switch(type) {
    case 'booking_confirmed': return TicketIcon
    case 'payment_success': return CheckCircleIcon
    case 'payment_failed': return ExclamationTriangleIcon
    case 'chat_message': return ChatBubbleLeftIcon
    default: return InformationCircleIcon
  }
}

const getTypeClass = (type: string) => {
  switch(type) {
    case 'booking_confirmed': return 'bg-green-50 text-green-600 border-green-100'
    case 'payment_success': return 'bg-blue-50 text-blue-600 border-blue-100'
    case 'payment_failed': return 'bg-red-50 text-red-600 border-red-100'
    default: return 'bg-gray-50 text-gray-500 border-gray-100'
  }
}

const handleNotificationClick = (n: any) => {
  n.isRead = true
  // Navigate if has data.url
  if (n.data?.url) {
    useRouter().push(n.data.url)
    isOpen.value = false
  }
}

const markAllAsRead = () => {
    notifications.value.forEach(n => n.isRead = true)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
}
</style>
