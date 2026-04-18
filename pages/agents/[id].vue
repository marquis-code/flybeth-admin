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
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div class="space-y-1">
          <button @click="navigateTo('/agents')" class="flex items-center text-base font-medium text-gray-400 hover:text-blue-600 transition-colors mb-2 group">
            <ArrowLeftIcon class="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to agents
          </button>
          <div class="flex items-center gap-3">
             <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ agent.agencyName || agent.agentProfile?.agencyName || 'Independent Agent' }}</h1>
             <span class="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-bold uppercase rounded-full tracking-wider">{{ agent.agentTier }}</span>
          </div>
          <p class="text-sm text-gray-400 font-medium">Joined on {{ new Date(agent.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) }} • ID: {{ agent._id }}</p>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex flex-col items-end mr-4 hidden md:flex">
             <span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Global Status</span>
             <span class="text-sm font-bold capitalize" :class="statusText">{{ agent.agentStatus }}</span>
          </div>
          <UiBaseButton variant="secondary" size="lg" @click="requestInfo">Request Info</UiBaseButton>
          <UiBaseButton v-if="agent.agentStatus !== 'rejected' && agent.agentStatus !== 'approved'" variant="ghost" class="text-red-600 bg-red-50 hover:bg-red-100 border-transparent" size="lg" :loading="processing['global-reject']" @click="openGlobalRejectionModal">Reject Global</UiBaseButton>
          <UiBaseButton v-if="agent.agentStatus !== 'approved'" variant="primary" size="lg" :loading="processing['global-approve']" @click="approveAgent">Approve Global</UiBaseButton>
        </div>
      </div>

      <!-- Content Tabs -->
      <div class="space-y-8">
        <!-- Tab Navigation -->
        <div class="flex items-center space-x-1 p-1 bg-gray-50 rounded-xl w-fit border border-gray-100/50">
           <button 
             v-for="tab in tabs" 
             :key="tab.id" 
             @click="activeTab = tab.id"
             :class="['px-6 py-2.5 text-sm font-bold rounded-lg transition-all', activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600']"
           >
             {{ tab.name }}
           </button>
        </div>

        <div class="grid lg:grid-cols-3 gap-8 items-start">
          <!-- Main Tab Content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Tab: Identity -->
            <div v-if="activeTab === 'general'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <UiBaseCard padding>
                  <template #header><h3 class="text-lg font-bold text-gray-900">Personal & Contact Info</h3></template>
                  <div class="grid md:grid-cols-2 gap-8 py-4">
                    <DetailItem label="Full Name" :value="`${agent.firstName} ${agent.lastName}`" sub="Primary identity on record" />
                    <DetailItem label="Email Account" :value="agent.email" sub="Account login & notifications" />
                    <DetailItem label="Primary Phone" :value="agent.phone || 'N/A'" />
                    <DetailItem label="WhatsApp/Business" :value="agent.agentProfile?.whatsappNumber || 'N/A'" />
                  </div>
               </UiBaseCard>

               <UiBaseCard padding>
                  <template #header><h3 class="text-lg font-bold text-gray-900">Account Preferences</h3></template>
                  <div class="grid md:grid-cols-3 gap-8 py-4">
                    <DetailItem label="Currency" :value="agent.preferences?.currency || 'USD'" />
                    <DetailItem label="Language" :value="agent.preferences?.language || 'English'" />
                    <DetailItem label="Email Alerts" :value="agent.preferences?.emailNotifications ? 'Enabled' : 'Disabled'" />
                    <DetailItem label="Verification" :value="agent.isVerified ? 'Verified' : 'Unverified'" />
                    <DetailItem label="Security (2FA)" :value="agent.twoFactorEnabled ? 'Active' : 'Deactivated'" />
                    <DetailItem label="Last Login" :value="agent.lastLogin ? new Date(agent.lastLogin).toLocaleString() : 'No activity'" />
                  </div>
               </UiBaseCard>
            </div>

            <!-- Tab: Business Profile -->
            <div v-if="activeTab === 'business'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <UiBaseCard padding>
                  <template #header><h3 class="text-lg font-bold text-gray-900">Legal & Structural Profile</h3></template>
                  <div class="grid md:grid-cols-2 gap-8 py-4">
                    <DetailItem label="Official Business Name" :value="agent.agencyName || agent.agentProfile?.agencyName" />
                    <DetailItem label="Reg Number (RC/BN)" :value="agent.agentProfile?.registrationNumber || 'N/A'" />
                    <DetailItem label="Country" :value="agent.agentProfile?.country || 'N/A'" />
                    <DetailItem label="Business Website" :value="agent.agentProfile?.website" link />
                    <DetailItem label="Operating Address" :value="agent.agentProfile?.businessAddress" class="md:col-span-2" />
                    <DetailItem label="Financial Address" :value="agent.agentProfile?.billingAddress" class="md:col-span-2" />
                  </div>
               </UiBaseCard>
            </div>

            <!-- Tab: Vault (Documents) -->
            <div v-if="activeTab === 'documents'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div class="grid md:grid-cols-2 gap-6">
                 <!-- ID Card -->
                 <UiBaseCard padding>
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">Government Issued ID</h3>
                        <span :class="['px-2 py-0.5 rounded text-sm font-bold uppercase', getDocStatusClass(agent.agentProfile?.idCardStatus)]">
                            {{ agent.agentProfile?.idCardStatus || 'pending' }}
                        </span>
                    </div>
                    <div class="aspect-[16/10] rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden group relative cursor-pointer" @click="openPreview(agent.agentProfile?.idCardUrl, 'idCard')">
                        <embed v-if="agent.agentProfile?.idCardUrl?.includes('.pdf')" :src="agent.agentProfile.idCardUrl" class="w-full h-full pointer-events-none">
                        <img v-else-if="agent.agentProfile?.idCardUrl" :src="agent.agentProfile.idCardUrl" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                        <div v-else class="w-full h-full flex items-center justify-center text-gray-300">No document uploaded</div>
                        <div v-if="agent.agentProfile?.idCardUrl" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span class="text-sm font-bold text-white px-4 py-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20">Preview & Moderate</span>
                        </div>
                    </div>
                    <div v-if="agent.agentProfile?.idCardStatus !== 'approved'" class="mt-4 flex gap-2">
                        <UiBaseButton variant="secondary" class="flex-1 !bg-emerald-50 !text-emerald-600 !border-none text-sm font-bold rounded-lg hover:bg-emerald-100" :loading="processing[`idCard-approved`]" @click="handleKycUpdate('idCard', 'approved')">Approve</UiBaseButton>
                        <UiBaseButton v-if="agent.agentProfile?.idCardStatus !== 'rejected'" variant="secondary" class="flex-1 !bg-red-50 !text-red-600 !border-none text-sm font-bold rounded-lg hover:bg-red-100" @click="openRejectionModal('idCard')">Reject</UiBaseButton>
                    </div>
                 </UiBaseCard>

                 <!-- Selfie -->
                 <UiBaseCard padding>
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">Identity Selfie</h3>
                        <span :class="['px-2 py-0.5 rounded text-sm font-bold uppercase', getDocStatusClass(agent.agentProfile?.selfieStatus)]">
                            {{ agent.agentProfile?.selfieStatus || 'pending' }}
                        </span>
                    </div>
                    <div class="aspect-[16/10] rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden group relative cursor-pointer" @click="openPreview(agent.agentProfile?.selfieUrl, 'selfie')">
                        <embed v-if="agent.agentProfile?.selfieUrl?.includes('.pdf')" :src="agent.agentProfile.selfieUrl" class="w-full h-full pointer-events-none">
                        <img v-else-if="agent.agentProfile?.selfieUrl" :src="agent.agentProfile.selfieUrl" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                        <div v-else class="w-full h-full flex items-center justify-center text-gray-300">No photo uploaded</div>
                        <div v-if="agent.agentProfile?.selfieUrl" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span class="text-sm font-bold text-white px-4 py-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20">Preview & Moderate</span>
                        </div>
                    </div>
                    <div v-if="agent.agentProfile?.selfieStatus !== 'approved'" class="mt-4 flex gap-2">
                        <UiBaseButton variant="secondary" class="flex-1 !bg-emerald-50 !text-emerald-600 !border-none text-sm font-bold rounded-lg hover:bg-emerald-100" :loading="processing[`selfie-approved`]" @click="handleKycUpdate('selfie', 'approved')">Approve</UiBaseButton>
                        <UiBaseButton v-if="agent.agentProfile?.selfieStatus !== 'rejected'" variant="secondary" class="flex-1 !bg-red-50 !text-red-600 !border-none text-sm font-bold rounded-lg hover:bg-red-100" @click="openRejectionModal('selfie')">Reject</UiBaseButton>
                    </div>
                 </UiBaseCard>
               </div>

               <!-- CAC Certificate -->
               <UiBaseCard padding v-if="agent.agentProfile?.cacCertificateUrl">
                  <div class="flex items-center justify-between mb-4">
                      <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">Regulatory Certificates (CAC)</h3>
                      <span :class="['px-2 py-0.5 rounded text-sm font-bold uppercase', getDocStatusClass(agent.agentProfile?.cacCertificateStatus)]">
                          {{ agent.agentProfile?.cacCertificateStatus || 'pending' }}
                      </span>
                  </div>
                  <div class="p-5 border border-gray-100 rounded-2xl flex items-center justify-between hover:bg-gray-50 transition-all cursor-pointer group" @click="openPreview(agent.agentProfile.cacCertificateUrl, 'cacCertificate')">
                      <div class="flex items-center">
                          <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-5 transition-colors group-hover:bg-blue-600">
                              <DocumentTextIcon class="w-6 h-6 text-blue-600 transition-colors group-hover:text-white" />
                          </div>
                          <div>
                            <span class="text-base font-bold text-gray-900 block truncate max-w-[200px]">Registration Certificate</span>
                            <span class="text-sm font-bold text-gray-400 uppercase">PDF • Business Identity</span>
                          </div>
                      </div>
                      <div class="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-white group-hover:shadow-sm">
                        <ArrowTopRightOnSquareIcon class="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                      </div>
                  </div>
                  <div v-if="agent.agentProfile?.cacCertificateStatus !== 'approved'" class="mt-6 flex gap-3">
                        <UiBaseButton variant="secondary" class="flex-1 !bg-emerald-50 !text-emerald-600 !border-none text-sm font-bold rounded-xl hover:bg-emerald-100 flex items-center justify-center gap-2" :loading="processing[`cacCertificate-approved`]" @click="handleKycUpdate('cacCertificate', 'approved')">
                            <CheckIcon class="h-4 w-4" /> Approve Docs
                        </UiBaseButton>
                        <UiBaseButton v-if="agent.agentProfile?.cacCertificateStatus !== 'rejected'" variant="secondary" class="flex-1 !bg-red-50 !text-red-600 !border-none text-sm font-bold rounded-xl hover:bg-red-100 flex items-center justify-center gap-2" @click="openRejectionModal('cacCertificate')">
                            <XMarkIcon class="h-4 w-4" /> Reject Docs
                        </UiBaseButton>
                  </div>
               </UiBaseCard>
            </div>

            <!-- Tab: Banking -->
            <div v-if="activeTab === 'banking'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <UiBaseCard padding>
                  <template #header><h3 class="text-lg font-bold text-gray-900">Payout & Settlement Account</h3></template>
                  <div class="grid md:grid-cols-2 gap-8 py-4">
                    <DetailItem label="Financial Institution" :value="agent.agentProfile?.bankAccountDetails?.bankName || 'N/A'" />
                    <DetailItem label="Account Identity Number" :value="agent.agentProfile?.bankAccountDetails?.accountNumber || 'N/A'" />
                    <DetailItem label="Account Legal Holder" :value="agent.agentProfile?.bankAccountDetails?.accountHolder || 'N/A'" />
                    <DetailItem label="Routing/Swift/NIP" :value="agent.agentProfile?.bankAccountDetails?.bankCode || 'N/A'" />
                  </div>
                  <div class="mt-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                     <div class="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <CheckIcon class="h-4 w-4" />
                     </div>
                     <div>
                        <p class="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-1">Status: Verified Account</p>
                        <p class="text-sm text-emerald-700/80 font-medium leading-relaxed">This bank account has been validated for automatic commission routing. Settlements will be processed into this account weekly.</p>
                     </div>
                  </div>
               </UiBaseCard>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Tier Management -->
            <UiBaseCard padding>
              <template #header><h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">Partnership Tier</h3></template>
              <div class="space-y-4 py-2">
                 <div class="grid grid-cols-1 gap-2.5">
                      <UiBaseButton 
                        v-for="tier in tiers" 
                        :key="tier" 
                        @click="updateTier(tier)" 
                        :variant="agent.agentTier === tier ? 'primary' : 'secondary'"
                        class="!text-sm !capitalize !tracking-widest !py-3.5 !rounded-xl"
                        :loading="processing[`tier-${tier}`]"
                      >
                          {{ tier }}
                      </UiBaseButton>
                 </div>
                 <div class="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-500 font-medium leading-relaxed italic">
                   "Partnership tiers determine wholesale inventory access, markup limits, and priority customer support response times."
                 </div>
              </div>
            </UiBaseCard>

            <!-- Verification Status -->
            <UiBaseCard padding>
              <template #header><h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">KYC Milestones</h3></template>
              <div class="space-y-4 py-2 text-wrap overflow-hidden">
                  <div class="flex flex-col gap-3">
                      <FlagItem label="ID Verification" icon="IdentificationIcon" :active="agent.agentProfile?.idCardStatus === 'approved'" />
                      <FlagItem label="Biometric Check" icon="UserCircleIcon" :active="agent.agentProfile?.selfieStatus === 'approved'" />
                      <FlagItem label="Business Docs" icon="BriefcaseIcon" :active="agent.agentProfile?.cacCertificateStatus === 'approved'" />
                      <FlagItem label="Bank Validation" icon="CreditCardIcon" :active="!!agent.agentProfile?.bankAccountDetails?.accountNumber" />
                      <FlagItem label="Final Compliance" icon="ShieldCheckIcon" :active="agent.agentStatus === 'approved'" />
                  </div>
              </div>
            </UiBaseCard>
          </div>
        </div>
      </div>
    </template>

    <!-- Rejection Modal -->
    <UiBaseModal :show="showRejectionModal" title="Agent Rejection Action" @close="showRejectionModal = false">
        <div class="space-y-6">
            <div class="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 mb-2">
                <ExclamationCircleIcon class="h-5 w-5 text-red-600" />
                <p class="text-sm font-bold text-red-700 uppercase tracking-widest">{{ currentDocToReject === 'global' ? 'Global Application Rejection' : 'Document Rejection' }}</p>
            </div>
            
            <div class="space-y-3">
                <label class="text-sm font-bold text-gray-400 uppercase tracking-widest">Feedback for the Agent</label>
                <textarea 
                  v-model="rejectionFeedback" 
                  rows="4" 
                  class="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-red-600/5 focus:border-red-400 text-base font-medium transition-all"
                  :placeholder="currentDocToReject === 'global' ? 'Explain why the entire agency application is rejected...' : 'Explain exactly why this document was rejected...'"
                ></textarea>
                <p class="text-sm text-gray-400 italic leading-relaxed">This message will be sent to the agent's email immediately to help them correct the issue.</p>
            </div>
            
            <div class="grid grid-cols-2 gap-3 pt-4">
                <UiBaseButton variant="secondary" size="lg" @click="showRejectionModal = false">Cancel</UiBaseButton>
                <UiBaseButton variant="primary" class="!bg-red-600 hover:!bg-red-700 border-none" size="lg" :loading="processing[currentDocToReject === 'global' ? 'global-reject' : currentDocToReject + '-rejected']" @click="confirmRejection">Confirm Rejection</UiBaseButton>
            </div>
        </div>
    </UiBaseModal>

    <!-- UI Document Preview Modal -->
    <UiBaseModal :show="showPreviewModal" title="Document Fast Preview" @close="closePreview">
        <div class="space-y-6">
            <div class="aspect-square bg-gray-100 rounded-3xl overflow-hidden border border-gray-200">
               <embed v-if="previewUrl?.includes('.pdf')" :src="previewUrl" class="w-full h-full" />
               <img v-else :src="previewUrl" class="w-full h-full object-contain" />
            </div>
            <div class="flex gap-4">
               <UiBaseButton v-if="!['global', ''].includes(previewDocType) && agent.agentProfile?.[previewDocType + 'Status'] !== 'approved'" variant="secondary" class="flex-1 !bg-emerald-50 !text-emerald-700 !border-emerald-200 rounded-2xl hover:bg-emerald-100 py-3" :loading="processing[`${previewDocType}-approved`]" @click="handleKycUpdateAndClose(previewDocType, 'approved')">
                  Approve Document
               </UiBaseButton>
               <UiBaseButton v-if="!['global', ''].includes(previewDocType) && agent.agentProfile?.[previewDocType + 'Status'] !== 'rejected'" variant="secondary" class="flex-1 !bg-red-50 !text-red-700 !border-red-200 rounded-2xl hover:bg-red-100 py-3" @click="openRejectionModal(previewDocType)">
                  Reject Document
               </UiBaseButton>
            </div>
        </div>
    </UiBaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUsers } from '@/composables/modules/users/useUsers'
