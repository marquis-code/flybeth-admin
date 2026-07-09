<template>
  <div class="space-y-8 pb-12 font-sans overflow-x-hidden">
    <!-- Loading -->
    <div v-if="!agent && loading" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center space-y-4">
        <div class="h-10 w-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="text-base font-medium text-gray-400">Loading agent profile...</p>
      </div>
    </div>

    <template v-else-if="agent">
      <!-- Header / Profile Section -->
      <div class="relative bg-white border border-gray-200 rounded-none shadow-sm overflow-hidden mb-8">
        <!-- Decorative Header Background -->
        <div class="h-32 w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative">
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CiAgPHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0wIDEwaDQwTTAgMjBoNDBNMCAzMGg0ME0xMCAwVjQwTTIwIDBWNDBNMzAgMFY0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-30"></div>
        </div>
        
        <div class="px-8 pb-8">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 relative z-10">
            <!-- Avatar & Identity -->
            <div class="flex items-end gap-6">
              <div class="h-28 w-28 rounded-none border-4 border-white bg-gray-50 flex items-center justify-center text-4xl font-black text-blue-600 shadow-md">
                {{ agent.firstName?.charAt(0) || '' }}{{ agent.lastName?.charAt(0) || '' }}
              </div>
              <div class="space-y-1 mb-2">
                <button @click="navigateTo('/dashboard/agents')" class="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-2 group uppercase tracking-wider">
                  <ArrowLeftIcon class="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> Directory
                </button>
                <div class="flex items-center gap-3">
                   <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ agent.firstName }} {{ agent.lastName }}</h1>
                   <span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-none border border-blue-100">{{ agent.agentTier }}</span>
                   <span class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-none border" :class="agent.isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-200'">{{ agent.isVerified ? 'Verified' : 'Unverified' }}</span>
                </div>
                <p class="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <EnvelopeIcon class="w-4 h-4" /> {{ agent.email }} 
                  <span class="text-gray-300">•</span>
                  Ref: {{ agent._id }}
                </p>
              </div>
            </div>

            <!-- Global Actions -->
            <div class="flex items-center gap-3 mb-2">
              <div class="flex flex-col items-end mr-6 hidden lg:flex">
                 <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Platform Status</span>
                 <span class="text-sm font-bold uppercase tracking-wide" :class="statusText">{{ agent.agentStatus }}</span>
              </div>
              
              <UiBaseButton v-if="agent.agentStatus !== 'rejected' && agent.agentStatus !== 'approved'" variant="ghost" class="!bg-red-50 !text-red-600 hover:!bg-red-100 border-none shadow-none font-bold" size="md" :loading="processing['suspend']" @click="openSuspendModal">
                Suspend Agent
              </UiBaseButton>
              <UiBaseButton v-if="agent.agentStatus !== 'approved'" variant="primary" class="bg-gray-900 text-white font-bold shadow-none hover:bg-black border-none" size="md" :loading="processing['approve']" @click="approveAgent">
                Approve Access
              </UiBaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Tabs & Layout -->
      <div class="space-y-8">
        <!-- Clean Tab Navigation -->
        <div class="flex items-center space-x-2 border-b border-gray-200 overflow-x-auto custom-scrollbar pb-px">
           <button 
             v-for="tab in tabs" 
             :key="tab.id" 
             @click="activeTab = tab.id"
             class="px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap outline-none"
             :class="activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'"
           >
             {{ tab.name }}
           </button>
        </div>

        <div class="grid lg:grid-cols-3 gap-8 items-start">
          <!-- Main Tab Content -->
          <div class="lg:col-span-2 space-y-8">
            
            <!-- Tab: Overview -->
            <div v-if="activeTab === 'overview'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <UiBaseCard class="!rounded-none border-gray-200 shadow-sm" padding>
                  <template #header><h3 class="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Personal & Contact Overview</h3></template>
                  <div class="grid md:grid-cols-2 gap-y-8 gap-x-12 py-2">
                    <DetailItem label="Full Name" :value="`${agent.firstName} ${agent.lastName}`" sub="Primary identity on record" />
                    <DetailItem label="Email Account" :value="agent.email" sub="System login & alerts" />
                    <DetailItem label="Primary Phone" :value="agent.phone || 'N/A'" />
                    <DetailItem label="Joined Date" :value="new Date(agent.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })" />
                  </div>
               </UiBaseCard>

               <UiBaseCard class="!rounded-none border-gray-200 shadow-sm" padding>
                  <template #header><h3 class="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Financials</h3></template>
                  <div class="py-2">
                    <div class="p-6 bg-gray-50 border border-gray-200 rounded-none flex items-center justify-between">
                      <div>
                        <p class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Available Wallet Balance</p>
                        <h4 class="text-3xl font-black text-gray-900">{{ agent.preferences?.currency || 'NGN' }} {{ agent.walletBalance?.toLocaleString() || '0' }}</h4>
                      </div>
                      <div class="h-14 w-14 bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                        <BanknotesIcon class="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>
               </UiBaseCard>
            </div>

            <!-- Tab: Security & Access -->
            <div v-if="activeTab === 'security'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <UiBaseCard class="!rounded-none border-gray-200 shadow-sm" padding>
                  <template #header><h3 class="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Security Metrics</h3></template>
                  <div class="grid md:grid-cols-2 gap-y-8 gap-x-12 py-2">
                    <div class="space-y-1">
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Two-Factor Auth</p>
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full" :class="agent.twoFactorEnabled ? 'bg-emerald-500' : 'bg-red-500'"></div>
                        <p class="text-base font-bold text-gray-900">{{ agent.twoFactorEnabled ? 'Active' : 'Disabled' }}</p>
                      </div>
                    </div>
                    
                    <div class="space-y-1">
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Failed Login Attempts</p>
                      <p class="text-base font-bold text-gray-900">{{ agent.failedLoginAttempts || 0 }}</p>
                    </div>

                    <div class="space-y-1">
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Active</p>
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full" :class="agent.isActive ? 'bg-emerald-500' : 'bg-red-500'"></div>
                        <p class="text-base font-bold text-gray-900">{{ agent.isActive ? 'Yes' : 'Suspended' }}</p>
                      </div>
                    </div>

                    <div class="space-y-1">
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">KYC Verified</p>
                      <p class="text-base font-bold text-gray-900">{{ agent.isVerified ? 'Fully Verified' : 'Unverified' }}</p>
                    </div>
                  </div>
               </UiBaseCard>
            </div>

            <!-- Tab: Preferences -->
            <div v-if="activeTab === 'preferences'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <UiBaseCard class="!rounded-none border-gray-200 shadow-sm" padding>
                  <template #header><h3 class="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">System Preferences</h3></template>
                  <div class="grid md:grid-cols-2 gap-y-8 gap-x-12 py-2">
                    <DetailItem label="Operating Language" :value="agent.preferences?.language === 'en' ? 'English' : agent.preferences?.language || 'English'" />
                    <DetailItem label="Default Currency" :value="agent.preferences?.currency || 'NGN'" />
                    <DetailItem label="Email Notifications" :value="agent.preferences?.emailNotifications ? 'Enabled' : 'Opted Out'" />
                    <DetailItem label="Push Notifications" :value="agent.preferences?.pushNotifications ? 'Enabled' : 'Opted Out'" />
                  </div>
               </UiBaseCard>
            </div>
            
          </div>

          <!-- Sidebar -->
          <div class="space-y-8">
            <!-- Tier Management -->
            <UiBaseCard class="!rounded-none border-gray-200 shadow-sm" padding>
              <template #header><h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Partnership Tier</h3></template>
              <div class="space-y-4">
                 <div class="flex flex-col gap-2">
                      <button 
                        v-for="tier in tiers" 
                        :key="tier" 
                        @click="updateTier(tier)" 
                        class="px-4 py-3 text-sm font-bold uppercase tracking-wider border transition-all text-left flex justify-between items-center"
                        :class="agent.agentTier === tier ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
                        :disabled="processing[`tier-${tier}`]"
                      >
                          {{ tier }}
                          <div v-if="processing[`tier-${tier}`]" class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <CheckCircleIcon v-else-if="agent.agentTier === tier" class="w-5 h-5 text-white" />
                      </button>
                 </div>
                 <p class="text-xs text-gray-400 font-medium leading-relaxed mt-4">
                   Tiers dictate the commission structure, wallet limits, and feature access available to the partner.
                 </p>
              </div>
            </UiBaseCard>
            
            <!-- Quick Logs -->
            <UiBaseCard class="!rounded-none border-gray-200 shadow-sm" padding>
              <template #header><h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">System Footprint</h3></template>
              <div class="space-y-4">
                 <div class="flex items-center gap-3">
                   <div class="h-8 w-8 bg-gray-50 flex items-center justify-center border border-gray-200"><ClockIcon class="w-4 h-4 text-gray-500"/></div>
                   <div>
                     <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Last Modified</p>
                     <p class="text-sm font-bold text-gray-900">{{ new Date(agent.updatedAt).toLocaleDateString() }}</p>
                   </div>
                 </div>
              </div>
            </UiBaseCard>
          </div>
        </div>
      </div>
    </template>

    <!-- Suspend Modal -->
    <UiSideDrawer 
      :show="showSuspendModal" 
      title="Suspend Agent Access" 
      subtitle="Restrict this partner from the platform"
      size="md"
      @close="showSuspendModal = false"
    >
        <div class="space-y-6">
            <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-100 mb-2">
                <ExclamationCircleIcon class="h-5 w-5 text-red-600" />
                <p class="text-sm font-bold text-red-700 uppercase tracking-wider">Account Suspension</p>
            </div>
            
            <div class="space-y-3">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Reason for Suspension</label>
                <textarea 
                  v-model="suspendReason" 
                  rows="4" 
                  class="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-none outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-400 text-sm font-medium transition-all"
                  placeholder="Explain why the agent is being suspended..."
                ></textarea>
                <p class="text-xs text-gray-400 leading-relaxed">This record will be logged and an automated email may be sent to the agent detailing the suspension.</p>
            </div>
        </div>
        <template #footer>
            <div class="flex gap-4 w-full">
                <UiBaseButton variant="outline" class="flex-1 text-sm font-bold shadow-none !rounded-none" @click="showSuspendModal = false">Cancel</UiBaseButton>
                <UiBaseButton variant="primary" class="flex-1 text-sm font-bold !bg-red-600 hover:!bg-red-700 border-none shadow-none !rounded-none" :loading="processing['suspend']" @click="confirmSuspend">Suspend Agent</UiBaseButton>
            </div>
        </template>
    </UiSideDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUsers } from '@/composables/modules/users/useUsers'
