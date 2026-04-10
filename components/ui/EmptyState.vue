<template>
  <div class="flex flex-col items-center justify-center p-12 text-center bg-white/50 backdrop-blur-sm rounded-[2rem] border border-dashed border-gray-200">
    <div class="h-20 w-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6 shadow-inner">
      <slot name="icon">
        <InboxIcon class="h-10 w-10 text-brand-gray/20" />
      </slot>
    </div>
    <h3 class="text-xl   text-brand-blue mb-2">{{ title || 'No data found' }}</h3>
    <p class="text-sm text-brand-gray/50 max-w-xs mx-auto mb-8 font-medium">
      {{ description || 'We couldn\'t find any records matching your criteria. Try adjusting your filters or search terms.' }}
    </p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
import { InboxIcon } from '@heroicons/vue/24/outline'

defineProps<{
  title?: string
  description?: string
}>()
</script>
