<template>
  <div class="space-y-10 max-w-7xl mx-auto pb-20">
    <!-- Action Header -->
    <div class="flex justify-between items-center bg-white border border-gray-100 p-8 rounded-3xl transition-premium shadow-none">
      <div class="flex items-center space-x-6">
        <button @click="navigateTo('/campaigns')" class="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white transition-premium group shadow-none">
          <ArrowLeftIcon class="h-6 w-6 group-hover:-translate-x-1 transition-premium" />
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight leading-none capitalize">{{ isEdit ? 'Edit' : 'Create' }} campaign</h1>
          <p class="text-sm text-gray-500 mt-2 font-medium">Set up an email campaign to reach your users.</p>
        </div>
      </div>
      <div class="flex gap-4">
        <UiBaseButton variant="secondary" @click="navigateTo('/campaigns')">Cancel</UiBaseButton>
        <UiBaseButton variant="primary" @click="saveCampaign" :loading="saving" class="bg-gray-900 text-white min-w-[180px] h-14 text-base font-bold shadow-none">
           <CloudArrowUpIcon class="h-5 w-5 mr-3" />
           {{ buttonLabel }}
        </UiBaseButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <!-- Main Configuration Column -->
      <div class="lg:col-span-2 space-y-10">
        <!-- Section 1: Basic Information -->
        <div class="bg-white border border-gray-100 rounded-[2.5rem] p-12 space-y-12 shadow-none">
           <div class="flex items-center space-x-3 mb-2">
              <div class="h-2.5 w-2.5 rounded-full bg-brand-blue"></div>
              <h3 class="text-lg font-bold text-gray-900">1. Basic information</h3>
           </div>
           
           <div class="space-y-10">
              <div class="space-y-3">
                 <label class="text-sm font-bold text-gray-700 ml-1">Campaign name (Internal use)</label>
                 <input 
                   v-model="form.title" 
                   type="text" 
                   placeholder="e.g. October flight special"
                   class="w-full bg-gray-50 border border-gray-100 rounded-2xl py-6 px-8 text-lg font-bold text-gray-900 focus:ring-4 focus:ring-brand-blue/5 focus:bg-white transition-premium outline-none shadow-none"
                 />
              </div>
              <div class="space-y-3">
                 <label class="text-sm font-bold text-gray-700 ml-1">Subject line (What users will see)</label>
                 <input 
                   v-model="form.subject" 
                   type="text" 
                   placeholder="e.g. ✈️ 20% off your next trip!"
                   class="w-full bg-gray-50 border border-gray-100 rounded-2xl py-6 px-8 text-lg font-bold text-gray-900 focus:ring-4 focus:ring-brand-blue/5 focus:bg-white transition-premium outline-none shadow-none"
                 />
              </div>

              <!-- Hero Image Upload with Spinner -->
              <div class="space-y-3">
                 <label class="text-sm font-bold text-gray-700 ml-1">Campaign banner image</label>
                 <div 
                   @click="triggerUpload"
                   class="relative group cursor-pointer overflow-hidden rounded-[2.5rem] border-2 border-dashed border-gray-100 hover:border-brand-blue/30 transition-premium aspect-[21/9] flex items-center justify-center bg-gray-50 shadow-none"
                 >
                    <!-- Loading Spinner Layer -->
                    <div v-if="uploading" class="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
                       <div class="relative">
                          <div class="h-16 w-16 border-4 border-gray-50 border-t-brand-blue rounded-full animate-spin"></div>
                          <div class="absolute inset-0 flex items-center justify-center">
                             <PhotoIcon class="h-6 w-6 text-brand-blue animate-pulse" />
                          </div>
                       </div>
                       <p class="mt-4 text-sm font-bold text-brand-blue uppercase tracking-widest animate-pulse">Syncing media asset...</p>
                    </div>

                    <img v-if="form.imageUrl && !uploading" :src="form.imageUrl" class="absolute inset-0 w-full h-full object-cover transition-premium group-hover:scale-105 shadow-none" />
                    
                    <div v-if="!form.imageUrl && !uploading" class="text-center p-8">
                       <PhotoIcon class="h-12 w-12 text-gray-500 mx-auto mb-4 group-hover:text-brand-blue transition-premium" />
                       <p class="text-base font-bold text-gray-900">Click to upload a banner image</p>
                       <p class="text-sm text-gray-400 mt-2">Recommended: 1200 x 500px</p>
                    </div>
                    <div v-if="form.imageUrl && !uploading" class="absolute top-6 right-6 z-20">
                       <button @click.stop="form.imageUrl = ''" class="p-3 bg-white/90 backdrop-blur-sm hover:bg-red-500 hover:text-white rounded-2xl transition-premium shadow-none border border-gray-100">
                          <TrashIcon class="h-5 w-5" />
                       </button>
                    </div>
                    <input ref="fileInput" type="file" @change="handleFileUpload" class="hidden" accept="image/*" />
                 </div>
              </div>
           </div>
        </div>

        <!-- Section 2: Email Content -->
        <div class="bg-white border border-gray-100 rounded-[2.5rem] p-12 space-y-12 shadow-none">
           <div class="flex items-center space-x-3 mb-2">
              <div class="h-2.5 w-2.5 rounded-full bg-brand-green"></div>
              <h3 class="text-lg font-bold text-gray-900">2. Email content</h3>
           </div>
           
           <div class="border-none shadow-none min-h-[400px]">
              <CampaignBlockBuilder v-model="form.content" />
           </div>
        </div>
      </div>

      <!-- Control Sidebar -->
      <div class="space-y-10">
        <!-- Target Selection Card -->
        <div class="bg-white border border-gray-100 rounded-[2.5rem] p-10 space-y-10 sticky top-24 shadow-none">
           <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Who should get this?</p>
              
              <!-- Custom Dropdown Selector -->
              <div class="relative">
                 <button 
                   @click="showAudienceList = !showAudienceList"
                   class="w-full flex items-center justify-between p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100 hover:border-brand-blue hover:bg-white transition-premium outline-none shadow-none"
                 >
                    <div class="flex items-center space-x-5 text-left">
                       <div class="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-brand-blue shadow-none border border-gray-50">
                          <component :is="selectedAudience?.icon || BoltIcon" class="h-6 w-6" />
                       </div>
                       <div>
                          <p class="text-base font-bold text-gray-900">{{ selectedAudience?.label }}</p>
                          <p class="text-xs text-gray-400 font-medium">{{ selectedAudience?.userFriendly }}</p>
                       </div>
                    </div>
                    <ChevronDownIcon class="h-6 w-6 text-gray-400 transition-premium" :class="{ 'rotate-180': showAudienceList }" />
                 </button>

                 <!-- Dropdown List -->
                 <div v-if="showAudienceList" class="absolute z-50 w-full mt-3 bg-white border border-gray-100 rounded-[2rem] p-3 animate-in fade-in zoom-in-95 duration-200 shadow-none border-b-4 border-b-brand-blue/5">
                    <button 
                      v-for="aud in audiences" 
                      :key="aud.value"
                      @click="selectAudience(aud)"
                      class="w-full flex items-center p-5 rounded-2xl hover:bg-gray-50 transition-premium group text-left"
                      :class="{ 'bg-brand-blue/5': form.targetAudience === aud.value }"
                    >
                       <div class="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-brand-blue group-hover:text-white transition-premium mr-4 shadow-none">
                          <component :is="aud.icon" class="h-6 w-6" />
                       </div>
                       <div>
                          <p class="text-base font-bold text-gray-900">{{ aud.label }}</p>
                          <p class="text-xs text-gray-400 font-medium">{{ aud.description }}</p>
                       </div>
                    </button>
                 </div>
              </div>
           </div>

           <!-- Role Filters -->
           <div v-if="form.targetAudience === 'roles'" class="animate-in fade-in slide-in-from-top-2 duration-300">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Select groups</p>
              <div class="flex flex-wrap gap-3">
                 <button 
                  v-for="role in roles" 
                  :key="role.value"
                  @click="toggleRole(role.value)"
                  class="px-5 py-3 rounded-2xl border text-sm font-bold transition-premium shadow-none"
                  :class="form.targetRoles.includes(role.value) ? 'bg-brand-blue border-brand-blue text-white' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-brand-blue/30'"
                 >
                   {{ role.label }}
                 </button>
              </div>
           </div>

           <!-- User Search Selector -->
           <div v-if="form.targetAudience === 'specific'" class="animate-in fade-in slide-in-from-top-2 duration-300 space-y-5">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Select members</p>
              <div class="relative">
                 <input 
                   v-model="userSearchTerm" 
                   @input="searchUsers"
                   type="text" 
                   placeholder="Search names or emails..."
                   class="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium shadow-none"
                 />
                 <div v-if="userSearchResults.length > 0" class="absolute z-50 w-full mt-3 bg-white border border-gray-100 rounded-[1.5rem] p-2 shadow-none border-b-4 border-b-brand-blue/5">
                    <button v-for="user in userSearchResults" :key="user._id" @click="addUser(user)" class="w-full p-4 text-left hover:bg-gray-50 flex items-center rounded-xl">
                       <div class="h-10 w-10 bg-brand-blue/5 rounded-xl flex items-center justify-center text-brand-blue font-bold text-sm mr-4 shadow-none">{{ user.firstName[0] }}</div>
                       <div>
                          <p class="text-sm font-bold text-gray-900">{{ user.firstName }} {{ user.lastName }}</p>
                          <p class="text-xs text-gray-400 ">{{ user.email }}</p>
                       </div>
                    </button>
                 </div>
              </div>
              <div class="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
                 <div v-for="user in selectedUsersDetails" :key="user._id" class="flex items-center px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in zoom-in-50 shadow-none">
                    <span class="text-xs font-bold text-gray-900 mr-2">{{ user.firstName }}</span>
                    <XMarkIcon @click="removeUser(user._id)" class="h-4 w-4 text-gray-400 hover:text-red-500 cursor-pointer" />
                 </div>
              </div>
           </div>

           <!-- Deployment Strategy (Dropdown) -->
           <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">When to send?</p>
              <div class="relative">
                 <button 
                   @click="showTimingList = !showTimingList"
                   class="w-full flex items-center justify-between p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100 hover:border-brand-blue hover:bg-white transition-premium outline-none shadow-none"
                 >
                    <div class="text-left">
                       <p class="text-base font-bold text-gray-900">{{ selectedTiming?.label }}</p>
                       <p class="text-xs text-gray-400 font-medium">{{ selectedTiming?.description }}</p>
                    </div>
                    <ChevronDownIcon class="h-6 w-6 text-gray-400 transition-premium" :class="{ 'rotate-180': showTimingList }" />
                 </button>

                 <!-- Timing Dropdown -->
                 <div v-if="showTimingList" class="absolute z-50 w-full mt-3 bg-white border border-gray-100 rounded-[2rem] p-3 animate-in fade-in zoom-in-95 duration-200 shadow-none border-b-4 border-b-brand-blue/5">
                    <button 
                      v-for="time in timingOptions" 
                      :key="time.value"
                      @click="selectTiming(time)"
                      class="w-full p-5 rounded-2xl hover:bg-gray-50 transition-premium group text-left shadow-none"
                      :class="{ 'bg-brand-blue/5': sendTiming === time.value }"
                    >
                       <p class="text-base font-bold text-gray-900">{{ time.label }}</p>
                       <p class="text-xs text-gray-400 font-medium group-hover:text-brand-blue transition-premium">{{ time.description }}</p>
                    </button>
                 </div>
              </div>
              
              <div v-if="sendTiming === 'schedule'" class="mt-5 p-5 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300 shadow-none">
                 <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Select date & time</label>
                 <input v-model="form.scheduledAt" type="datetime-local" class="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 font-bold text-sm text-gray-900 outline-none shadow-none" />
              </div>
           </div>

           <!-- Summary Section -->
           <div class="p-8 bg-gray-50 rounded-[2rem] space-y-5 border border-gray-100 shadow-none">
              <div class="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                 <span class="text-gray-400">Target count</span>
                 <span class="text-brand-blue font-bold">{{ recipientCount }}</span>
              </div>
              <div class="h-1.5 w-full bg-white rounded-full overflow-hidden border border-gray-100">
                 <div class="h-full bg-brand-blue transition-all duration-1000" :style="{ width: recipientCount === 'Global' ? '100%' : (typeof recipientCount === 'number' ? '40%' : '10%') }"></div>
              </div>
              <p class="text-xs  text-gray-400 text-center leading-relaxed">Everything looks good! You can save this as a draft or send it now.</p>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  ArrowLeftIcon, 
  CloudArrowUpIcon,
  UsersIcon,
  BoltIcon,
  UserGroupIcon,
  IdentificationIcon,
  PlusIcon,
  XMarkIcon,
  ChevronDownIcon,
  PhotoIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import { useCustomToast } from '@/composables/core/useCustomToast'
