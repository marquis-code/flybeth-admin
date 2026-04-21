<template>
  <Teleport to="body" v-if="mounted">
    <Transition
      enter-active-class="transition ease-out duration-500"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[100] overflow-hidden">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-md" @click="close" />
        
        <Transition
          enter-active-class="transition ease-out duration-500 transform"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition ease-in duration-400 transform"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div v-if="show" class="absolute inset-y-0 right-0 max-w-full flex">
            <div 
              :class="[
                size === 'full' ? 'w-screen' : 
                size === 'wide' ? 'w-screen max-w-4xl' : 
                'w-screen max-w-2xl'
              ]"
              class="bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] flex flex-col border-l border-gray-100 transition-premium overflow-hidden"
            >
              <!-- Header -->
              <div class="px-8 py-7 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
                <div>
                   <h2 class="text-xl font-bold text-gray-900 tracking-tight">{{ title }}</h2>
                   <div v-if="subtitle" class="text-xs font-medium text-gray-500 mt-1">{{ subtitle }}</div>
                </div>
                <button @click="close" class="h-10 w-10 flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-premium border border-transparent hover:border-red-100">
                  <XIcon class="h-5 w-5" />
                </button>
              </div>

              <!-- Content container with custom scrollbar -->
              <div class="flex-1 overflow-y-auto custom-scrollbar bg-white">
                 <div class="px-10 py-10">
                   <slot />
                 </div>
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer" class="px-10 py-8 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
                <slot name="footer" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { X as XIcon } from 'lucide-vue-next'

interface Props {
  show: boolean
  title: string
  subtitle?: string
  size?: 'md' | 'wide' | 'full'
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  subtitle: ''
})

const emit = defineEmits(['close'])
const close = () => emit('close')

const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f1f1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #e2e2e2;
}
</style>
