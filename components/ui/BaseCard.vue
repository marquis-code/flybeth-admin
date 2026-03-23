<template>
  <div 
    class="bg-white rounded-[2rem] shadow-sm border border-gray-100/80 overflow-hidden hover:shadow-xl hover:shadow-brand-blue/5 hover:border-brand-blue/10 transition-premium"
    :class="[padding ? 'p-8' : '']"
  >
    <div v-if="$slots.header || title" class="mb-6 flex items-center justify-between">
      <slot name="header">
        <h3 v-if="title" class="text-lg  font-black text-brand-blue">{{ title }}</h3>
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