import { adminApiFactory } from '@/api_factory/modules/admin'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const isEdit = computed(() => !!route.query.id)
const { showToast } = useCustomToast()
const saving = ref(false)
const uploading = ref(false)
const showAudienceList = ref(false)
const showTimingList = ref(false)
const sendTiming = ref<'immediate' | 'schedule' | 'draft'>('immediate')
const fileInput = ref<HTMLInputElement | null>(null)

const audiences = [
  { label: 'All users', icon: BoltIcon, value: 'all', userFriendly: 'Send to everyone', description: 'Every registered member on Flybeth.' },
  { label: 'Active members', icon: UsersIcon, value: 'active', userFriendly: 'Target engaged users', description: 'Users who have logged in recently.' },
  { label: 'Specific groups', icon: UserGroupIcon, value: 'roles', userFriendly: 'Choose by role type', description: 'Customers, agents, or staff.' },
  { label: 'Custom selection', icon: IdentificationIcon, value: 'specific', userFriendly: 'Pick specific people', description: 'Search and add members manually.' }
]

const roles = [
  { label: 'Customers', value: 'customer' },
  { label: 'Agents', value: 'agent' },
  { label: 'Staff members', value: 'staff' }
]

const timingOptions = [
  { label: 'Send right away', value: 'immediate', description: 'Blast emails as soon as you save.' },
  { label: 'Schedule for later', value: 'schedule', description: 'Pick a future time and date.' },
  { label: 'Save as draft', value: 'draft', description: 'Keep it for later without sending.' }
]

