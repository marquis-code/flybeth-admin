<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button @click="navigateTo('/campaigns')" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeftIcon class="w-6 h-6 text-brand-blue" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-brand-blue font-outfit">Create Campaign</h1>
          <p class="text-brand-gray/60 text-sm">Draft your next masterpiece for the Flybeth community.</p>
        </div>
      </div>
      <div class="flex space-x-3">
        <UiBaseButton @click="saveCampaign" variant="primary" :loading="saving">
          Save Campaign
        </UiBaseButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <UiBaseCard>
          <div class="space-y-4">
            <UiAnimatedInput 
              v-model="form.title"
              label="Campaign Title"
              placeholder="e.g. October Flight Extravaganza"
              required
            />
            <UiAnimatedInput 
              v-model="form.subject"
              label="Email Subject Line"
              placeholder="e.g. ✈️ 20% Off Your Next Flight!"
              required
            />
          </div>
        </UiBaseCard>

        <UiBaseCard class="!p-0 overflow-hidden">
          <AdminEmailEditor v-model="form.content" />
        </UiBaseCard>
      </div>

      <div class="space-y-6">
        <UiBaseCard title="Campaign Details">
          <div class="space-y-6">
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-brand-gray/40 mb-2 block">Target Recipients</label>
              <div class="space-y-2">
                <label v-for="role in roles" :key="role.value" class="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" :value="role.value" v-model="form.targetRoles" class="rounded border-gray-300 text-brand-blue focus:ring-brand-blue">
                  <span class="text-sm font-medium text-brand-gray">{{ role.label }}</span>
                </label>
              </div>
            </div>

            <UiAnimatedInput 
              v-model="form.scheduledAt"
              label="Schedule Send (Optional)"
              type="datetime-local"
            />
          </div>
        </UiBaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useCustomToast } from '@/composables/core/useCustomToast'

const { showToast } = useCustomToast()
const saving = ref(false)

const roles = [
  { label: 'Customers', value: 'customer' },
  { label: 'Agents', value: 'agent' },
  { label: 'Staff members', value: 'staff' }
]

const form = ref({
  title: '',
  subject: '',
  content: {
    htmlContent: '<h2>Hello Traveler!</h2><p>Start composing your email here...</p>',
    subject: ''
  },
  targetRoles: ['customer'],
  scheduledAt: ''
})

const saveCampaign = async () => {
  if (!form.value.title || !form.value.subject) {
    showToast({ title: 'Validation Error', message: 'Please fill in required fields', toastType: 'error' })
    return
  }
  
  saving.value = true
  try {
    await (useNuxtApp().$axios as any).post('/admin/campaigns', form.value)
    showToast({ title: 'Success', message: 'Campaign drafted successfully', toastType: 'success' })
    navigateTo('/campaigns')
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to save campaign', toastType: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
