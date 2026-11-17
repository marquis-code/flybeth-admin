<template>
  <div class="relative overflow-hidden flex flex-col items-center justify-center py-10 px-6 text-center bg-gradient-to-b from-white via-slate-50/50 to-slate-50/80 rounded-2xl border border-dashed border-slate-200">
    <!-- Ambient subtle background glow -->
    <div class="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#0D1DAD]/[0.04] rounded-full blur-2xl"></div>

    <!-- Creative layered icon with pulsing ring -->
    <div class="relative mb-4">
      <div class="w-16 h-16 rounded-2xl bg-[#0D1DAD]/[0.08] border border-[#0D1DAD]/15 flex items-center justify-center shadow-sm">
        <slot name="icon">
          <svg class="w-8 h-8 text-[#0D1DAD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </slot>
      </div>
      <!-- Decorative floating accent dot -->
      <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#0D1DAD]/20 animate-ping"></span>
      <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#0D1DAD]"></span>
    </div>

    <!-- Creative Badge -->
    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#0D1DAD] bg-[#0D1DAD]/[0.07] mb-2 border border-[#0D1DAD]/10">
      ✦ No Data Recorded
    </span>

    <!-- Title & Description -->
    <h3 class="text-base font-bold text-slate-800 mb-1.5">{{ title || 'No records found' }}</h3>
    <p class="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
      {{ description || 'No activity or matching records were found. As new events occur or data is added, details will be securely logged and populated here.' }}
    </p>

    <!-- Slot for actions (e.g. Refresh, Add, Clear filters) -->
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { InboxIcon } from '@heroicons/vue/24/outline'

defineProps<{
  title?: string
  description?: string
}>()
</script>