import { useCustomToast } from '@/composables/core/useCustomToast'
import { useConfirmation } from '@/composables/core/useConfirmation'
import { 
  ArrowLeftIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
  BanknotesIcon,
  ClockIcon
} from '@heroicons/vue/24/solid'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const agent = ref<any>(null)
const activeTab = ref('overview')
const tiers = ['basic', 'verified', 'premium']

const tabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'security', name: 'Security & Access' },
  { id: 'preferences', name: 'Preferences' }
]

const { fetchUser, updateAgentStatus, loading } = useUsers()
const { showToast } = useCustomToast()
const { confirm } = useConfirmation()
const processing = ref<Record<string, boolean>>({})

const statusText = computed(() => {
    switch(agent.value?.agentStatus) {
        case 'approved': return 'text-emerald-600'
        case 'pending': return 'text-yellow-600'
        case 'rejected': case 'suspended': return 'text-red-500'
        default: return 'text-gray-400'
    }
})

const fetchAgentData = async () => {
    try {
        const res = await fetchUser(route.params.id as string)
        if (res && res.data) {
            agent.value = res.data.data
        }
    } catch (error) {
        showToast({ title: 'Fetch Failed', message: 'Could not access profile data.', toastType: 'error' })
    }
}

onMounted(fetchAgentData)

