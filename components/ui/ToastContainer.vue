<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCustomToast, type ToastOptions } from '~/composables/core/useCustomToast'
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
    case 'success': return 'bg-white border-emerald-100'
    case 'error': return 'bg-white border-rose-100'
    case 'warning': return 'bg-white border-amber-100'
    case 'info': return 'bg-white border-sky-100'
    default: return 'bg-white border-gray-100'
  }
}

const getIconClasses = (type: string) => {
  switch (type) {
    case 'success': return 'text-emerald-500'
    case 'error': return 'text-rose-500'
    case 'warning': return 'text-amber-500'
    case 'info': return 'text-sky-500'
    default: return 'text-gray-500'
  }
}

const getProgressClasses = (type: string) => {
  switch (type) {
    case 'success': return 'bg-emerald-500'
    case 'error': return 'bg-rose-500'
    case 'warning': return 'bg-amber-500'
    case 'info': return 'bg-sky-500'
    default: return 'bg-gray-500'
  }
}

// Track timers for progress bar (optional refinement but let's keep it simple with CSS animations for now)

</script>

<template>
  <div 
    aria-live="assertive" 
    class="pointer-events-none fixed top-0 right-0 z-[100] flex w-full flex-col items-end space-y-4 p-4 sm:p-6 sm:w-auto"
  >
    <TransitionGroup 
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4 scale-95"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0 scale-100"
      leave-active-class="transition ease-in duration-200 absolute right-4 sm:right-6"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95 translate-x-4"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all duration-300 hover:shadow-emerald-500/10"
        :class="getTypeClasses(toast.toastType)"
      >
        <div class="relative p-4 sm:p-5">
          <div class="flex items-start">
            <div class="flex-shrink-0 pt-0.5">
              <div 
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-opacity-10"
                :class="[
                  toast.toastType === 'success' ? 'bg-emerald-500' : 
                  toast.toastType === 'error' ? 'bg-rose-500' :
                  toast.toastType === 'warning' ? 'bg-amber-500' :
                  'bg-sky-500'
                ]"
              >
                <component 
                  :is="getIcon(toast.toastType)" 
                  class="h-6 w-6" 
                  :class="getIconClasses(toast.toastType)" 
                  aria-hidden="true" 
                />
              </div>
            </div>
            <div class="ml-4 w-0 flex-1">
              <p class="text-[15px] font-bold text-gray-900 leading-tight">
                {{ toast.title }}
              </p>
              <p class="mt-1.5 text-sm font-medium text-gray-500 leading-relaxed">
                {{ toast.message }}
              </p>
            </div>
            <div class="ml-4 flex flex-shrink-0">
              <button 
                type="button" 
                @click="removeToast(toast.id!)"
                class="inline-flex rounded-lg p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-all duration-200"
              >
                <span class="sr-only">Close</span>
                <XMarkIcon class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="absolute bottom-0 left-0 h-1 w-full bg-gray-50">
            <div 
              class="h-full transition-all linear duration-[5000ms] progress-bar"
              :class="getProgressClasses(toast.toastType)"
              :style="{ animationDuration: (toast.duration || 5000) + 'ms' }"
            />
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.15);
}

.progress-bar {
  animation: shrink-width linear forwards;
}

@keyframes shrink-width {
  from { width: 100%; }
  to { width: 0%; }
}

/* Ensure absolute positioning during leave transition to prevent layout jumps */
.v-move {
  transition: transform 0.4s ease;
}
</style>
