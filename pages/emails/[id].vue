<template>
  <div class="space-y-10 max-w-6xl mx-auto pb-20">
    <!-- Implementation Notes -->
    <div class="bg-brand-blue/5 border border-brand-blue/10 rounded-3xl p-8 mb-4">
      <div class="flex items-start space-x-6">
        <div class="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-brand-blue flex-shrink-0">
          <InformationCircleIcon class="h-6 w-6" />
        </div>
        <div>
          <h4 class="text-lg font-bold text-gray-900 mb-1">Email Implementation Documentation</h4>
          <p class="text-sm text-gray-600 leading-relaxed mb-4">Email templates use a dynamic injection system. You can use curly braces to insert system data into your subject and body lines.</p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div v-for="v in template.availableVariables" :key="v" class="flex flex-col">
                <code class="text-[10px] font-bold text-brand-blue tracking-widest uppercase">{{ renderVariable(v) }}</code>
                <span class="text-[10px] text-gray-400 font-medium">Auto-injected variable</span>
             </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Header Section -->
    <div class="flex justify-between items-end">
      <div>
        <NuxtLink to="/emails" class="text-sm tracking-[0.4em] text-brand-green mb-4 flex items-center group cursor-pointer">
          <ChevronLeftIcon class="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-premium" />
          Back to templates
        </NuxtLink>
        <h1 class="text-2xl text-gray-900 tracking-tighter">
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
        <label class="text-sm tracking-[0.2em] text-brand-gray/50 ml-1">Template Name</label>
        <input 
          v-model="template.name" 
          type="text" 
          placeholder="e.g. Booking Confirmation"
          class="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-brand-blue/5 transition-premium outline-none"
        />
      </div>
      <div class="space-y-1">
        <label class="text-sm tracking-[0.2em] text-brand-gray/50 ml-1">System Slug (Unique Identifier)</label>
        <input 
          v-model="template.slug" 
          type="text" 
          :disabled="!isNew"
          placeholder="e.g. booking-confirmed"
          class="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-brand-blue/5 transition-premium outline-none disabled:opacity-50"
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
              <span class="ml-3 text-sm tracking-widest text-gray-900">{{ template.isActive ? 'Active' : 'Disabled' }}</span>
           </label>
        </div>
      </template>
    </AdminEmailEditor>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useNotifications } from '@/composables/modules/notifications/useNotifications'
import { 
  ChevronLeftIcon, 
  CloudArrowUpIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const isNew = computed(() => route.params.id === 'new')

const { 
  loading: fetching, 
  template: fetchedTemplate,
  fetchTemplateById, 
  saveTemplate 
} = useNotifications()

const saving = ref(false)

const template = ref({
  name: '',
  slug: '',
  subject: '',
  htmlContent: '',
  availableVariables: ['firstName', 'lastName', 'pnr', 'destination', 'amount', 'currency', 'checkoutUrl', 'paymentUrl'],
  isActive: true
})

const renderVariable = (v: string) => `{{${v}}}`

const fetchTemplate = async () => {
  if (isNew.value) return
  await fetchTemplateById(route.params.id as string)
}

const handleSave = async () => {
  saving.value = true
  const res = await saveTemplate(template.value, isNew.value ? undefined : route.params.id as string)
  if (res) {
    navigateTo('/emails')
  }
  saving.value = false
}

// Ensure local structure is synced if fetchedTemplate updates
watch(fetchedTemplate, (val) => {
  if (val) {
    template.value = { ...val }
  }
}, { immediate: true })

onMounted(fetchTemplate)
</script>