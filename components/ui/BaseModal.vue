<template>
  <Teleport to="body" :disabled="!isMounted">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enter-to-class="opacity-100 translate-y-0 sm:scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0 sm:scale-100"
      leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      <div v-if="show && isMounted" class="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/40 backdrop-blur-md" @click.self="close">
        <div class="flex min-h-full items-center justify-center p-4">
          <div 
            class="bg-white rounded-[2.5rem] border border-white/20 w-full shadow-none shadow-slate-900/20 relative"
          :class="maxWidth"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 flex items-center justify-between border-b border-gray-200">
            <h3 class="text-lg font-bold text-gray-900 ">{{ title }}</h3>
            <button @click="close" class="p-2 hover:bg-gray-100 rounded-2xl transition-premium text-gray-500 hover:text-gray-900">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          
          <!-- Content -->
          <div :class="contentClass || 'px-6 py-4'">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-6 py-4 bg-gray-50/50 rounded-b-[2.5rem] flex justify-end space-x-3">
            <slot name="footer" />
          </div>
        </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  show: boolean
  title: string
  maxWidth?: string
  contentClass?: string
}

withDefaults(defineProps<Props>(), {
  maxWidth: 'max-w-lg'
})

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

const emit = defineEmits(['close'])
const close = () => emit('close')
</script>
