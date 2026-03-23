<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-blue/20 backdrop-blur-sm" @click.self="close">
        <div 
          class="bg-white rounded-[2rem] border border-gray-100 shadow-xl w-full max-w-lg overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="px-8 py-6 flex items-center justify-between border-b border-gray-50">
            <h3 class="text-xl  font-black text-brand-blue">{{ title }}</h3>
            <button @click="close" class="p-2 hover:bg-gray-100 rounded-full transition-premium">
              <XMarkIcon class="h-6 w-6 text-brand-gray" />
            </button>
          </div>
          
          <!-- Content -->
          <div class="px-8 py-6">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-8 py-6 bg-gray-50/50 flex justify-end space-x-3">
            <slot name="footer" />
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
