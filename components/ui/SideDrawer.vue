<template>
  <Teleport to="body" v-if="mounted">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[100] overflow-hidden">
        <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="close" />
        
        <Transition
          enter-active-class="transition ease-out duration-300 transform"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition ease-in duration-200 transform"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div v-if="show" class="absolute inset-y-0 right-0 max-w-full flex">
            <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-100">
              <!-- Header -->
              <div class="px-6 py-5 flex items-center justify-between border-b border-gray-100">
                <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
                <button @click="close" class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <XMarkIcon class="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <!-- Content -->
              <div class="flex-1 overflow-y-auto px-6 py-5">
                <slot />
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
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
import { XMarkIcon } from '@heroicons/vue/24/outline'

defineProps<{
  show: boolean
  title: string
}>()

const emit = defineEmits(['close'])
const close = () => emit('close')

const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
</script>
