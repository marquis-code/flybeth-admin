<template>
  <div class="space-y-10 container mx-auto pb-20">
    <!-- Header Area -->
    <div class="flex justify-between items-end">
      <div>
        <p class="text-sm  text-brand-green mb-4 font-bold">Marketing center</p>
        <h1 class="text-2xl text-gray-900 er font-bold">Email campaigns</h1>
      </div>
      <div class="flex gap-4">
        <UiBaseButton variant="primary" @click="triggerReminders" :loading="triggering" class="shadow-none min-w-[160px] h-12">
           <BellAlertIcon class="h-4 w-4 mr-2" />
           Send reminders
        </UiBaseButton>
        <NuxtLink to="/dashboard/campaigns/create">
          <UiBaseButton variant="primary" class="bg-gray-900 text-white shadow-none min-w-[180px] h-12">
             <PlusIcon class="h-4 w-4 mr-2" />
             Create new campaign
          </UiBaseButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Stats Dashboard -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
       <div v-for="stat in stats" :key="stat.label" class="bg-white border border-gray-200 rounded-3xl p-8 transition-premium hover:border-brand-blue/30 shadow-none">
          <p class="text-xs font-bold text-gray-400 mb-2">{{ stat.label }}</p>
          <div class="flex items-end justify-between">
             <h3 class="text-3xl font-bold text-gray-900 leading-none">{{ stat.value }}</h3>
             <div class="text-sm font-bold py-1 px-2 rounded-lg" :class="stat.trendClass">
                {{ stat.trend }}
             </div>
          </div>
       </div>
    </div>

    <!-- Campaigns Table -->
    <div class="bg-white border border-gray-200 rounded-none overflow-hidden shadow-none">
       <div v-if="loading" class="p-20 space-y-4">
          <div v-for="i in 5" :key="i" class="h-16 bg-gray-50 rounded-2xl animate-pulse" />
       </div>

       <div v-else-if="campaigns.length === 0" class="p-24 text-center">
          <div class="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-10">
             <RocketLaunchIcon class="h-10 w-10 text-brand-gray/20" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">No campaigns found</h3>
          <p class="text-gray-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed text-sm">Start by creating your first marketing campaign to engage your members.</p>
          <UiBaseButton variant="primary" size="lg" @click="navigateTo('/dashboard/campaigns/create')" class="shadow-none">Create your first campaign</UiBaseButton>
       </div>

       <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse">
             <thead>
                <tr class="bg-gray-50/50 border-b border-gray-200">
                   <th class="px-8 py-6 text-left text-sm font-bold text-gray-400 uppercase ">Campaign information</th>
                   <th class="px-8 py-6 text-left text-sm font-bold text-gray-400 uppercase ">Audience</th>
                   <th class="px-8 py-6 text-left text-sm font-bold text-gray-400 uppercase ">Status</th>
                   <th class="px-8 py-6 text-left text-sm font-bold text-gray-400 uppercase ">Created date</th>
                   <th class="px-8 py-6 text-right text-sm font-bold text-gray-400 uppercase ">Actions</th>
                </tr>
             </thead>
             <tbody class="divide-y divide-gray-50">
                <tr v-for="campaign in campaigns" :key="campaign._id" class="group hover:bg-gray-50/30 transition-premium cursor-pointer" @click="viewCampaign(campaign)">
                   <td class="px-8 py-6">
                      <div class="flex items-center space-x-4">
                         <div class="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-premium">
                            <PaperAirplaneIcon class="h-5 w-5" />
                         </div>
                         <div>
                            <p class="text-base font-bold text-gray-900 group-hover:text-brand-blue transition-premium">{{ campaign.title }}</p>
                            <p class="text-[11px] text-gray-400 font-medium truncate max-w-xs ">{{ campaign.subject }}</p>
                         </div>
                      </div>
                   </td>
                   <td class="px-8 py-6">
                      <span class="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 text-sm font-bold text-gray-500 capitalize border border-gray-200">
                         {{ campaign.targetAudience }}
                      </span>
                   </td>
                   <td class="px-8 py-6">
                      <div class="flex items-center space-x-2">
                         <div class="h-1.5 w-1.5 rounded-full" :class="getStatusColor(campaign.status)"></div>
                         <span class="text-[11px] font-bold text-gray-600 capitalize">{{ campaign.status || 'Draft' }}</span>
                      </div>
                   </td>
                   <td class="px-8 py-6 text-sm text-gray-500 font-medium">
                      {{ new Date(campaign.createdAt).toLocaleDateString() }}
                   </td>
                   <td class="px-8 py-6 text-right" @click.stop>
                      <div class="flex justify-end items-center space-x-2">
                         <button 
                           @click="sendNow(campaign)"
                           class="px-4 py-2 rounded-xl text-sm font-bold bg-brand-blue text-white hover:ring-8 hover:ring-brand-blue/5 transition-premium"
                         >
                            {{ campaign.status === 'sent' ? 'SEND AGAIN' : 'SEND NOW' }}
                         </button>
                         <button 
                           @click="navigateTo(`/dashboard/campaigns/create?id=${campaign._id}`)"
                           class="p-2.5 rounded-xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 transition-premium"
                         >
                            <PencilIcon class="h-4 w-4" />
                         </button>
                         <button 
                           @click="confirmDelete(campaign._id)"
                           class="p-2.5 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-red-500 transition-premium"
                         >
                            <TrashIcon class="h-4 w-4" />
                         </button>
                      </div>
                   </td>
                </tr>
             </tbody>
          </table>
       </div>
    </div>

    <!-- View Modal -->
    <UiBaseModal 
      :show="showViewDrawer" 
      title="Campaign Review" 
      maxWidth="max-w-5xl"
      @close="showViewDrawer = false"
    >
       <div v-if="selectedCampaign" class="space-y-10">
          <div class="space-y-3">
             <p class="text-sm font-bold text-gray-400 capitalize">Internal name</p>
             <h2 class="text-2xl font-bold text-gray-900 leading-tight">{{ selectedCampaign.title }}</h2>
             <div class="p-5 bg-brand-blue/5 rounded-2xl border border-brand-blue/5">
                <p class="text-sm font-bold text-brand-blue uppercase  mb-1">Subject line</p>
                <p class="text-sm text-gray-900 font-bold ">"{{ selectedCampaign.subject }}"</p>
             </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
             <div class="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <p class="text-sm font-bold text-gray-400 uppercase  mb-1">Status</p>
                <p class="font-bold text-gray-900 capitalize text-sm">{{ selectedCampaign.status }}</p>
             </div>
             <div class="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <p class="text-sm font-bold text-gray-400 uppercase  mb-1">Audience</p>
                <p class="font-bold text-gray-900 capitalize text-sm">{{ selectedCampaign.targetAudience }}</p>
             </div>
          </div>

          <div class="space-y-4 pt-6 border-t border-gray-200">
             <div class="flex justify-between items-center mb-4">
                 <p class="text-xs font-bold text-gray-400 uppercase ">Email blueprint</p>
                 <!-- Device Toggle -->
                 <div class="bg-gray-100 p-1.5 rounded-2xl inline-flex border border-gray-200 shadow-none">
                    <button 
                      @click="previewDevice = 'mobile'"
                      class="px-4 py-2 rounded-xl text-sm font-bold transition-premium shadow-none"
                      :class="previewDevice === 'mobile' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900'"
                    >Mobile</button>
                    <button 
                      @click="previewDevice = 'tablet'"
                      class="px-4 py-2 rounded-xl text-sm font-bold transition-premium shadow-none"
                      :class="previewDevice === 'tablet' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900'"
                    >Tablet</button>
                    <button 
                      @click="previewDevice = 'desktop'"
                      class="px-4 py-2 rounded-xl text-sm font-bold transition-premium shadow-none"
                      :class="previewDevice === 'desktop' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900'"
                    >Desktop</button>
                 </div>
             </div>
             
             <div class="bg-gray-50 rounded-[2.5rem] p-6 overflow-y-auto border border-gray-200 flex justify-center items-start shadow-inner min-h-[600px]">
                 <iframe 
                    v-if="previewContent"
                    :srcdoc="previewContent" 
                    class="bg-white rounded-2xl shadow-sm transition-all duration-300 ease-in-out min-h-[600px] border border-gray-200" 
                    :class="{
                      'w-[375px]': previewDevice === 'mobile',
                      'w-[768px]': previewDevice === 'tablet',
                      'w-full h-full': previewDevice === 'desktop'
                    }"
                    frameborder="0"
                 ></iframe>
                 <div v-else class="w-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-200 shadow-none min-h-[400px]">
                    <p class="font-bold text-lg">No content to preview</p>
                 </div>
             </div>
          </div>
       </div>
    </UiBaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  PlusIcon,
  BellAlertIcon,
  PaperAirplaneIcon,
  PencilIcon,
  TrashIcon,
  RocketLaunchIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import { useCustomToast } from '@/composables/core/useCustomToast'
