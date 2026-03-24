<template>
  <div class="space-y-8 pb-12">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <button @click="navigateTo('/agents')" class="flex items-center text-[10px] font-black uppercase tracking-widest text-brand-gray/40 hover:text-secondary transition-colors mb-2">
          <ArrowLeftIcon class="w-3 h-3 mr-1" /> Back to list
        </button>
        <h1 class="text-4xl font-black text-brand-blue tracking-tighter">Review Application</h1>
        <p class="text-brand-gray/60 font-medium">Verify credentials and compliance documents.</p>
      </div>

      <div class="flex gap-4">
        <BaseButton variant="secondary" @click="requestInfo">Request Info</BaseButton>
        <BaseButton variant="danger" @click="rejectAgent">Reject Partner</BaseButton>
        <BaseButton variant="primary" @click="approveAgent">Approve Partner</BaseButton>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Left Column: Details -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Business Information -->
        <UiBaseCard>
          <template #header>
            <h3 class="text-lg font-black text-brand-blue tracking-tight">Business Intelligence</h3>
          </template>
          <div class="grid md:grid-cols-2 gap-8 py-4">
            <DetailItem label="Legal Name" :value="agent?.agentProfile?.agencyName" />
            <DetailItem label="Reg Number" :value="agent?.agentProfile?.registrationNumber" />
            <DetailItem label="Operating Country" :value="agent?.agentProfile?.country" />
            <DetailItem label="Website / Social" :value="agent?.agentProfile?.website" />
            <DetailItem label="Address" :value="agent?.agentProfile?.businessAddress" class="md:col-span-2" />
          </div>
        </UiBaseCard>

        <!-- Identity & Documents -->
        <UiBaseCard>
          <template #header>
            <h3 class="text-lg font-black text-brand-blue tracking-tight">Verification Assets</h3>
          </template>
          <div class="grid md:grid-cols-2 gap-8 py-4">
            <div class="space-y-2">
                <p class="text-[10px] font-black uppercase tracking-widest text-brand-gray/40">Government ID</p>
                <div class="aspect-video rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden group relative cursor-pointer" @click="openPreview(agent?.agentProfile?.idCardUrl)">
                    <img v-if="agent?.agentProfile?.idCardUrl" :src="agent.agentProfile.idCardUrl" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-brand-blue/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span class="text-xs font-black text-white px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl">View Document</span>
                    </div>
                </div>
            </div>
            <div class="space-y-2">
                <p class="text-[10px] font-black uppercase tracking-widest text-brand-gray/40">Selfie Verification</p>
                <div class="aspect-video rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden group relative cursor-pointer" @click="openPreview(agent?.agentProfile?.selfieUrl)">
                    <img v-if="agent?.agentProfile?.selfieUrl" :src="agent.agentProfile.selfieUrl" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-brand-blue/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span class="text-xs font-black text-white px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl">View Photo</span>
                    </div>
                </div>
            </div>
            <div v-if="agent?.agentProfile?.cacCertificateUrl" class="md:col-span-2 space-y-2">
                <p class="text-[10px] font-black uppercase tracking-widest text-brand-gray/40">Regional Compliance (CAC)</p>
                <div class="p-6 border border-gray-100 rounded-2xl flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer" @click="openPreview(agent?.agentProfile.cacCertificateUrl)">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center mr-4">
                            <DocumentTextIcon class="w-5 h-5 text-secondary" />
                        </div>
                        <span class="text-sm font-bold text-brand-blue">CAC_Certificate.pdf</span>
                    </div>
                    <ArrowRightIcon class="w-4 h-4 text-brand-gray/30" />
                </div>
            </div>
          </div>
        </UiBaseCard>

        <!-- Payment Setup -->
        <UiBaseCard>
          <template #header>
            <h3 class="text-lg font-black text-brand-blue tracking-tight">Payout Configuration</h3>
          </template>
          <div class="grid md:grid-cols-3 gap-8 py-4">
            <DetailItem label="Bank Name" :value="agent?.agentProfile?.bankAccountDetails?.bankName" />
            <DetailItem label="Account Number" :value="agent?.agentProfile?.bankAccountDetails?.accountNumber" />
            <DetailItem label="Account Holder" :value="agent?.agentProfile?.bankAccountDetails?.accountHolder" />
          </div>
        </UiBaseCard>
      </div>

      <!-- Right Column: Sidebar -->
      <div class="space-y-8">
        <UiBaseCard>
          <template #header>
            <h3 class="text-lg font-black text-brand-blue tracking-tight">Application Status</h3>
          </template>
          <div class="space-y-6">
            <div class="p-4 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2" :class="statusBg">
                <span class="text-[10px] font-black uppercase tracking-widest mb-1" :class="statusText">Current Status</span>
                <span class="text-xl font-black uppercase tracking-tight" :class="statusText">{{ agent?.agentStatus }}</span>
            </div>
            <div class="space-y-4">
               <p class="text-[10px] font-black uppercase tracking-widest text-brand-gray/40">Upgrade Tier</p>
               <div class="grid grid-cols-1 gap-2">
                   <button v-for="tier in tiers" :key="tier" @click="updateTier(tier)" :class="['px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all', agent?.agentTier === tier ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-gray-50 text-brand-gray hover:bg-gray-100']">
                       {{ tier }}
                   </button>
               </div>
            </div>
            <div class="pt-6 border-t border-gray-50">
                <p class="text-[10px] font-black uppercase tracking-widest text-brand-gray/40 mb-4">Integrity Flags</p>
                <div class="space-y-3">
                    <FlagItem icon="IdentificationIcon" label="Identity Verified" :active="true" />
                    <FlagItem icon="ShieldCheckIcon" label="Business Validated" :active="false" />
                    <FlagItem icon="MapPinIcon" label="Address Match" :active="true" />
                </div>
            </div>
          </div>
        </UiBaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  ArrowRightIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  MapPinIcon 
} from '@heroicons/vue/24/solid'