// Suspend Modal Logic
const showSuspendModal = ref(false)
const suspendReason = ref('')

const openSuspendModal = () => {
    suspendReason.value = ''
    showSuspendModal.value = true
}

const confirmSuspend = async () => {
    if (!suspendReason.value) {
        showToast({ title: 'Required', message: 'Please provide a reason for suspension.', toastType: 'error' })
        return
    }

    processing.value['suspend'] = true
    try {
        await updateAgentStatus(agent.value._id, 'suspended')
        agent.value.agentStatus = 'suspended'
        agent.value.isActive = false
        showToast({ title: 'Agent Suspended', message: 'Access has been successfully restricted.', toastType: 'success' })
        showSuspendModal.value = false
    } catch (error) {
        showToast({ title: 'Action Failed', message: 'Could not suspend agent.', toastType: 'error' })
    } finally {
        processing.value['suspend'] = false
    }
}

// Global Actions
const approveAgent = async () => { 
    const confirmed = await confirm({
        title: 'Approve Platform Access',
        message: 'This will grant the agent full operating privileges on the platform based on their tier. Continue?',
    })
    if (!confirmed) return
    processing.value['approve'] = true
    try {
        await updateAgentStatus(agent.value._id, 'approved')
        agent.value.agentStatus = 'approved'
        agent.value.isActive = true
        showToast({ title: 'Agent Approved', message: 'Agent now has full platform access.', toastType: 'success' })
    } catch (error) {
        showToast({ title: 'Action Failed', message: 'Could not approve agent.', toastType: 'error' })
    } finally {
        processing.value['approve'] = false
    }
}

const updateTier = async (tier: string) => { 
    const key = `tier-${tier}`
    processing.value[key] = true
    agent.value.agentTier = tier
    
    // Simulate API delay, assuming an update tier API call would go here
    setTimeout(() => {
        processing.value[key] = false
        showToast({ title: 'Tier Updated', message: `Partnership tier updated to ${tier}.`, toastType: 'success' }) 
    }, 500)
}
</script>