import { useConfirmation } from '@/composables/core/useConfirmation'
import { adminApiFactory } from '@/api_factory/modules/admin'

definePageMeta({
  layout: 'admin'
})

const { showToast } = useCustomToast()
const { confirm } = useConfirmation()
const loading = ref(true)
const triggering = ref(false)
const campaigns = ref<any[]>([])
const showViewDrawer = ref(false)
const selectedCampaign = ref<any>(null)
const previewDevice = ref('desktop')

const previewContent = computed(() => {
   if (!selectedCampaign.value) return ''
   if (!selectedCampaign.value.content && !selectedCampaign.value.imageUrl) return ''
   let html = '<div style="font-family: \'Inter\', sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 20px;">'
   if (selectedCampaign.value.imageUrl) {
      html += `<img src="${selectedCampaign.value.imageUrl}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 24px;" alt="Campaign Banner" />`
   }
   html += `<div style="line-height: 1.6;">${selectedCampaign.value.content || ''}</div>`
   html += '</div>'
   return html
})

const stats = computed(() => [
  { label: 'Total active', value: campaigns.value.length, trend: '+4%', trendClass: 'bg-green-50 text-green-600' },
  { label: 'Emails sent', value: campaigns.value.filter(c => c.status === 'sent').length, trend: '92%', trendClass: 'bg-blue-50 text-blue-600' },
  { label: 'Scheduled', value: campaigns.value.filter(c => c.status === 'scheduled').length, trend: 'NEW', trendClass: 'bg-orange-50 text-orange-600' },
  { label: 'Open rate', value: '24.8%', trend: '+2.1%', trendClass: 'bg-green-50 text-green-600' }
])

