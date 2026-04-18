<template>
  <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100/50">
    <div class="flex items-center gap-3">
      <div :class="['p-1.5 rounded-lg', active ? 'bg-emerald-50' : 'bg-gray-100']">
        <component :is="iconComponent" class="h-4 w-4" :class="active ? 'text-emerald-500' : 'text-gray-400'" />
      </div>
      <span class="text-sm font-bold" :class="active ? 'text-gray-700' : 'text-gray-400'">{{ label }}</span>
    </div>
    <div v-if="active" class="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500">
      <CheckIcon class="h-3 w-3 text-white font-bold" />
    </div>
    <div v-else class="h-5 w-5 border-2 border-dashed border-gray-200 rounded-full"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as Icons from '@heroicons/vue/24/solid'

const props = defineProps<{
  label: string
  icon: string
  active: boolean
}>()

const iconComponent = computed(() => (Icons as any)[props.icon])
const CheckIcon = Icons.CheckIcon
</script>