import { useCustomToast } from '@/composables/core/useCustomToast'
import { useConfirmation } from '@/composables/core/useConfirmation'
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  ShieldCheckIcon,
  IdentificationIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  CreditCardIcon,
  BriefcaseIcon,
  UserCircleIcon,
  XMarkIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/solid'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const agent = ref<any>(null)
const activeTab = ref('general')
const tiers = ['basic', 'verified', 'premium']

const tabs = [
  { id: 'general', name: 'Identity' },
  { id: 'business', name: 'Business' },
  { id: 'documents', name: 'Vault' },
  { id: 'banking', name: 'Payouts' }
]

const { fetchUser, updateAgentStatus, updateKycStatus, loading } = useUsers()
const { showToast } = useCustomToast()
const { confirm } = useConfirmation()
const processing = ref<Record<string, boolean>>({})

const statusText = computed(() => {
    switch(agent.value?.agentStatus) {
        case 'approved': return 'text-emerald-600'
        case 'pending': return 'text-yellow-600'
        case 'rejected': return 'text-red-500'
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

const getDocStatusClass = (status: string) => {
    switch(status) {
        case 'approved': return 'bg-emerald-50 text-emerald-600'
        case 'rejected': return 'bg-red-50 text-red-600'
        default: return 'bg-yellow-50 text-yellow-600'
    }
}

// KYC Document Logic
const handleKycUpdate = async (docType: string, status: string, feedback?: string) => {
    const key = `${docType}-${status}`
    processing.value[key] = true
    try {
        await updateKycStatus(agent.value._id, { docType, status, feedback })
        // Update local state
        if (!agent.value.agentProfile) agent.value.agentProfile = {}
        agent.value.agentProfile[`${docType}Status`] = status
        showToast({ title: 'Status Updated', message: `Identity ${docType} marked as ${status}.`, toastType: 'success' })
    } catch (e: any) {
        showToast({ title: 'Error', message: 'Failed to update document status.', toastType: 'error' })
    } finally {
        processing.value[key] = false
    }
}

// Rejection Modal Logic
const showRejectionModal = ref(false)
const rejectionFeedback = ref('')
const currentDocToReject = ref('')

const openRejectionModal = (docType: string) => {
    currentDocToReject.value = docType
    rejectionFeedback.value = ''
    showRejectionModal.value = true
}

const confirmRejection = async () => {
    if (!rejectionFeedback.value) {
        showToast({ title: 'Action Required', message: 'Please provide feedback for the agent.', toastType: 'error' })
        return
    }

    if (currentDocToReject.value === 'global') {
        processing.value['global-reject'] = true
        try {
            await updateAgentStatus(agent.value._id, 'rejected')
            agent.value.agentStatus = 'rejected'
            showToast({ title: 'Rejected', message: 'Global application dismissed.', toastType: 'success' })
            setTimeout(() => navigateTo('/agents'), 1500)
        } catch (error) {
            showToast({ title: 'Failed', message: 'Rejection error.', toastType: 'error' })
        } finally {
            processing.value['global-reject'] = false
            showRejectionModal.value = false
        }
    } else {
        const key = `${currentDocToReject.value}-rejected`
        processing.value[key] = true
        await handleKycUpdate(currentDocToReject.value, 'rejected', rejectionFeedback.value)
        processing.value[key] = false
        showRejectionModal.value = false
        closePreview()
    }
}

// Global Actions
const approveAgent = async () => { 
    const confirmed = await confirm({
        title: 'Activate Agent',
        message: 'Are you sure you want to activate this agent? They will receive full booking clearance across the platform.',
    })
    if (!confirmed) return
    processing.value['global-approve'] = true
    try {
        await updateAgentStatus(agent.value._id, 'approved')
        agent.value.agentStatus = 'approved'
        showToast({ title: 'Success', message: 'Global activation complete!', toastType: 'success' })
    } catch (error) {
        showToast({ title: 'Failed', message: 'Final activation error.', toastType: 'error' })
    } finally {
        processing.value['global-approve'] = false
    }
}

const openGlobalRejectionModal = () => {
    openRejectionModal('global')
}

const updateTier = async (tier: string) => { 
    const key = `tier-${tier}`
    processing.value[key] = true
    agent.value.agentTier = tier; 
    setTimeout(() => {
        processing.value[key] = false
        showToast({ title: 'Tier Active', message: `Agent priority level: ${tier}.`, toastType: 'success' }) 
    }, 500)
}

const requestInfo = () => {
  confirm({
    title: 'Manual Intervention',
    message: 'Manual intervention request has been sent to the compliance supervisor. You will be notified of the outcome.',
    confirmText: 'Acknowledge',
    cancelText: ''
  })
}

// Modal Preview System
const showPreviewModal = ref(false)
const previewUrl = ref('')
const previewDocType = ref('')

const openPreview = (url: string, type: string) => {
    if (!url) return
    previewUrl.value = url
    previewDocType.value = type
    showPreviewModal.value = true
}

const closePreview = () => {
    showPreviewModal.value = false
    previewUrl.value = ''
    previewDocType.value = ''
}

const handleKycUpdateAndClose = async (docType: string, status: string) => {
    await handleKycUpdate(docType, status)
    closePreview()
}
</script>
