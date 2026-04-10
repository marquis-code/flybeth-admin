<template>
  <div class="space-y-8 pb-12">
    <!-- Loading -->
    <div v-if="!agent && loading" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center space-y-4">
        <div class="h-10 w-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="text-sm font-medium text-gray-400">Loading agent details...</p>
      </div>
    </div>

    <template v-else-if="agent">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <button @click="navigateTo('/agents')" class="flex items-center text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors mb-2">
            <ArrowLeftIcon class="w-3.5 h-3.5 mr-1.5" /> Back to agents
          </button>
          <h1 class="text-2xl font-semibold text-gray-900">Review application</h1>
          <p class="text-sm text-gray-400">Verify credentials and compliance documents.</p>
        </div>

        <div class="flex gap-3">
          <UiBaseButton variant="secondary" @click="requestInfo">Request info</UiBaseButton>
          <UiBaseButton variant="danger" @click="rejectAgent">Reject</UiBaseButton>
          <UiBaseButton variant="primary" @click="approveAgent">Approve</UiBaseButton>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left Column: Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Business Information -->
          <UiBaseCard>
            <template #header>
              <h3 class="text-base font-semibold text-gray-900">Business information</h3>
            </template>
            <div class="grid md:grid-cols-2 gap-6 py-4">
              <DetailItem label="Legal name" :value="agent?.agentProfile?.agencyName" />
              <DetailItem label="Registration number" :value="agent?.agentProfile?.registrationNumber" />
              <DetailItem label="Country" :value="agent?.agentProfile?.country" />
              <DetailItem label="Website" :value="agent?.agentProfile?.website" />
              <DetailItem label="Address" :value="agent?.agentProfile?.businessAddress" class="md:col-span-2" />
            </div>
          </UiBaseCard>

          <!-- Identity & Documents -->
          <UiBaseCard>
            <template #header>
              <h3 class="text-base font-semibold text-gray-900">Verification documents</h3>
            </template>
            <div class="grid md:grid-cols-2 gap-6 py-4">
              <div class="space-y-2">
                  <p class="text-xs font-medium text-gray-400">Government ID</p>
                  <div class="aspect-video rounded-xl bg-gray-100 border border-gray-100 overflow-hidden group relative cursor-pointer" @click="openPreview(agent?.agentProfile?.idCardUrl)">
                      <img v-if="agent?.agentProfile?.idCardUrl" :src="agent.agentProfile.idCardUrl" class="w-full h-full object-cover">
                      <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span class="text-xs font-medium text-white px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg">View document</span>
                      </div>
                  </div>
              </div>
              <div class="space-y-2">
                  <p class="text-xs font-medium text-gray-400">Selfie verification</p>
                  <div class="aspect-video rounded-xl bg-gray-100 border border-gray-100 overflow-hidden group relative cursor-pointer" @click="openPreview(agent?.agentProfile?.selfieUrl)">
                      <img v-if="agent?.agentProfile?.selfieUrl" :src="agent.agentProfile.selfieUrl" class="w-full h-full object-cover">
                      <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span class="text-xs font-medium text-white px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg">View photo</span>
                      </div>
                  </div>
              </div>
              <div v-if="agent?.agentProfile?.cacCertificateUrl" class="md:col-span-2 space-y-2">
                  <p class="text-xs font-medium text-gray-400">CAC certificate</p>
                  <div class="p-4 border border-gray-100 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" @click="openPreview(agent?.agentProfile.cacCertificateUrl)">
                      <div class="flex items-center">
                          <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                              <DocumentTextIcon class="w-5 h-5 text-blue-600" />
                          </div>
                          <span class="text-sm font-medium text-gray-900">CAC_Certificate.pdf</span>
                      </div>
                      <ArrowRightIcon class="w-4 h-4 text-gray-400" />
                  </div>
              </div>
            </div>
          </UiBaseCard>

          <!-- Payment Setup -->
          <UiBaseCard>
            <template #header>
              <h3 class="text-base font-semibold text-gray-900">Payout details</h3>
            </template>
            <div class="grid md:grid-cols-3 gap-6 py-4">
              <DetailItem label="Bank name" :value="agent?.agentProfile?.bankAccountDetails?.bankName" />
              <DetailItem label="Account number" :value="agent?.agentProfile?.bankAccountDetails?.accountNumber" />
              <DetailItem label="Account holder" :value="agent?.agentProfile?.bankAccountDetails?.accountHolder" />
            </div>
          </UiBaseCard>
        </div>

        <!-- Right Column: Sidebar -->
        <div class="space-y-6">
          <UiBaseCard>
            <template #header>
              <h3 class="text-base font-semibold text-gray-900">Application status</h3>
            </template>
            <div class="space-y-6">
              <div class="p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-1" :class="statusBg">
                  <span class="text-xs font-medium mb-1" :class="statusText">Current status</span>
                  <span class="text-lg font-semibold capitalize" :class="statusText">{{ agent?.agentStatus }}</span>
              </div>
              <div class="space-y-3">
                 <p class="text-xs font-medium text-gray-400">Upgrade tier</p>
                 <div class="grid grid-cols-1 gap-2">
                     <button v-for="tier in tiers" :key="tier" @click="updateTier(tier)" :class="['px-4 py-2.5 rounded-lg text-xs font-medium capitalize transition-all', agent?.agentTier === tier ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100']">
                         {{ tier }}
                     </button>
                 </div>
              </div>
              <div class="pt-4 border-t border-gray-100">
                  <p class="text-xs font-medium text-gray-400 mb-3">Verification flags</p>
                  <div class="space-y-2.5">
                      <FlagItem icon="IdentificationIcon" label="Identity verified" :active="!!agent?.agentProfile?.idCardUrl" />
                      <FlagItem icon="ShieldCheckIcon" label="Business validated" :active="agent?.agentStatus === 'approved'" />
                      <FlagItem icon="MapPinIcon" label="Address confirmed" :active="!!agent?.agentProfile?.businessAddress" />
                  </div>
              </div>
            </div>
          </UiBaseCard>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUsers } from '@/composables/modules/users/useUsers'
