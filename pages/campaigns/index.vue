<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-brand-blue font-outfit">Email Campaigns</h1>
        <p class="text-brand-gray/60 text-sm">Design and schedule automated user engagement blasts.</p>
      </div>
      <div class="flex gap-3">
        <UiBaseButton @click="triggerReminders" variant="secondary" :loading="triggering">
          Trigger Reminders
        </UiBaseButton>
        <UiBaseButton @click="navigateTo('/campaigns/create')" variant="primary">
          New Campaign
        </UiBaseButton>
      </div>
    </div>

    <UiBaseCard class="!p-0 overflow-hidden">
      <UiBaseTable 
        :columns="headers" 
        :items="campaigns" 
        :loading="loading"
      >
        <template #cell(title)="{ item }">
          <div class="flex flex-col">
            <span class="font-bold text-brand-blue">{{ item.title }}</span>
            <span class="text-xs text-brand-gray/60">{{ item.subject }}</span>
          </div>
        </template>
        
        <template #cell(status)="{ item }">
          <div class="flex items-center">
            <div :class="[
              'w-2 h-2 rounded-full mr-2',
              item.status === 'sent' ? 'bg-green-500' : 
              item.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-400'
            ]"></div>
            <span class="text-xs  uppercase tracking-widest" :class="[
              item.status === 'sent' ? 'text-green-600' : 
              item.status === 'scheduled' ? 'text-blue-600' : 'text-gray-500'
            ]">
              {{ item.status }}
            </span>
          </div>
        </template>

        <template #cell(actions)="{ item }">
          <div class="flex flex-wrap gap-2">
            <button @click="viewCampaign(item)" class="text-[11px]  uppercase tracking-widest text-brand-gray px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              View
            </button>
            
            <button v-if="item.status !== 'sent'" @click="editCampaign(item._id)" class="text-[11px]  uppercase tracking-widest text-orange-600 px-3 py-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              Edit
            </button>
            
            <button v-if="item.status !== 'sent'" @click="sendNow(item._id)" class="text-[11px]  uppercase tracking-widest text-brand-green px-3 py-1.5 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              Blast Now
            </button>

            <button v-if="item.status === 'sent'" @click="resendCampaign(item._id)" class="text-[11px]  uppercase tracking-widest text-brand-blue px-3 py-1.5 bg-brand-blue/10 rounded-lg hover:bg-brand-blue/20 transition-colors">
              Resend
            </button>
            
            <button @click="deleteCampaign(item._id)" class="text-[11px]  uppercase tracking-widest text-red-500 px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              Delete
            </button>
          </div>
        </template>
      </UiBaseTable>
    </UiBaseCard>

    <!-- UI Overlays -->
    <!-- View Campaign Drawer -->
    <UiSideDrawer 
      :show="showViewDrawer" 
      @close="showViewDrawer = false" 
      :title="selectedCampaign ? 'Viewing Campaign' : ''"
    >
      <div v-if="selectedCampaign" class="space-y-6">
        <div>
           <div class="text-xs  uppercase tracking-widest text-brand-gray/50 mb-1">Subject</div>
           <div class="text-lg font-bold text-brand-blue">{{ selectedCampaign.subject }}</div>
        </div>
        <div>
           <div class="text-xs  uppercase tracking-widest text-brand-gray/50 mb-3">Target Audience</div>
           <div class="text-sm font-medium text-gray-700 capitalize">
             {{ selectedCampaign.targetAudience === 'specific' ? 'Specific Users' : selectedCampaign.targetAudience }}
           </div>
        </div>
        <div>
           <div class="text-xs  uppercase tracking-widest text-brand-gray/50 mb-3">Email Content</div>
           <div class="bg-gray-50 border border-gray-100 rounded-xl p-6 overflow-x-hidden text-sm prose max-w-none shadow-inner" v-html="selectedCampaign.content"></div>
        </div>
      </div>
    </UiSideDrawer>

    <!-- Edit Campaign Drawer -->
    <UiSideDrawer 
      :show="showEditDrawer" 
      @close="showEditDrawer = false" 
      title="Edit Campaign Draft"
    >
      <div v-if="editForm" class="space-y-6">
         <div>
            <label class="text-xs  uppercase tracking-widest text-brand-gray/40 block mb-2">Campaign Title</label>
            <input v-model="editForm.title" type="text" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none" />
         </div>
         <div>
            <label class="text-xs  uppercase tracking-widest text-brand-gray/40 block mb-2">Email Subject</label>
            <input v-model="editForm.subject" type="text" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none" />
         </div>
         <div class="pt-2">
            <label class="block text-xs  uppercase tracking-widest text-brand-gray/40 mb-3">Content Builder</label>
            <CampaignBlockBuilder v-model="editForm.content" />
         </div>
         
         <div class="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <UiBaseButton variant="secondary" @click="showEditDrawer = false">Cancel</UiBaseButton>
            <UiBaseButton variant="primary" @click="processEdit" :loading="savingEdit">Update Draft</UiBaseButton>
         </div>
      </div>
    </UiSideDrawer>

    <!-- Delete Confirmation Modal -->
    <UiBaseModal
      :show="showDeleteModal"
      @close="showDeleteModal = false"
      title="Delete Campaign"
    >
      <div v-if="selectedCampaign" class="text-center text-brand-gray py-4">
        <svg class="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="font-bold text-gray-900 text-lg mb-2">Are you absolutely sure?</p>
        <p class="text-sm">This will permanently destroy <strong>{{ selectedCampaign.title }}</strong> from the database. This action is irreversible.</p>
      </div>
      <template #footer>
         <UiBaseButton variant="secondary" @click="showDeleteModal = false">Cancel</UiBaseButton>
         <button class="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50" @click="confirmDelete" :disabled="deletingAction">
           {{ deletingAction ? 'Destroying...' : 'Yes, Delete Campaign' }}
         </button>
      </template>
    </UiBaseModal>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCustomToast } from '@/composables/core/useCustomToast'
