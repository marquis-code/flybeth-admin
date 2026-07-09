<template>
  <div class="space-y-10">
    <!-- Documentation Note -->
    <div class="bg-brand-blue/5 border border-brand-blue/10 rounded-3xl p-6 mb-8 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="h-10 w-10 bg-white border border-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
          <InformationCircleIcon class="h-5 w-5" />
        </div>
        <div>
          <h4 class="text-base font-bold text-gray-900">Automation Protocol</h4>
          <p class="text-sm text-gray-500 font-medium  mt-0.5">Templates support dynamic data injection using the double-brace <code class="text-brand-blue">{{ renderVariable('variable') }}</code> syntax.</p>
        </div>
      </div>
      <NuxtLink to="/dashboard/emails/new" class="text-sm font-bold text-brand-blue hover:underline">View Syntax Guide</NuxtLink>
    </div>

    <!-- Header Section -->
    <div class="flex justify-between items-end">
      <div>
        <p class="text-sm    text-brand-green mb-2">Communication Hub</p>
        <h1 class="text-3xl text-gray-900 er">Email Templates</h1>
      </div>
      <div class="flex gap-4">
        <UiBaseButton variant="primary" @click="navigateTo('/dashboard/emails/new')">
          <PlusIcon class="h-4 w-4 mr-2" />
          Create Template
        </UiBaseButton>
      </div>
    </div>

    <!-- Templates Table -->
    <div class="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-none">
      <UiBaseTable 
        :columns="columns" 
        :items="templates"
        :loading="loading"
        empty-title="No Templates Found"
        empty-description="Get started by seeding the default branded templates or create your own from scratch."
      >
        <template #cell(name)="{ item }">
          <div class="flex items-center space-x-4">
            <div class="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <EnvelopeIcon class="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900">{{ item.name }}</p>
            </div>
          </div>
        </template>
        
        <template #cell(slug)="{ item }">
          <span class="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{{ item.slug }}</span>
        </template>

        <template #cell(subject)="{ item }">
          <p class="text-sm font-medium text-gray-900 max-w-[200px] truncate">{{ item.subject }}</p>
        </template>

        <template #cell(variables)="{ item }">
          <div class="flex flex-wrap gap-1.5 max-w-[200px]">
            <span 
              v-for="v in item.availableVariables.slice(0, 2)" 
              :key="v"
              class="text-[10px] px-1.5 py-0.5 bg-brand-blue/5 text-brand-blue border border-brand-blue/10 rounded font-bold"
            >
              {{ v }}
            </span>
            <span v-if="item.availableVariables.length > 2" class="text-[10px] text-gray-400 font-medium px-1">
              +{{ item.availableVariables.length - 2 }}
            </span>
          </div>
        </template>

        <template #cell(status)="{ item }">
          <div class="flex items-center px-3 py-1 rounded-lg w-fit" :class="item.isActive ? 'bg-brand-green/10' : 'bg-red-50'">
             <div class="h-1.5 w-1.5 rounded-full mr-2" :class="item.isActive ? 'bg-brand-green animate-pulse' : 'bg-red-400'"></div>
             <span class="text-xs font-bold" :class="item.isActive ? 'text-brand-green' : 'text-red-600'">
               {{ item.isActive ? 'Active' : 'Disabled' }}
             </span>
          </div>
        </template>

        <template #cell(actions)="{ item }">
          <div class="flex items-center justify-end space-x-2">
            <button @click="previewTemplate = item" class="px-3 py-1.5 flex items-center justify-center rounded-xl bg-brand-blue/5 text-brand-blue text-xs font-bold transition-colors hover:bg-brand-blue/10 border border-transparent hover:border-brand-blue/20">
              <EyeIcon class="h-3.5 w-3.5 mr-1.5" /> Preview
            </button>
            <button @click="navigateTo(`/dashboard/emails/${item._id}`)" class="px-3 py-1.5 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 text-xs font-bold transition-colors hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200">
              <PencilSquareIcon class="h-3.5 w-3.5 mr-1.5" /> Edit
            </button>
            <button @click="handleDelete(item._id)" class="px-3 py-1.5 flex items-center justify-center rounded-xl bg-red-50 text-red-600 text-xs font-bold transition-colors hover:text-red-700 hover:bg-red-100 border border-transparent hover:border-red-200">
              <TrashIcon class="h-3.5 w-3.5 mr-1.5" /> Delete
            </button>
          </div>
        </template>
      </UiBaseTable>
    </div>

    <!-- Live Preview Modal -->
    <UiBaseModal 
      :show="!!previewTemplate" 
      :title="previewTemplate?.name || 'Template Preview'" 
      max-width="max-w-4xl"
      @close="previewTemplate = null"
    >
      <div v-if="previewTemplate" class="flex flex-col h-[70vh] bg-gray-100 rounded-3xl overflow-hidden shadow-inner border border-gray-200">
        <iframe :srcdoc="previewTemplate.htmlContent" class="w-full h-full border-none bg-white"></iframe>
      </div>
    </UiBaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotifications } from '@/composables/modules/notifications/useNotifications'
import { useConfirmation } from '@/composables/core/useConfirmation'
import { 
  PlusIcon, 
  SparklesIcon, 
  EnvelopeIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const previewTemplate = ref<any>(null)

const { 
  templates, 
  loading, 
  seeding, 
  fetchTemplates, 
  seedTemplates,
  deleteTemplate
} = useNotifications()

const { confirm } = useConfirmation()

const columns = [
  { key: 'name', label: 'Template' },
  { key: 'slug', label: 'System Slug' },
  { key: 'subject', label: 'Subject' },
  { key: 'variables', label: 'Data Variables' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' }
]

const renderVariable = (v: string) => `{{${v}}}`

const handleSeed = async () => {
  await seedTemplates()
}

const handleDelete = async (id: string) => {
  const confirmed = await confirm({
    title: 'Delete Template',
    message: 'Are you sure you want to permanently delete this template? This cannot be undone.',
    confirmText: 'Delete',
    variant: 'danger'
  })

  if (confirmed) {
    const success = await deleteTemplate(id)
    if (success) {
      await fetchTemplates()
    }
  }
}

onMounted(fetchTemplates)
</script>
