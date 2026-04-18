<template>
  <div 
    class="bg-white rounded-3xl border border-gray-100/80 overflow-hidden hover:border-brand-blue/20 transition-premium"
    :class="[padding ? 'p-8' : '']"
  >
    <div v-if="$slots.header || title" class="mb-6 flex items-center justify-between">
      <slot name="header">
        <h3 v-if="title" class="text-lg font-bold text-gray-900">{{ title }}</h3>
      </slot>
    </div>
    
    <slot />

    <div v-if="$slots.footer" class="mt-8 pt-6 border-t border-gray-50">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  padding?: boolean
}>()
</script>