import { useCustomToast } from '@/composables/core/useCustomToast'
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  ArrowRightIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  MapPinIcon 
} from '@heroicons/vue/24/solid'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const agent = ref<any>(null)
const tiers = ['basic', 'verified', 'premium']

const statusBg = computed(() => {
    switch(agent.value?.agentStatus) {
        case 'approved': return 'bg-emerald-50 border-emerald-200'
        case 'pending': return 'bg-yellow-50 border-yellow-200'
        case 'rejected': return 'bg-red-50 border-red-200'
        default: return 'bg-gray-50 border-gray-200'
    }
})

const statusText = computed(() => {
    switch(agent.value?.agentStatus) {
        case 'approved': return 'text-emerald-600'
        case 'pending': return 'text-yellow-600'
        case 'rejected': return 'text-red-600'
        default: return 'text-gray-500'
    }
})

const { fetchUser, updateAgentStatus, loading } = useUsers()
const { showToast } = useCustomToast()

const fetchAgentData = async () => {
    try {
        const res = await fetchUser(route.params.id as string)
        if (res && res.data) {
            agent.value = res.data
        }
    } catch (error) {
        showToast({ title: 'Error', message: 'Failed to fetch agent details', toastType: 'error' })
    }
}

onMounted(fetchAgentData)

const approveAgent = async () => { 
    if (!confirm('Are you sure you want to approve this agent?')) return
    try {
        await updateAgentStatus(agent.value._id, 'approved')
        agent.value.agentStatus = 'approved'
        showToast({ title: 'Success', message: 'Agent approved and notified!', toastType: 'success' })
    } catch (error) {
        showToast({ title: 'Error', message: 'Approval failed', toastType: 'error' })
    }
}

const rejectAgent = async () => { 
    if (!confirm('Are you sure you want to reject this agent?')) return
    try {
        await updateAgentStatus(agent.value._id, 'rejected')
        agent.value.agentStatus = 'rejected'
        showToast({ title: 'Success', message: 'Agent rejected', toastType: 'success' })
    } catch (error) {
        showToast({ title: 'Error', message: 'Action failed', toastType: 'error' })
    }
}

const updateTier = (tier: string) => { 
    agent.value.agentTier = tier; 
    showToast({ title: 'Success', message: `Tier updated to ${tier}`, toastType: 'success' }) 
}

const requestInfo = () => alert('Requesting more info...')
const openPreview = (url: string) => window.open(url, '_blank')
</script>
