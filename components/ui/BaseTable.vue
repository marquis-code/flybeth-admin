<template>
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
                class="px-6 py-5 text-left text-sm font-black text-brand-gray/40 uppercase tracking-[0.2em]"
                :class="column.class"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 bg-white">
            <template v-if="items && items.length > 0">
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
                    <span class="text-sm font-bold text-brand-blue">{{ item[column.key] || 'N/A' }}</span>
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
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
  class?: string
  tdClass?: string
}

defineProps<{
  columns: Column[]
  items: any[]
  emptyTitle?: string
  emptyDescription?: string
}>()
</script>
