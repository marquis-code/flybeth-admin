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
          {{ buttonLabel }}
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

        <UiBaseCard class="!p-0 overflow-hidden bg-transparent border-none shadow-none text-brand-blue">
          <CampaignBlockBuilder v-model="form.content" />
        </UiBaseCard>
      </div>

      <div class="space-y-6">
        <UiBaseCard title="Campaign Details">
          <div class="space-y-6">
            <div class="space-y-4">
              <label class="text-xs  uppercase tracking-widest text-brand-gray/40 block">Target Audience</label>
              
              <div class="grid grid-cols-2 gap-3">
                <label v-for="aud in audiences" :key="aud.value" 
                       class="flex flex-col p-4 border rounded-xl cursor-pointer transition-colors"
                       :class="form.targetAudience === aud.value ? 'bg-brand-blue/5 border-brand-blue' : 'bg-white border-gray-100 hover:border-brand-gray/20'">
                  <div class="flex items-center space-x-2 mb-1">
                    <input type="radio" :value="aud.value" v-model="form.targetAudience" class="text-brand-blue focus:ring-brand-blue">
                    <span class="text-sm font-bold text-gray-900">{{ aud.label }}</span>
                  </div>
                  <span class="text-xs text-brand-gray/50 ml-6">{{ aud.description }}</span>
                </label>
              </div>

              <!-- Roles Selection (Only visible if targetAudience === 'roles') -->
              <div v-if="form.targetAudience === 'roles'" class="p-4 bg-gray-50 rounded-xl space-y-3 mt-4">
                <p class="text-xs font-bold text-brand-gray/60 uppercase tracking-widest mb-2">Select Roles</p>
                <div class="space-y-2">
                  <label v-for="role in roles" :key="role.value" class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" :value="role.value" v-model="form.targetRoles" class="rounded border-gray-300 text-brand-blue focus:ring-brand-blue">
                    <span class="text-sm font-medium text-brand-gray">{{ role.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Specific Users Selection (Only visible if targetAudience === 'specific') -->
              <div v-if="form.targetAudience === 'specific'" class="p-4 bg-gray-50 rounded-xl space-y-4 mt-4 relative">
                <p class="text-xs font-bold text-brand-gray/60 uppercase tracking-widest mb-1">Select Specific Users</p>
                
                <div class="relative">
                  <input 
                    v-model="userSearchTerm" 
                    @input="searchUsers"
                    type="text" 
                    placeholder="Search users by name or email..."
                    class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                  />
                  <div v-if="searchingUsers" class="absolute right-3 top-3 h-5 w-5 border-2 border-gray-200 border-t-brand-blue rounded-full animate-spin"></div>
                  
                  <!-- Search Results Dropdown -->
                  <div v-if="userSearchResults.length > 0 && userSearchTerm" class="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    <button 
                      v-for="user in userSearchResults" 
                      :key="user._id"
                      @click="addUser(user)"
                      class="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col border-b border-gray-50 last:border-0"
                    >
                      <span class="text-sm font-bold text-gray-900">{{ user.firstName }} {{ user.lastName }}</span>
                      <span class="text-xs text-brand-gray/60">{{ user.email }}</span>
                    </button>
                  </div>
                </div>

                <!-- Selected Users List -->
                <div v-if="form.specificUsers.length > 0" class="space-y-2">
                  <p class="text-[10px]  uppercase tracking-widest text-brand-gray/40">Selected Recipients ({{ form.specificUsers.length }})</p>
                  <div class="flex flex-wrap gap-2">
                    <div v-for="user in selectedUsersDetails" :key="user._id" class="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                      <span class="text-xs font-medium text-gray-700 mr-2">{{ user.firstName }} {{ user.lastName }}</span>
                      <button @click="removeUser(user._id)" class="text-red-400 hover:text-red-600 transition-colors">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- External / Custom Emails Input -->
              <div class="p-4 bg-gray-50 rounded-xl space-y-3 mt-4">
                <p class="text-xs font-bold text-brand-gray/60 uppercase tracking-widest mb-1">External / Custom Emails</p>
                <p class="text-[10px] text-brand-gray/40 mb-3">Target guests outside the platform. Separate emails with commas.</p>
                
                <input 
                  v-model="customEmailsInput"
                  @blur="parseCustomEmails"
                  @keydown.enter.prevent="parseCustomEmails"
                  type="text" 
                  placeholder="e.g. john@example.com, jane@gmail.com"
                  class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                />
                
                <div v-if="form.customEmails.length > 0" class="flex flex-wrap gap-2 mt-3">
                  <div v-for="email in form.customEmails" :key="email" class="flex items-center bg-brand-blue/10 border border-brand-blue/20 rounded-lg px-3 py-1.5 shadow-sm">
                    <span class="text-xs font-bold text-brand-blue mr-2">{{ email }}</span>
                    <button @click="removeCustomEmail(email)" class="text-brand-blue/50 hover:text-red-500 transition-colors">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Send Timing -->
            <div class="space-y-4 pt-4 border-t border-gray-100">
              <label class="text-xs  uppercase tracking-widest text-brand-gray/40 block">Send Timing</label>
              
              <div class="relative">
                <select 
                  v-model="sendTiming" 
                  class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none appearance-none cursor-pointer"
                >
                  <option value="immediate">Send Now (Blast immediately)</option>
                  <option value="schedule">Schedule (Select specific date & time)</option>
                  <option value="draft">Save Draft (Save without sending)</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div v-if="sendTiming === 'schedule'" class="mt-4 p-4 bg-gray-50 rounded-xl">
                <UiAnimatedInput 
                  v-model="form.scheduledAt"
                  label="Select Date & Time (ISO Required)"
                  type="datetime-local"
                  required
                />
              </div>
            </div>
          </div>
        </UiBaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useCustomToast } from '@/composables/core/useCustomToast'
import { adminApiFactory } from '@/api_factory/modules/admin'

definePageMeta({
  layout: 'admin'
})

const { showToast } = useCustomToast()
const saving = ref(false)
const sendTiming = ref<'immediate' | 'schedule' | 'draft'>('immediate')

const buttonLabel = computed(() => {
  if (saving.value) return 'Processing...'
  if (sendTiming.value === 'immediate') return 'Send Campaign Now'
  if (sendTiming.value === 'schedule') return 'Schedule Campaign'
  return 'Save as Draft'
})

const audiences = [
  { label: 'All Users', value: 'all', description: 'Send to every registered user.' },
  { label: 'Active Users', value: 'active', description: 'Send only to engaged users.' },
  { label: 'Specific Roles', value: 'roles', description: 'Filter by account type.' },
  { label: 'Specific Users', value: 'specific', description: 'Manually select recipients.' }
]

const roles = [
  { label: 'Customers', value: 'customer' },
  { label: 'Agents', value: 'agent' },
  { label: 'Staff members', value: 'staff' }
]

const form = ref({
  title: '',
  subject: '',
  content: '',
  targetAudience: 'all',
  targetRoles: ['customer'],
  specificUsers: [] as string[],
  customEmails: [] as string[],
  scheduledAt: ''
})

// Custom Emails Logic
const customEmailsInput = ref('')

const parseCustomEmails = () => {
  if (!customEmailsInput.value) return
  
  const emails = customEmailsInput.value
    .split(',')
    .map(e => e.trim())
    .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
  
  emails.forEach(email => {
    if (!form.value.customEmails.includes(email)) {
      form.value.customEmails.push(email)
    }
  })
  
  customEmailsInput.value = ''
}

const removeCustomEmail = (email: string) => {
  form.value.customEmails = form.value.customEmails.filter(e => e !== email)
}

// Specific Users Search Logic
const userSearchTerm = ref('')
const searchingUsers = ref(false)
const userSearchResults = ref<any[]>([])
const selectedUsersDetails = ref<any[]>([])
let searchTimeout: any = null

const searchUsers = () => {
  clearTimeout(searchTimeout)
  if (!userSearchTerm.value || userSearchTerm.value.length < 2) {
    userSearchResults.value = []
    return
  }
  
  searchTimeout = setTimeout(async () => {
    searchingUsers.value = true
    try {
      const res = await adminApiFactory.getUsers({ search: userSearchTerm.value, limit: 10 })
      if (res.data?.data) {
        // Filter out already selected users
        userSearchResults.value = res.data.data.filter((u: any) => !form.value.specificUsers.includes(u._id))
      }
    } catch (e) {
      console.error(e)
    } finally {
      searchingUsers.value = false
    }
  }, 300)
}

const addUser = (user: any) => {
  if (!form.value.specificUsers.includes(user._id)) {
    form.value.specificUsers.push(user._id)
    selectedUsersDetails.value.push({ _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email })
  }
  userSearchTerm.value = ''
  userSearchResults.value = []
}

const removeUser = (id: string) => {
  form.value.specificUsers = form.value.specificUsers.filter(uid => uid !== id)
  selectedUsersDetails.value = selectedUsersDetails.value.filter(u => u._id !== id)
}

const saveCampaign = async () => {
  if (!form.value.title || !form.value.subject) {
    showToast({ title: 'Validation Error', message: 'Please fill in required fields', toastType: 'error' })
    return
  }
  if (form.value.targetAudience === 'roles' && form.value.targetRoles.length === 0) {
    showToast({ title: 'Validation Error', message: 'Please select at least one role', toastType: 'error' })
    return
  }
  if (form.value.targetAudience === 'specific' && form.value.specificUsers.length === 0) {
    showToast({ title: 'Validation Error', message: 'Please select at least one user', toastType: 'error' })
    return
  }
  
  if (sendTiming.value === 'schedule' && !form.value.scheduledAt) {
    showToast({ title: 'Validation Error', message: 'You must select a schedule date', toastType: 'error' })
    return
  }
  
  saving.value = true
  try {
    const payload: any = { ...form.value }
    // Clean up specificUsers to ensure it's mapped correctly
    if (payload.targetAudience !== 'specific') payload.specificUsers = []
    if (payload.targetAudience !== 'roles') payload.targetRoles = []
    
    // Aggressively clean up scheduledAt to strictly avoid ISO parsing errors
    if (sendTiming.value !== 'schedule' || !payload.scheduledAt || payload.scheduledAt.trim() === '') {
      delete payload.scheduledAt
    } else {
      payload.scheduledAt = new Date(payload.scheduledAt).toISOString()
    }
    
    // Step 1: Commit payload to DB
    const res = await adminApiFactory.createCampaign(payload)
    const newCampaignId = res?.data?.data?._id || res?.data?._id
    
    // Step 2: Trigger immediate blast if explicitly required
    if (sendTiming.value === 'immediate' && newCampaignId) {
       await adminApiFactory.sendCampaign(newCampaignId)
       showToast({ title: 'Success', message: 'Campaign executed perfectly!', toastType: 'success' })
    } else if (sendTiming.value === 'schedule') {
       showToast({ title: 'Success', message: 'Campaign heavily scheduled!', toastType: 'success' })
    } else {
       showToast({ title: 'Success', message: 'Draft securely filed.', toastType: 'success' })
    }
    
    navigateTo('/campaigns')
  } catch (error: any) {
    // Highly defensive error logging for UI debugging
    const errMsg = error?.response?.data?.message || error?.message || 'Failed to save campaign'
    showToast({ title: 'Error', message: typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg), toastType: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