const form = ref({
  title: '',
  subject: '',
  content: '',
  imageUrl: '',
  targetAudience: 'all',
  targetRoles: ['customer'],
  specificUsers: [] as string[],
  customEmails: [] as string[],
  scheduledAt: ''
})

const selectedAudience = computed(() => audiences.find(a => a.value === form.value.targetAudience))
const selectedTiming = computed(() => timingOptions.find(t => t.value === sendTiming.value))

const selectAudience = (aud: any) => {
   form.value.targetAudience = aud.value
   showAudienceList.value = false
}

const selectTiming = (time: any) => {
   sendTiming.value = time.value
   showTimingList.value = false
}

const toggleRole = (val: string) => {
   const index = form.value.targetRoles.indexOf(val)
   if (index > -1) form.value.targetRoles.splice(index, 1)
   else form.value.targetRoles.push(val)
}

// User Selection Logic
const userSearchTerm = ref('')
const userSearchResults = ref<any[]>([])
const selectedUsersDetails = ref<any[]>([])

const searchUsers = async () => {
    if (userSearchTerm.value.length < 2) {
       userSearchResults.value = []
       return
    }
    const res = await adminApiFactory.getUsers({ search: userSearchTerm.value, limit: 10 })
    userSearchResults.value = res.data?.data || []
}

