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
        class="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-base font-medium text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-premium outline-none shadow-none hover:border-brand-blue/30 bg-transparent"
        placeholder="Select date"
      ></flat-pickr>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDaysIcon } from '@heroicons/vue/24/outline'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'

const props = defineProps<{
  modelValue?: string | Date
  label?: string
}>()

const emit = defineEmits(['update:modelValue'])

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const config = {
  dateFormat: 'Y-m-d',
}
</script>

<style>
.flatpickr-calendar {
  border-radius: 1.5rem !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01) !important;
  padding: 10px !important;
  font-family: inherit !important;
}
.flatpickr-day.selected, .flatpickr-day.startRange, .flatpickr-day.endRange, .flatpickr-day.selected.inRange, .flatpickr-day.startRange.inRange, .flatpickr-day.endRange.inRange, .flatpickr-day.selected:focus, .flatpickr-day.startRange:focus, .flatpickr-day.endRange:focus, .flatpickr-day.selected:hover, .flatpickr-day.startRange:hover, .flatpickr-day.endRange:hover, .flatpickr-day.selected.prevMonthDay, .flatpickr-day.startRange.prevMonthDay, .flatpickr-day.endRange.prevMonthDay, .flatpickr-day.selected.nextMonthDay, .flatpickr-day.startRange.nextMonthDay, .flatpickr-day.endRange.nextMonthDay {
  background: #111827 !important;
  border-color: #111827 !important;
}
.flatpickr-day.inRange, .flatpickr-day.prevMonthDay.inRange, .flatpickr-day.nextMonthDay.inRange, .flatpickr-day.today.inRange, .flatpickr-day.prevMonthDay.today.inRange, .flatpickr-day.nextMonthDay.today.inRange, .flatpickr-day:hover, .flatpickr-day.prevMonthDay:hover, .flatpickr-day.nextMonthDay:hover, .flatpickr-day:focus, .flatpickr-day.prevMonthDay:focus, .flatpickr-day.nextMonthDay:focus {
  background: #f3f4f6 !important;
  border-color: #f3f4f6 !important;
}
</style>
