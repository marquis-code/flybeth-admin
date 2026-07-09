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
                <code class="text-sm font-bold text-brand-blue  uppercase">{{ renderVariable(v) }}</code>
                <span class="text-sm text-gray-400 font-medium">Auto-injected variable</span>
             </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Header Section -->
    <div class="flex justify-between items-end">
      <div>
        <NuxtLink to="/dashboard/emails" class="text-sm  text-brand-green mb-4 flex items-center group cursor-pointer">
          <ChevronLeftIcon class="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-premium" />
          Back to templates
        </NuxtLink>
        <h1 class="text-2xl text-gray-900 er">
          {{ isNew ? 'Create New' : 'Edit' }} Template
        </h1>
      </div>
      <div class="flex gap-4">
        <UiBaseButton variant="secondary" @click="showPreviewModal = true" class="h-14 font-bold border-gray-200">
           <EyeIcon class="h-5 w-5 mr-2" />
           Preview
        </UiBaseButton>
        <UiBaseButton v-if="!isNew" variant="danger" @click="handleDelete" :loading="deleting" class="!bg-red-500 !text-white hover:!bg-red-600 !border-red-500 h-14 font-bold">Delete</UiBaseButton>
        <UiBaseButton variant="secondary" @click="navigateTo('/dashboard/emails')" class="h-14 font-bold">Cancel</UiBaseButton>
        <UiBaseButton variant="primary" @click="handleSave" :loading="saving" class="h-14 font-bold min-w-[180px] bg-gray-900 text-white shadow-none">
          <CloudArrowUpIcon class="h-4 w-4 mr-2" />
          {{ isNew ? 'Create Protocol' : 'Update Template' }}
        </UiBaseButton>
      </div>
    </div>

    <!-- Template Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="space-y-1">
        <label class="text-sm  text-brand-gray/50 ml-1">Template Name</label>
        <input 
          v-model="template.name" 
          type="text" 
          placeholder="e.g. Booking Confirmation"
          class="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-brand-blue/5 transition-premium outline-none"
        />
      </div>
      <div class="space-y-1">
        <label class="text-sm  text-brand-gray/50 ml-1">System Slug (Unique Identifier)</label>
        <input 
          v-model="template.slug" 
          type="text" 
          :disabled="!isNew"
          placeholder="e.g. booking-confirmed"
          class="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-brand-blue/5 transition-premium outline-none disabled:opacity-50"
        />
      </div>
    </div>

    <!-- Editor -->
    <AdminEmailEditor 
      v-model="template" 
      :variables="['firstName', 'lastName', 'pnr', 'destination', 'amount', 'currency', 'checkoutUrl', 'paymentUrl']"
    >
      <template #actions>
        <div class="flex items-center gap-4 mr-4 border-r border-gray-200 pr-4">
           <label class="flex items-center cursor-pointer group">
              <input type="checkbox" v-model="template.isActive" class="hidden" />
              <div class="h-6 w-11 bg-gray-200 rounded-full relative transition-premium" :class="{ 'bg-brand-green': template.isActive }">
                <div class="absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-premium" :class="{ 'translate-x-5': template.isActive }" />
              </div>
              <span class="ml-3 text-sm  text-gray-900">{{ template.isActive ? 'Active' : 'Disabled' }}</span>
           </label>
        </div>
      </template>
    </AdminEmailEditor>

    <!-- Preview Modal -->
    <UiBaseModal :show="showPreviewModal" @close="showPreviewModal = false" title="Template Preview" maxWidth="max-w-5xl">
       <div class="flex flex-col h-[75vh]">
          <!-- Device Toggle -->
          <div class="flex justify-center mb-6">
             <div class="bg-gray-100 p-1.5 rounded-2xl inline-flex border border-gray-200 shadow-none">
                <button 
                  @click="previewDevice = 'mobile'"
                  class="px-6 py-2.5 rounded-xl text-sm font-bold transition-premium shadow-none"
                  :class="previewDevice === 'mobile' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900'"
                >Mobile</button>
                <button 
                  @click="previewDevice = 'tablet'"
                  class="px-6 py-2.5 rounded-xl text-sm font-bold transition-premium shadow-none"
                  :class="previewDevice === 'tablet' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900'"
                >Tablet</button>
                <button 
                  @click="previewDevice = 'desktop'"
                  class="px-6 py-2.5 rounded-xl text-sm font-bold transition-premium shadow-none"
                  :class="previewDevice === 'desktop' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900'"
                >Desktop</button>
             </div>
          </div>
          
          <div class="flex-1 bg-gray-50 rounded-[2.5rem] p-6 overflow-y-auto border border-gray-200 flex justify-center items-start shadow-inner">
             <iframe 
                v-if="template.htmlContent"
                :srcdoc="template.htmlContent" 
                class="bg-white rounded-2xl shadow-sm transition-all duration-300 ease-in-out min-h-[800px] border border-gray-200" 
                :class="{
                  'w-[375px]': previewDevice === 'mobile',
                  'w-[768px]': previewDevice === 'tablet',
                  'w-full h-full': previewDevice === 'desktop'
                }"
                frameborder="0"
             ></iframe>
             <div v-else class="h-full w-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-200 shadow-none min-h-[400px]">
                <PhotoIcon class="h-16 w-16 mb-4 opacity-50" />
                <p class="font-bold text-lg">No content to preview</p>
             </div>
          </div>
       </div>
    </UiBaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useNotifications } from '@/composables/modules/notifications/useNotifications'
import { useConfirmation } from '@/composables/core/useConfirmation'
import { 
  ChevronLeftIcon, 
  CloudArrowUpIcon,
  InformationCircleIcon,
  EyeIcon,
  PhotoIcon
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
  saveTemplate,
  deleteTemplate
} = useNotifications()

const { confirm } = useConfirmation()

const saving = ref(false)
const deleting = ref(false)
const showPreviewModal = ref(false)
const previewDevice = ref('desktop')

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
    navigateTo('/dashboard/emails')
  }
  saving.value = false
}

const handleDelete = async () => {
  if (isNew.value) return
  
  const confirmed = await confirm({
    title: 'Delete Template',
    message: 'Are you sure you want to permanently delete this email template? This action cannot be undone.',
    confirmText: 'Delete',
    variant: 'danger'
  })

  if (confirmed) {
    deleting.value = true
    const success = await deleteTemplate(route.params.id as string)
    if (success) {
      navigateTo('/dashboard/emails')
    }
    deleting.value = false
  }
}

// Ensure local structure is synced if fetchedTemplate updates
watch(fetchedTemplate, (val) => {
  if (val) {
    template.value = { ...val }
  }
}, { immediate: true })

onMounted(fetchTemplate)
</script>