const addUser = (user: any) => {
    if (!form.value.specificUsers.includes(user._id)) {
        form.value.specificUsers.push(user._id)
        selectedUsersDetails.value.push(user)
    }
    userSearchTerm.value = ''
    userSearchResults.value = []
}

const removeUser = (id: string) => {
    form.value.specificUsers = form.value.specificUsers.filter(u => u !== id)
    selectedUsersDetails.value = selectedUsersDetails.value.filter(u => u._id !== id)
}

// Image Upload Logic
const triggerUpload = () => fileInput.value?.click()

const handleFileUpload = async (event: Event) => {
   const file = (event.target as HTMLInputElement).files?.[0]
   if (!file) return
   
   uploading.value = true
   const formData = new FormData()
   formData.append('file', file)
   
   try {
      const res = await adminApiFactory.uploadFile(formData)
      const uploadedUrl = res.data?.data?.url || res.data?.url
      if (uploadedUrl) {
        form.value.imageUrl = uploadedUrl
        showToast({ title: 'Visual Synced', message: 'Campaign banner updated.', toastType: 'success' })
      }
   } catch (e) {
      showToast({ title: 'Upload Failed', message: 'Failed to sync image.', toastType: 'error' })
   } finally {
      uploading.value = false
   }
}

const recipientCount = computed(() => {
   if (form.value.targetAudience === 'all') return 'Global'
   if (form.value.targetAudience === 'specific') return form.value.specificUsers.length
   return 'Segmented'
})

