<template>
  <div>
    <div class="overflow-x-auto custom-scrollbar -mx-4 md:mx-0">
      <div class="inline-block min-w-full align-middle p-4 md:p-0">
        <div class="overflow-hidden border border-gray-100 rounded-[2rem] bg-white shadow-sm">
          <table class="min-w-full divide-y divide-gray-50">
            <thead class="bg-gray-50/50">
              <tr>
                <th 
                  v-for="column in columns" 
                  :key="column.key"
                  scope="col" 
                  class="px-6 py-5 text-left text-sm  text-gray-500  tracking-[0.2em]"
                  :class="column.class"
                >
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 bg-white">
              <!-- Loading skeleton -->
              <template v-if="loading">
                <tr v-for="i in (meta?.limit || 10)" :key="'skeleton-' + i" class="animate-pulse">
                  <td v-for="column in columns" :key="column.key" class="px-6 py-5">
                    <div class="h-4 bg-gray-100 rounded-lg w-3/4"></div>
                  </td>
                </tr>
              </template>
              <template v-else-if="items && items.length > 0">
                <tr 
                  v-for="(item, index) in items" 
                  :key="index"
                  class="hover:bg-brand-blue/[0.02] transition-colors"
                >
                  <td 
                    v-for="column in columns" 
                    :key="column.key"
                    class="px-6 py-5 whitespace-nowrap"
                    :class="column.tdClass"
                  >
                    <slot :name="`cell(${column.key})`" :item="item">
                      <span class="text-sm font-bold text-gray-900">{{ item[column.key] || 'N/A' }}</span>
                    </slot>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td :colspan="columns.length" class="p-0">
                  <UiEmptyState :title="emptyTitle" :description="emptyDescription" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pagination Bar -->
    <div v-if="meta && meta.totalPages > 1" class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      <!-- Results summary -->
      <div class="text-sm text-gray-400 font-medium">
        Showing 
        <span class="text-gray-700 font-semibold">{{ rangeStart }}</span>
        –
        <span class="text-gray-700 font-semibold">{{ rangeEnd }}</span>
        of 
        <span class="text-gray-700 font-semibold">{{ meta.total }}</span>
        results
      </div>

      <!-- Pagination controls -->
      <div class="flex items-center gap-1.5">
        <!-- Prev -->
        <button
          @click="goToPage(meta.page - 1)"
          :disabled="!meta.hasPrevPage"
          class="h-9 w-9 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>

        <!-- First page -->
        <button
          v-if="visiblePages[0] > 1"
          @click="goToPage(1)"
          class="h-9 w-9 flex items-center justify-center rounded-xl text-base font-semibold transition-all border border-gray-100 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          1
        </button>
        <span v-if="visiblePages[0] > 2" class="text-gray-500 px-1 text-sm">…</span>

        <!-- Page numbers -->
        <button
          v-for="pageNum in visiblePages"
          :key="pageNum"
          @click="goToPage(pageNum)"
          :class="[
            'h-9 min-w-[36px] px-2 flex items-center justify-center rounded-xl text-base font-semibold transition-all border',
            pageNum === meta.page
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
              : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50 hover:text-gray-700'
          ]"
        >
          {{ pageNum }}
        </button>

        <!-- Last page -->
        <span v-if="visiblePages[visiblePages.length - 1] < meta.totalPages - 1" class="text-gray-500 px-1 text-sm">…</span>
        <button
          v-if="visiblePages[visiblePages.length - 1] < meta.totalPages"
          @click="goToPage(meta.totalPages)"
          class="h-9 w-9 flex items-center justify-center rounded-xl text-base font-semibold transition-all border border-gray-100 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          {{ meta.totalPages }}
        </button>

        <!-- Next -->
        <button
          @click="goToPage(meta.page + 1)"
          :disabled="!meta.hasNextPage"
          class="h-9 w-9 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>

      <!-- Per-page selector -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-400 font-medium">Per page</span>
        <select 
          :value="meta.limit" 
          @change="$emit('update:limit', Number(($event.target as HTMLSelectElement).value))"
          class="h-9 px-2 bg-white border border-gray-100 rounded-xl text-base font-semibold text-gray-600 outline-none focus:border-blue-600 cursor-pointer"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </div>

    <!-- Simple results count for single page -->
    <div v-else-if="meta && items?.length > 0" class="mt-4 px-2">
      <p class="text-sm text-gray-400 font-medium">
        Showing all <span class="text-gray-700 font-semibold">{{ meta.total }}</span> results
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

interface Column {
  key: string
  label: string
  class?: string
  tdClass?: string
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

const props = defineProps<{
  columns: Column[]
  items: any[]
  meta?: PaginationMeta
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  pageSizeOptions?: number[]
}>()

const emit = defineEmits(['page-change', 'update:limit'])

const pageSizes = computed(() => props.pageSizeOptions || [10, 20, 50, 100])

const rangeStart = computed(() => {
  if (!props.meta) return 0
  return (props.meta.page - 1) * props.meta.limit + 1
})

const rangeEnd = computed(() => {
  if (!props.meta) return 0
  return Math.min(props.meta.page * props.meta.limit, props.meta.total)
})

const visiblePages = computed(() => {
  if (!props.meta) return []
  const { page, totalPages } = props.meta
  const range: number[] = []
  const delta = 2

  const start = Math.max(2, page - delta)
  const end = Math.min(totalPages - 1, page + delta)

  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  // Ensure current page is always visible even for edge cases
  if (totalPages <= 1) return [1]
  if (!range.includes(page) && page > 1 && page < totalPages) {
    range.push(page)
    range.sort((a, b) => a - b)
  }

  return range
})

const goToPage = (page: number) => {
  if (!props.meta) return
  if (page < 1 || page > props.meta.totalPages) return
  emit('page-change', page)
}
</script>
