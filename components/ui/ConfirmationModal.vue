<template>
  <UiBaseModal 
    :show="isVisible" 
    :title="options.title" 
    @close="handleCancel"
  >
    <div class="space-y-4 text-center">
      <div v-if="options.variant === 'danger'" class="h-14 w-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <ExclamationTriangleIcon class="h-7 w-7" />
      </div>
      <div v-else-if="options.variant === 'warning'" class="h-14 w-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <ExclamationCircleIcon class="h-7 w-7" />
      </div>
      <div v-else class="h-14 w-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <InformationCircleIcon class="h-7 w-7" />
      </div>
      
      <p class="text-gray-500 font-medium leading-relaxed">
        {{ options.message }}
      </p>
    </div>

    <template #footer>
      <div class="flex items-center space-x-3 w-full">
        <UiBaseButton 
          v-if="options.cancelText"
          variant="ghost" 
          block 
          @click="handleCancel"
        >
          {{ options.cancelText }}
        </UiBaseButton>
        <UiBaseButton 
          variant="primary" 
          block 
          :class="[
            options.variant === 'danger' ? '!bg-red-500 hover:!bg-red-600' : 
            options.variant === 'warning' ? '!bg-amber-500 hover:!bg-amber-600' : ''
          ]"
          class="!text-white !shadow-none !border-none"
          @click="handleConfirm"
        >
          {{ options.confirmText }}
        </UiBaseButton>
      </div>
    </template>
  </UiBaseModal>
</template>

<script setup lang="ts">
import { useConfirmation } from '@/composables/core/useConfirmation'
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon 
} from '@heroicons/vue/24/outline'

const { isVisible, options, handleConfirm, handleCancel } = useConfirmation()
</script>