const buttonLabel = computed(() => {
  if (saving.value) return 'Saving...'
  if (sendTiming.value === 'immediate') return 'Send campaign now'
  if (sendTiming.value === 'schedule') return 'Schedule campaign'
  return 'Save as draft'
})

const saveCampaign = async () => {
  if (!form.value.title || !form.value.subject) {
    showToast({ title: 'Wait!', message: 'Please add a name and subject first.', toastType: 'error' })
    return
  }
  
  if (sendTiming.value === 'schedule' && !form.value.scheduledAt) {
    showToast({ title: 'Logic Error', message: 'Please select a date for the scheduled send.', toastType: 'error' })
    return
  }

  saving.value = true
  try {
    const payload: any = { ...form.value }
    
    // Aggressively fix the ISO 8601 validation issue
    if (sendTiming.value === 'schedule' && payload.scheduledAt) {
        payload.scheduledAt = new Date(payload.scheduledAt).toISOString()
    } else {
        delete payload.scheduledAt // COMPLETELY REMOVE if not scheduling to avoid backend val errors
    }
    
    const res = isEdit.value 
        ? await adminApiFactory.updateCampaign(route.query.id as string, payload)
        : await adminApiFactory.createCampaign(payload)
        
    const data = res?.data?.data || res?.data
    const campaignId = data?._id

    if (sendTiming.value === 'immediate' && campaignId) {
        await adminApiFactory.sendCampaign(campaignId)
        showToast({ title: 'Success', message: 'Campaign sent successfully.', toastType: 'success' })
    } else {
        showToast({ title: 'Saved', message: 'Campaign saved successfully.', toastType: 'success' })
    }

    navigateTo('/campaigns')
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Protocol failure.'
    showToast({ title: 'Error', message: msg, toastType: 'error' })
  } finally {
    saving.value = false
  }
}

// Load existing if Edit
onMounted(async () => {
   if (isEdit.value) {
      const res = await adminApiFactory.getCampaigns()
      const list = res.data?.data || res.data
      const existing = list.find((c: any) => c._id === route.query.id)
      if (existing) {
         form.value = { ...existing }
         if (existing.scheduledAt) {
            sendTiming.value = 'schedule'
            form.value.scheduledAt = new Date(existing.scheduledAt).toISOString().slice(0, 16)
         } else if (existing.status === 'draft') {
            sendTiming.value = 'draft'
         }
         
         if (existing.targetAudience === 'specific' && existing.specificUsers?.length) {
             for (const userId of existing.specificUsers) {
                 const uRes = await adminApiFactory.getUser(userId)
                 const uData = uRes.data?.data || uRes.data
                 if (uData) selectedUsersDetails.value.push(uData)
             }
         }
      }
   }
})
</script>
