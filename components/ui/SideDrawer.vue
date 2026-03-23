<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-in-out duration-500"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition ease-in-out duration-500"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div v-if="show" class="fixed inset-0 z-[100] overflow-hidden">
        <div class="absolute inset-0 bg-brand-blue/10 backdrop-blur-[2px]" @click="close" />
        
        <div class="absolute inset-y-0 right-0 max-w-full flex">
          <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-100">
            <!-- Header -->
            <div class="px-8 py-6 flex items-center justify-between border-b border-gray-50">
              <h2 class="text-2xl  font-black text-brand-blue">{{ title }}</h2>
              <button @click="close" class="p-2 hover:bg-gray-100 rounded-full transition-premium">
                <XMarkIcon class="h-6 w-6 text-brand-gray" />
              </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto px-8 py-6">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="px-8 py-6 border-t border-gray-50 bg-gray-50/30">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

defineProps<{
  show: boolean
  title: string
}>()

const emit = defineEmits(['close'])
const close = () => emit('close')
</script>
