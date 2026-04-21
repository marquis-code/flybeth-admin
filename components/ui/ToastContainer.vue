<script setup lang="ts">
import { ref } from 'vue'
import { useCustomToast } from '~/composables/core/useCustomToast'
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/vue/24/outline'

const { toasts, removeToast } = useCustomToast()

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return CheckCircleIcon
    case 'error': return XCircleIcon
    case 'warning': return ExclamationCircleIcon
    case 'info': return InformationCircleIcon
    default: return InformationCircleIcon
  }
}

const getTypeClasses = (type: string) => {
  switch (type) {
    case 'success': return 'border-emerald-100 shadow-emerald-500/10'
    case 'error': return 'border-rose-100 shadow-rose-500/10'
    case 'warning': return 'border-amber-100 shadow-amber-500/10'
    case 'info': return 'border-sky-100 shadow-sky-500/10'
    default: return 'border-gray-100 shadow-gray-500/10'
  }
}

const getIconBg = (type: string) => {
  switch (type) {
    case 'success': return 'bg-emerald-50 text-emerald-500'
    case 'error': return 'bg-rose-50 text-rose-500'
    case 'warning': return 'bg-amber-50 text-amber-500'
    case 'info': return 'bg-sky-50 text-sky-500'
    default: return 'bg-gray-50 text-gray-400'
  }
}

const getProgressColor = (type: string) => {
  switch (type) {
    case 'success': return 'bg-emerald-500'
    case 'error': return 'bg-rose-500'
    case 'warning': return 'bg-amber-500'
    case 'info': return 'bg-sky-500'
    default: return 'bg-gray-400'
  }
}
</script>

<template>
  <div 
    aria-live="assertive" 
    class="pointer-events-none fixed top-0 right-0 z-[999] flex w-full flex-col items-center gap-4 p-4 sm:items-end sm:p-6"
  >
    <TransitionGroup 
      enter-active-class="transform ease-out duration-400 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-12 scale-95"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0 scale-100"
      leave-active-class="transition ease-in duration-300 absolute"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 translate-x-12 scale-95"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="pointer-events-auto w-full max-w-[380px] overflow-hidden rounded-3xl border bg-white/95 backdrop-blur-xl shadow-2xl transition-all duration-300"
        :class="getTypeClasses(toast.toastType)"
      >
        <div class="relative p-5 pr-10">
          <div class="flex gap-4">
            <!-- Icon -->
            <div class="flex-shrink-0">
              <div 
                class="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110"
                :class="getIconBg(toast.toastType)"
              >
                <component 
                  :is="getIcon(toast.toastType)" 
                  class="h-7 w-7" 
                  aria-hidden="true" 
                />
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0 pt-1">
              <h3 class="text-base font-black text-gray-900 tracking-tight leading-none mb-1">
                {{ toast.title }}
              </h3>
              <p class="text-sm font-medium text-gray-500 leading-snug">
                {{ toast.message }}
              </p>
            </div>
          </div>

          <!-- Close Button -->
          <button 
            type="button" 
            @click="removeToast(toast.id!)"
            class="absolute top-4 right-4 inline-flex items-center justify-center h-8 w-8 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-all duration-200"
          >
            <span class="sr-only">Close</span>
            <XMarkIcon class="h-5 w-5" aria-hidden="true" />
          </button>
          
          <!-- Progress Bar -->
          <div class="absolute bottom-0 left-0 h-[3px] w-full bg-gray-50/50">
            <div 
              class="h-full progress-bar opacity-60"
              :class="getProgressColor(toast.toastType)"
              :style="{ animationDuration: (toast.duration || 5000) + 'ms' }"
            />
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.progress-bar {
  animation: shrink-width linear forwards;
}

@keyframes shrink-width {
  from { width: 100%; }
  to { width: 0%; }
}

.shadow-2xl {
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.1);
}

.v-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
