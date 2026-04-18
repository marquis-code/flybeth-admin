<template>
  <div class="flex flex-col space-y-2">
    <label v-if="label" class="text-sm   tracking-widest text-gray-500 ml-1">
      {{ label }}
    </label>
    <div class="flex items-center justify-between gap-2 md:gap-4">
      <input
        v-for="(digit, index) in digits"
        :key="index"
        ref="inputRefs"
        v-model="digits[index]"
        type="text"
        maxlength="1"
        class="w-full h-12 md:h-14 text-center text-xl  text-gray-900 bg-gray-50 border-2 border-transparent rounded-xl focus:border-brand-blue focus:bg-white outline-none transition-all"
        @input="handleInput($event, index)"
        @keydown.delete="handleDelete($event, index)"
        @paste="handlePaste"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  length: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['update:modelValue'])

const digits = ref(new Array(props.length).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])

// Sync digits with modelValue
watch(() => props.modelValue, (newVal) => {
  if (newVal === '') {
    digits.value = new Array(props.length).fill('')
  } else if (newVal.length === props.length) {
    digits.value = newVal.split('')
  }
}, { immediate: true })

const updateModel = () => {
  emit('update:modelValue', digits.value.join(''))
}

const handleInput = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement
  const value = input.value

  if (value && index < props.length - 1) {
    inputRefs.value[index + 1]?.focus()
  }
  
  updateModel()
}

const handleDelete = (event: KeyboardEvent, index: number) => {
  if (!digits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pasteData = event.clipboardData?.getData('text').slice(0, props.length)
  if (pasteData) {
    digits.value = pasteData.split('').concat(new Array(props.length - pasteData.length).fill(''))
    updateModel()
    // Focus last filled or next empty
    const nextIndex = Math.min(pasteData.length, props.length - 1)
    inputRefs.value[nextIndex]?.focus()
  }
}
</script>
