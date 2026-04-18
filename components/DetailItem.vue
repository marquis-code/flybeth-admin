<template>
  <div class="space-y-1">
    <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">{{ label }}</p>
    <div class="flex items-center gap-2">
      <a v-if="link && value" :href="formatLink(value)" target="_blank" class="text-base font-semibold text-blue-600 hover:text-blue-700 hover:underline break-all">
        {{ value }}
      </a>
      <p v-else class="text-base font-semibold text-gray-900 break-all">{{ value || 'N/A' }}</p>
    </div>
    <p v-if="sub" class="text-base font-medium text-gray-400">{{ sub }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: any
  sub?: string
  link?: boolean
}>()

const formatLink = (url: string) => {
  if (!url) return '#'
  if (!/^https?:\/\//i.test(url)) return `https://${url}`
  return url
}
</script>
