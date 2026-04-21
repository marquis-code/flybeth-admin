<template>
  <div class="space-y-8 pb-12">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex items-center space-x-6">
        <button @click="navigateTo('/tenants')" class="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
          <ArrowLeftIcon class="h-5 w-5" />
        </button>
        <div>
           <div class="flex items-center space-x-3 mb-1">
             <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ tenant?.name }}</h1>
             <span class="px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase" :class="statusClass(tenant?.status)">
               {{ tenant?.status?.replace('_', ' ') || 'Unknown' }}
             </span>
           </div>
           <p class="text-gray-500 text-sm font-bold tracking-widest">Agency ID: {{ tenant?._id }}</p>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <UiBaseButton v-if="tenant?.status !== 'approved' && tenant?.status !== 'active'" variant="primary" size="lg" @click="handleApprove" :loading="updating">
          <CheckBadgeIcon class="h-5 w-5 mr-2" />
          Approve Agency
        </UiBaseButton>
        <UiBaseButton v-if="tenant?.status !== 'rejected'" variant="ghost" size="lg" class="text-red-500 hover:bg-red-50 border-red-100" @click="handleReject" :loading="updating">
          <NoSymbolIcon class="h-5 w-5 mr-2" />
          Reject Application
        </UiBaseButton>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm transition-colors"
          :class="activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Tab Contents -->
    <div class="mt-8">
      
      <!-- TAB: Business Profile -->
      <div v-if="activeTab === 'business'" class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <UiBaseCard padding title="Core Information">
            <div class="grid md:grid-cols-2 gap-8 pt-4">
              <div class="space-y-6">
                 <div class="space-y-1">
                    <p class="text-xs font-bold text-gray-400 tracking-widest uppercase">Registration No.</p>
                    <p class="text-base font-bold text-gray-900">{{ tenant?.businessRegistrationNumber || 'N/A' }}</p>
                 </div>
                 <div class="space-y-1">
                    <p class="text-xs font-bold text-gray-400 tracking-widest uppercase">Country of Operation</p>
                    <p class="text-base font-bold text-gray-900">{{ tenant?.country || 'N/A' }}</p>
                 </div>
              </div>
              <div class="space-y-6">
                 <div class="space-y-1">
                    <p class="text-xs font-bold text-gray-400 tracking-widest uppercase">Billing / Physical Address</p>
                    <p class="text-base font-medium text-gray-900 leading-relaxed">{{ tenant?.billingAddress || 'N/A' }}</p>
                 </div>
                 <div class="space-y-1">
                    <p class="text-xs font-bold text-gray-400 tracking-widest uppercase">Custom White-Label Domain</p>
                    <p class="text-base font-bold text-gray-900 leading-relaxed">{{ tenant?.domain || 'Not configured' }}</p>
                 </div>
              </div>
            </div>
          </UiBaseCard>
          
          <UiBaseCard padding title="Corporate Contacts">
            <div class="grid md:grid-cols-2 gap-8 pt-4">
              <div class="flex items-center space-x-4">
                 <div class="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500">
                    <EnvelopeIcon class="h-6 w-6" />
                 </div>
                 <div>
                    <p class="text-xs font-bold text-gray-400 tracking-widest uppercase">Primary Email</p>
                    <p class="text-base font-bold text-gray-900">{{ tenant?.contactEmail || 'N/A' }}</p>
                 </div>
              </div>
              <div class="flex items-center space-x-4">
                 <div class="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500">
                    <PhoneIcon class="h-6 w-6" />
                 </div>
                 <div>
                    <p class="text-xs font-bold text-gray-400 tracking-widest uppercase">Primary Phone</p>
                    <p class="text-base font-bold text-gray-900">{{ tenant?.contactPhone || 'N/A' }}</p>
                 </div>
              </div>
              <div class="flex items-center space-x-4">
                 <div class="h-12 w-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                    <ChatBubbleLeftRightIcon class="h-6 w-6" />
                 </div>
                 <div>
                    <p class="text-xs font-bold text-gray-400 tracking-widest uppercase">WhatsApp Direct</p>
                    <p class="text-base font-bold text-gray-900">{{ tenant?.whatsappNumber || 'N/A' }}</p>
                 </div>
              </div>
            </div>
          </UiBaseCard>
        </div>
        
        <div class="space-y-8">
          <UiBaseCard padding class="text-center">
             <div class="h-24 w-24 bg-gray-900 rounded-[2.5rem] flex items-center justify-center text-4xl  text-white mx-auto mb-6">
                {{ tenant?.name?.[0] }}
             </div>
             <h4 class="text-xl font-bold text-gray-900 mb-1">{{ tenant?.name }}</h4>
             <p class="text-sm font-bold text-gray-500 tracking-widest">{{ tenant?.slug }}</p>
             
             <div class="mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 pt-8">
               <div>
                  <p class="text-2xl  text-gray-900">{{ tenant?.totalAgents || 0 }}</p>
                  <p class="text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">Staff Bound</p>
               </div>
               <div>
                  <p class="text-2xl  text-gray-900">{{ tenant?.totalBookings || 0 }}</p>
                  <p class="text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">Gross Bookings</p>
               </div>
             </div>
          </UiBaseCard>
        </div>
      </div>

      <!-- TAB: Compliance & KYC -->
      <div v-if="activeTab === 'compliance'" class="grid lg:grid-cols-2 gap-8">
         <UiBaseCard padding title="Agent Verification (KYC)">
          <div class="grid md:grid-cols-2 gap-6 pt-4">
             <div class="space-y-4">
                <p class="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">Gov ID Document</p>
                <div v-if="tenant?.kycDocuments?.idCard" class="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer" @click="openDoc(tenant?.kycDocuments?.idCard)">
                   <embed v-if="tenant?.kycDocuments?.idCard?.includes('.pdf')" :src="tenant?.kycDocuments?.idCard" class="w-full h-full pointer-events-none" />
                   <img v-else :src="tenant?.kycDocuments?.idCard" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   <div class="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <UiBaseButton variant="primary" size="sm">Enlarge Document</UiBaseButton>
                   </div>
                </div>
                <div v-else class="aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                   <p class="text-sm font-bold tracking-widest uppercase">Not uploaded</p>
                </div>
             </div>
             
             <div class="space-y-4">
                <p class="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">Live Selfie Match</p>
                <div v-if="tenant?.kycDocuments?.selfie" class="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer" @click="openDoc(tenant?.kycDocuments?.selfie)">
                   <embed v-if="tenant?.kycDocuments?.selfie?.includes('.pdf')" :src="tenant?.kycDocuments?.selfie" class="w-full h-full pointer-events-none" />
                   <img v-else :src="tenant?.kycDocuments?.selfie" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   <div class="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <UiBaseButton variant="primary" size="sm">View Photo</UiBaseButton>
                   </div>
                </div>
                <div v-else class="aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                   <p class="text-sm font-bold tracking-widest uppercase">Not uploaded</p>
                </div>
             </div>
          </div>
        </UiBaseCard>

        <UiBaseCard padding title="Legal Business Documentation">
           <div class="grid gap-6 pt-4">
             <div class="p-6 bg-white border-2 border-gray-100 rounded-3xl flex items-center justify-between shadow-sm">
                <div class="flex items-center space-x-6">
                   <div class="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <DocumentIcon class="h-8 w-8" />
                   </div>
                   <div>
                      <h5 class="text-base font-bold text-gray-900 tracking-tight">{{ tenant?.country === 'Nigeria' ? 'CAC Certificate' : (tenant?.businessDocuments?.type || 'Registration Doc') }}</h5>
                      <p class="text-xs text-gray-500 font-bold tracking-widest uppercase mt-1">Tax/Reg ID: <span class="text-gray-900">{{ tenant?.businessDocuments?.ein || tenant?.businessRegistrationNumber || 'Not provided' }}</span></p>
                   </div>
                </div>
                
                <UiBaseButton v-if="tenant?.businessDocuments?.documentUrl" variant="secondary" size="md" @click="openDoc(tenant?.businessDocuments?.documentUrl)">
                   Launch Secure PDF
                </UiBaseButton>
                <p v-else class="text-xs font-bold text-red-400 tracking-widest uppercase bg-red-50 px-4 py-2 rounded-lg">Missing File</p>
             </div>
             <div>
                <p class="text-xs font-medium text-gray-500 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span class="font-bold text-gray-900">Compliance Terms Status:</span> {{ tenant?.termsAgreed ? 'Accepted via digital signature during onboarding phase.' : 'Terms not fully accepted.' }}
                </p>
             </div>
           </div>
        </UiBaseCard>
      </div>

      <!-- TAB: Finance & Payouts -->
      <div v-if="activeTab === 'finance'" class="grid lg:grid-cols-2 gap-8">
         <div class="bg-gray-900 text-white overflow-hidden relative rounded-3xl p-8 shadow-xl">
           <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
           <p class="text-xs font-bold text-white/50  uppercase mb-10">Verified Settlement Destination</p>
           
           <div class="space-y-8 relative z-10">
              <div class="space-y-1">
                 <p class="text-xs font-bold text-white/50 tracking-widest uppercase">Institution</p>
                 <p class="text-xl font-bold tracking-tight">{{ tenant?.bankDetails?.bankName || 'Awaiting Setup' }}</p>
              </div>
              <div class="space-y-1">
                 <p class="text-xs font-bold text-white/50 tracking-widest uppercase">Account Beneficiary</p>
                 <p class="text-xl font-bold tracking-tight">{{ tenant?.bankDetails?.accountName || 'Awaiting Setup' }}</p>
              </div>
              <div class="pt-6 border-t border-white/10 flex items-center justify-between">
                 <div>
                   <p class="text-xs font-bold text-white/50 tracking-widest uppercase mb-2">Account Digest</p>
                   <p class="text-3xl  tracking-[0.15em]">{{ tenant?.bankDetails?.accountNumber || '**** ****' }}</p>
                 </div>
                 <div class="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <BanknotesIcon class="h-8 w-8 text-white" />
                 </div>
              </div>
              <div v-if="tenant?.bankDetails?.routingNumber" class="pt-2">
                 <span class="px-3 py-1 bg-white/10 text-xs font-bold rounded-lg text-white/70">Routing: {{ tenant?.bankDetails?.routingNumber }}</span>
              </div>
           </div>
        </div>
        
        <div class="space-y-8">
           <UiBaseCard padding title="Revenue Analytics">
             <div class="p-8 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-gray-100 rounded-3xl min-h-[200px] bg-gray-50">
                <ChartBarIcon class="h-12 w-12 text-gray-500" />
                <p class="text-gray-500 font-bold text-sm text-center">Comprehensive ledger routing for this agency is currently being processed. Analytics block will populate after the first successful net bill transaction.</p>
             </div>
           </UiBaseCard>
        </div>
      </div>

      <!-- TAB: Settings -->
      <div v-if="activeTab === 'settings'" class="gap-8">
        <UiBaseCard padding title="Agency Operational Overrides">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
             <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Global Markup Ceiling</p>
                <div class="flex items-end space-x-2">
                  <p class="text-3xl  text-gray-900">{{ tenant?.settings?.markupPercentage ?? 0 }}</p>
                  <span class="text-black font-bold pb-1">%</span>
                </div>
             </div>
             
             <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Commission Split Rate</p>
                <div class="flex items-end space-x-2">
                  <p class="text-3xl  text-gray-900">{{ tenant?.settings?.commissionPercentage ?? 0 }}</p>
                   <span class="text-black font-bold pb-1">%</span>
                </div>
             </div>
             
             <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Base Currency Link</p>
                <p class="text-3xl  text-gray-900">{{ tenant?.settings?.defaultCurrency || 'USD' }}</p>
             </div>

             <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Subscription Class</p>
                <p class="text-lg font-bold text-gray-900 capitalize">{{ tenant?.subscription?.plan || 'Standard' }}</p>
                <p class="text-xs font-medium text-green-600 mt-1 uppercase tracking-widest">Status: {{ tenant?.subscription?.status || 'Active' }}</p>
             </div>
          </div>
        </UiBaseCard>
      </div>

    </div>

    <!-- NATIVE IN-APP DOCUMENT VIEWER MODAL -->
    <UiBaseModal :model-value="!!previewUrl" @update:model-value="previewUrl = null" :title="`Secure Document Viewer`" max-width="4xl">
      <div v-if="previewUrl" class="space-y-6">
        <div class="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 mt-4 h-[600px] flex items-center justify-center">
            <embed v-if="previewUrl.includes('.pdf')" :src="previewUrl" class="w-full h-full" type="application/pdf">
            <img v-else :src="previewUrl" class="max-w-full max-h-full object-contain">
        </div>
        
        <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
           <UiBaseButton variant="secondary" @click="previewUrl = null">
             Close Viewer
           </UiBaseButton>
        </div>
      </div>
    </UiBaseModal>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTenants } from '@/composables/modules/tenants/useTenants'
