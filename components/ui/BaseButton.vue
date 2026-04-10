<template>
  <button
    :disabled="loading"
    :class="[
      'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-4',
      variantClasses,
      sizeClasses,
      block ? 'w-full' : '',
      loading ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''
    ]"
    v-bind="$attrs"
  >
    <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'green', 'outline', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  block: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-brand-blue text-white hover:bg-brand-blue/90 focus:ring-brand-blue/20'
    case 'green':
      return 'bg-brand-green text-white hover:bg-brand-green/90 focus:ring-brand-green/20'
    case 'secondary':
      return 'bg-brand-blue/5 text-brand-blue hover:bg-brand-blue/10 focus:ring-brand-blue/20'
    case 'outline':
      return 'border-2 border-brand-blue/20 text-brand-blue bg-white hover:border-brand-blue/40 focus:ring-brand-blue/20'
    case 'ghost':
      return 'text-brand-gray hover:bg-gray-100 focus:ring-gray-200'
    default:
      return ''
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-5 py-2.5 text-sm'
    case 'lg':
      return 'px-10 py-4 text-sm'
    default:
      return 'px-8 py-3 text-xs'
  }
})
</script>