import { adminApiFactory } from '@/api_factory/modules/admin'

definePageMeta({
  layout: 'admin'
})

const { showToast } = useCustomToast()
const loading = ref(false)
const triggering = ref(false)
const campaigns = ref<any[]>([])

// View/Edit/Delete Refs
const showViewDrawer = ref(false)
const showEditDrawer = ref(false)
const showDeleteModal = ref(false)
const selectedCampaign = ref<any>(null)
const deletingAction = ref(false)

// Edit Form State
const editForm = ref({
  _id: '',
  title: '',
  subject: '',
  content: ''
})
const savingEdit = ref(false)

const triggerReminders = async () => {
  if (!confirm('Send engagement reminders to all active customers?')) return
  triggering.value = true
  try {
    await adminApiFactory.triggerReminders()
    showToast({ title: 'Success', message: 'Engagement reminders triggered', toastType: 'success' })
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to trigger reminders', toastType: 'error' })
  } finally {
    triggering.value = false
  }
}

const headers = [
  { label: 'Campaign Details', key: 'title' },
  { label: 'Targeting', key: 'targetRoles' },
  { label: 'Status', key: 'status' },
  { label: 'Created At', key: 'createdAt' },
  { label: 'Actions', key: 'actions' }
]

const fetchCampaigns = async () => {
  loading.value = true
  try {
    const res = await adminApiFactory.getCampaigns()
    campaigns.value = res.data?.data || res.data || []
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to fetch campaigns', toastType: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(fetchCampaigns)

const sendNow = async (id: string) => {
  if (!confirm('Start campaign blast to all target users?')) return
  try {
    await adminApiFactory.sendCampaign(id)
    showToast({ title: 'Success', message: 'Campaign blast started', toastType: 'success' })
    fetchCampaigns()
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to send campaign', toastType: 'error' })
  }
}

const deleteCampaign = (id: string) => {
  selectedCampaign.value = campaigns.value.find(c => c._id === id)
  if (selectedCampaign.value) {
    showDeleteModal.value = true
  }
}

const confirmDelete = async () => {
  if (!selectedCampaign.value) return
  deletingAction.value = true
  try {
    await adminApiFactory.deleteCampaign(selectedCampaign.value._id)
    showToast({ title: 'Deleted', message: 'Campaign completely removed', toastType: 'success' })
    showDeleteModal.value = false
    fetchCampaigns()
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to delete campaign', toastType: 'error' })
  } finally {
    deletingAction.value = false
  }
}

const viewCampaign = (item: any) => {
  selectedCampaign.value = item
  showViewDrawer.value = true
}

const editCampaign = (id: string) => {
  const c = campaigns.value.find(c => c._id === id)
  if (!c) return
  
  editForm.value = {
    _id: c._id,
    title: c.title,
    subject: c.subject,
    content: c.content
  }
  showEditDrawer.value = true
}

const processEdit = async () => {
  if (!editForm.value.title || !editForm.value.subject) {
     showToast({ title: 'Error', message: 'Title and Subject required', toastType: 'error' })
     return
  }
  savingEdit.value = true
  try {
    await adminApiFactory.updateCampaign(editForm.value._id, {
       title: editForm.value.title,
       subject: editForm.value.subject,
       content: editForm.value.content
    })
    showToast({ title: 'Success', message: 'Draft completely updated', toastType: 'success' })
    showEditDrawer.value = false
    fetchCampaigns()
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to update campaign', toastType: 'error' })
  } finally {
    savingEdit.value = false
  }
}

const resendCampaign = async (id: string) => {
  if (!confirm('WARNING: Are you absolutely sure you want to resend this blast to all target users?')) return
  try {
    await adminApiFactory.sendCampaign(id)
    showToast({ title: 'Success', message: 'Campaign logic re-engaged! Blast re-sent.', toastType: 'success' })
    fetchCampaigns()
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to resend campaign', toastType: 'error' })
  }
}
</script>
