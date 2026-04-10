<template>
  <div class="space-y-10 max-w-6xl mx-auto">
    <!-- Header Section -->
    <div class="flex justify-between items-end">
      <div>
        <NuxtLink to="/emails" class="text-sm  uppercase tracking-[0.4em] text-brand-green mb-4 flex items-center group cursor-pointer">
          <ChevronLeftIcon class="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-premium" />
          Back to templates
        </NuxtLink>
        <h1 class="text-5xl   text-brand-blue tracking-tighter">
          {{ isNew ? 'Create New' : 'Edit' }} Template
        </h1>
      </div>
      <div class="flex gap-4">
        <UiBaseButton variant="secondary" @click="navigateTo('/emails')">Cancel</UiBaseButton>
        <UiBaseButton variant="primary" @click="handleSave" :loading="saving">
          <CloudArrowUpIcon class="h-4 w-4 mr-2" />
          {{ isNew ? 'Create Protocol' : 'Update Template' }}
        </UiBaseButton>
      </div>
    </div>

    <!-- Template Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="space-y-1">
        <label class="text-sm  uppercase tracking-[0.2em] text-brand-gray/50 ml-1">Template Name</label>
        <input 
          v-model="template.name" 
          type="text" 
          placeholder="e.g. Booking Confirmation"
          class="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-premium outline-none shadow-sm"
        />
      </div>
      <div class="space-y-1">
        <label class="text-sm  uppercase tracking-[0.2em] text-brand-gray/50 ml-1">System Slug (Unique Identifier)</label>
        <input 
          v-model="template.slug" 
          type="text" 
          :disabled="!isNew"
          placeholder="e.g. booking-confirmed"
          class="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-premium outline-none shadow-sm disabled:opacity-50"
        />
      </div>
    </div>

    <!-- Editor -->
    <AdminEmailEditor 
      v-model="template" 
      :variables="['firstName', 'lastName', 'pnr', 'destination', 'amount', 'currency', 'checkoutUrl', 'paymentUrl']"
    >
      <template #actions>
        <div class="flex items-center gap-4 mr-4 border-r border-gray-100 pr-4">
           <label class="flex items-center cursor-pointer group">
              <input type="checkbox" v-model="template.isActive" class="hidden" />
              <div class="h-6 w-11 bg-gray-200 rounded-full relative transition-premium" :class="{ 'bg-brand-green': template.isActive }">
                <div class="absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-premium" :class="{ 'translate-x-5': template.isActive }" />
              </div>
              <span class="ml-3 text-sm  uppercase tracking-widest text-brand-blue">{{ template.isActive ? 'Active' : 'Disabled' }}</span>
           </label>
        </div>
      </template>
    </AdminEmailEditor>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { 
  ChevronLeftIcon, 
  CloudArrowUpIcon 
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const { get, post, patch } = useApi()
const isNew = computed(() => route.params.id === 'new')
const saving = ref(false)

const template = ref({
  name: '',
  slug: '',
  subject: '',
  htmlContent: '',
  availableVariables: ['firstName', 'lastName', 'pnr', 'destination', 'amount', 'currency', 'checkoutUrl', 'paymentUrl'],
  isActive: true
})

const fetchTemplate = async () => {
  if (isNew.value) return
  const { data, error } = await get(`/notifications/templates/${route.params.id}`)
  if (data) {
    template.value = data as any
  }
}

const handleSave = async () => {
  saving.value = true
  const { data, error } = isNew.value 
    ? await post('/notifications/templates', template.value)
    : await patch(`/notifications/templates/${route.params.id}`, template.value)
  
  if (data) {
    navigateTo('/emails')
  }
  saving.value = false
}

onMounted(fetchTemplate)
</script>