import { 
  ArrowLeftIcon,
  CheckBadgeIcon,
  NoSymbolIcon,
  DocumentIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
  EnvelopeIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const activeTab = ref('business')
const tabs = [
  { id: 'business', name: 'Business Profile' },
  { id: 'compliance', name: 'Compliance & KYC' },
  { id: 'finance', name: 'Finance & Payouts' },
  { id: 'settings', name: 'Agency Settings' }
]

const route = useRoute()
const { getTenant, updateTenantStatus, tenant } = useTenants()
const updating = ref(false)

onMounted(async () => {
  await getTenant(route.params.id as string)
})

const statusClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700'
    case 'approved': return 'bg-green-100 text-green-700'
    case 'pending': return 'bg-yellow-100 text-yellow-700'
    case 'under_review': return 'bg-blue-100 text-blue-700'
    case 'rejected': return 'bg-red-100 text-red-700'
    case 'suspended': return 'bg-gray-200 text-gray-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const handleApprove = async () => {
  updating.value = true
  try {
    await updateTenantStatus(tenant.value._id, 'approved')
    await getTenant(tenant.value._id)
  } finally {
    updating.value = false
  }
}

const handleReject = async () => {
    updating.value = true
    try {
        await updateTenantStatus(tenant.value._id, 'rejected')
        await getTenant(tenant.value._id)
    } finally {
        updating.value = false
    }
}

const previewUrl = ref<string | null>(null)

const openDoc = (url: string) => {
    if(!url) return;
    previewUrl.value = url;
}
</script>
