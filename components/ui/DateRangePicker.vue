<template>
  <div class="relative w-full">
    <label v-if="label" class="block text-sm text-brand-gray mb-2">
      {{ label }}
    </label>
    <div class="relative group">
      <CalendarDaysIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray group-focus-within:text-gray-900 transition-premium z-10 pointer-events-none" />
      <flat-pickr
        v-model="internalValue"
        :config="config"
        class="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-base font-medium text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-premium outline-none shadow-none hover:border-brand-blue/30 bg-transparent cursor-pointer"
        placeholder="Select date range"
      ></flat-pickr>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CalendarDaysIcon } from '@heroicons/vue/24/outline'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'

const props = defineProps<{
  modelValue?: { start: string, end: string } | null
  label?: string
}>()

const emit = defineEmits(['update:modelValue', 'apply'])

// Parse the incoming object to a string like "2025-02-10 to 2025-02-15"
const initString = () => {
  if (props.modelValue && props.modelValue.start && props.modelValue.end) {
    return `${props.modelValue.start.split('T')[0]} to ${props.modelValue.end.split('T')[0]}`
  }
  return ''
}

const internalValue = ref(initString())

watch(() => props.modelValue, () => {
  internalValue.value = initString()
}, { deep: true })

const config = {
  mode: 'range',
  dateFormat: 'Y-m-d',
  onChange: function(selectedDates: Date[], dateStr: string) {
    if (selectedDates.length === 2) {
      const start = new Date(selectedDates[0].getTime() - selectedDates[0].getTimezoneOffset() * 60000).toISOString()
      const end = new Date(selectedDates[1].getTime() - selectedDates[1].getTimezoneOffset() * 60000).toISOString()
      const range = { start, end }
      emit('update:modelValue', range)
      emit('apply', range)
    }
  }
}
</script>

<style>
/* flatpickr overrides handled globally in DatePicker.vue */
</style>