const route = useRoute()
const agent = ref<any>(null)
const tiers = ['basic', 'verified', 'premium']

const statusBg = computed(() => {
    switch(agent.value?.agentStatus) {
        case 'approved': return 'bg-green-50 border-green-100'
        case 'pending': return 'bg-yellow-50 border-yellow-100'
        case 'rejected': return 'bg-red-50 border-red-100'
        default: return 'bg-gray-50 border-gray-100'
    }
})

const statusText = computed(() => {
    switch(agent.value?.agentStatus) {
        case 'approved': return 'text-green-600'
        case 'pending': return 'text-yellow-600'
        case 'rejected': return 'text-red-600'
        default: return 'text-brand-gray'
    }
})

// Mock fetch
const fetchAgent = async () => {
    // API Placeholder
    // const res = await useApi().get(`/admin/agents/${route.params.id}`)
    // agent.value = res.data
    
    agent.value = {
        _id: route.params.id,
        firstName: 'John',
        lastName: 'Obi',
        email: 'john@marquis.com',
        agentStatus: 'pending',
        agentTier: 'basic',
        agentProfile: {
            agencyName: 'Marquis Travels',
            registrationNumber: 'RC123456',
            country: 'Nigeria',
            businessAddress: '123 Victoria Island, Lagos',
            website: 'www.marquistravels.com',
            whatsappNumber: '+2348012345678',
            idCardUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60',
            selfieUrl: 'https://images.unsplash.com/photo-1540560712812-0199042c125d?w=800&auto=format&fit=crop&q=60',
            cacCertificateUrl: '#',
            bankAccountDetails: {
                bankName: 'Access Bank',
                accountNumber: '0123456789',
                accountHolder: 'Marquis Travels LTD'
            }
        }
    }
}

onMounted(fetchAgent)

const requestInfo = () => alert('Requesting more info...')
const approveAgent = () => { agent.value.agentStatus = 'approved'; alert('Agent Approved!') }
const rejectAgent = () => { agent.value.agentStatus = 'rejected'; alert('Agent Rejected!') }
const updateTier = (tier: string) => { agent.value.agentTier = tier; alert(`Tier updated to ${tier}`) }
const openPreview = (url: string) => window.open(url, '_blank')
</script>
