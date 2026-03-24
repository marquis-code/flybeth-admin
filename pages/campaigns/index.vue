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
            <span class="text-xs font-black uppercase tracking-widest" :class="[
              item.status === 'sent' ? 'text-green-600' : 
              item.status === 'scheduled' ? 'text-blue-600' : 'text-gray-500'
            ]">
              {{ item.status }}
            </span>
          </div>
        </template>

        <template #cell(actions)="{ item }">
          <div class="flex space-x-3">
            <button @click="sendTest(item._id)" class="text-xs font-bold text-brand-blue hover:underline">
              Send Test
            </button>
            <button v-if="item.status !== 'sent'" @click="sendNow(item._id)" class="text-xs font-bold text-brand-green hover:underline">
              Send Now
            </button>
            <button @click="deleteCampaign(item._id)" class="text-xs font-bold text-red-500 hover:underline">
              Delete
            </button>
          </div>
        </template>
      </UiBaseTable>
    </UiBaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCustomToast } from '@/composables/core/useCustomToast'

const { showToast } = useCustomToast()
const loading = ref(false)
const triggering = ref(false)
const campaigns = ref([])

const triggerReminders = async () => {
  if (!confirm('Send engagement reminders to all active customers?')) return
  triggering.value = true
  try {
    await (useNuxtApp().$axios as any).post('/admin/scheduler/trigger-user-reminders')
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
    const res = await (useNuxtApp().$axios as any).get('/admin/campaigns')
    campaigns.value = res.data
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
    await (useNuxtApp().$axios as any).post(`/admin/campaigns/${id}/send`)
    showToast({ title: 'Success', message: 'Campaign blast started', toastType: 'success' })
    fetchCampaigns()
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to send campaign', toastType: 'error' })
  }
}

const deleteCampaign = async (id: string) => {
  if (!confirm('Are you sure?')) return
  try {
    await (useNuxtApp().$axios as any).delete(`/admin/campaigns/${id}`)
    showToast({ title: 'Deleted', message: 'Campaign removed', toastType: 'success' })
    fetchCampaigns()
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to delete', toastType: 'error' })
  }
}

const sendTest = (id: string) => {
  showToast({ title: 'Note', message: 'Test send feature coming soon', toastType: 'info' })
}
</script>
