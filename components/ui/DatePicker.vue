<template>
  <div class="relative w-full">
    <label v-if="label" class="block text-sm  text-brand-gray  tracking-widest mb-2">
      {{ label }}
    </label>
    <div class="relative group">
      <CalendarDaysIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray group-focus-within:text-gray-900 transition-premium" />
      <input
        type="date"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-base font-medium text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-premium outline-none shadow-sm hover:border-brand-blue/30"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDaysIcon } from '@heroicons/vue/24/outline'

defineProps<{
  modelValue?: string
  label?: string
}>()

defineEmits(['update:modelValue'])
</script>