const fetchCampaigns = async () => {
  loading.value = true
  try {
    const res = await adminApiFactory.getCampaigns()
    campaigns.value = res.data?.data || res.data || []
  } finally {
    loading.value = false
  }
}

const sendNow = async (campaign: any) => {
   const confirmed = await confirm({
      title: 'Initiate send?',
      message: `Wait! Are you sure you want to send "${campaign.title}" to all recipients now?`,
      confirmText: 'Yes, blast it'
   })
   if (!confirmed) return
   
   try {
      await adminApiFactory.sendCampaign(campaign._id)
      showToast({ title: 'Success', message: 'Campaign is being delivered.', toastType: 'success' })
      fetchCampaigns()
   } catch (e: any) {
      showToast({ title: 'System error', message: 'Failed to trigger campaign logic.', toastType: 'error' })
   }
}

const confirmDelete = async (id: string) => {
   const confirmed = await confirm({
      title: 'Remove campaign?',
      message: 'This will permanently delete the campaign history and settings.',
      confirmText: 'Delete permanently',
      variant: 'danger'
   })
   if (!confirmed) return
   await adminApiFactory.deleteCampaign(id)
   showToast({ title: 'Deleted', message: 'Campaign removed from system.', toastType: 'success' })
   fetchCampaigns()
}

const viewCampaign = (item: any) => {
  selectedCampaign.value = item
  showViewDrawer.value = true
}

const getStatusColor = (status: string) => {
   if (status === 'sent') return 'bg-brand-green'
   if (status === 'scheduled') return 'bg-brand-blue'
   return 'bg-gray-300'
}

const triggerReminders = async () => {
  triggering.value = true
  try {
    await adminApiFactory.triggerReminders()
    showToast({ title: 'Success', message: 'Reminders have been initiated.', toastType: 'success' })
  } finally {
    triggering.value = false
  }
}

onMounted(fetchCampaigns)
</script>
