<template>
  <div class="space-y-10 pb-12">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex items-center space-x-6">
        <button @click="navigateTo('/tenants')" class="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-brand-gray/40 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
          <ArrowLeftIcon class="h-5 w-5" />
        </button>
        <div>
           <div class="flex items-center space-x-3 mb-1">
             <h1 class="text-3xl  text-brand-blue tracking-tight">{{ tenant?.name }}</h1>
             <span class="px-4 py-1 rounded-full text-[9px]  uppercase tracking-widest" :class="statusClass(tenant?.status)">
               {{ tenant?.status }}
             </span>
           </div>
           <p class="text-brand-gray/40 text-xs font-bold uppercase tracking-widest">Partner ID: {{ tenant?._id }}</p>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <UiBaseButton v-if="tenant?.status !== 'approved' && tenant?.status !== 'active'" variant="primary" size="lg" @click="handleApprove" :loading="updating">
          <CheckBadgeIcon class="h-5 w-5 mr-3" />
          Approve Agency
        </UiBaseButton>
        <UiBaseButton v-if="tenant?.status !== 'rejected'" variant="ghost" size="lg" class="text-red-500 hover:bg-red-50 border-red-100" @click="handleReject" :loading="updating">
          <NoSymbolIcon class="h-5 w-5 mr-3" />
          Reject Application
        </UiBaseButton>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid lg:grid-cols-3 gap-10">
      
      <!-- Left: Vetting Details -->
      <div class="lg:col-span-2 space-y-10">
        
        <!-- Business Info -->
        <UiBaseCard padding title="Business Foundation">
          <div class="grid md:grid-cols-2 gap-10 pt-4">
            <div class="space-y-6">
               <div class="space-y-1">
                  <p class="text-[9px]  text-brand-gray/30 uppercase tracking-[0.2em]">Registration No.</p>
                  <p class="text-sm  text-brand-blue">{{ tenant?.businessRegistrationNumber || 'N/A' }}</p>
               </div>
               <div class="space-y-1">
                  <p class="text-[9px]  text-brand-gray/30 uppercase tracking-[0.2em]">Country of Operation</p>
                  <p class="text-sm  text-brand-blue">{{ tenant?.country || 'N/A' }}</p>
               </div>
            </div>
            <div class="space-y-6">
               <div class="space-y-1">
                  <p class="text-[9px]  text-brand-gray/30 uppercase tracking-[0.2em]">Billing / Physical Address</p>
                  <p class="text-sm  text-brand-blue leading-relaxed">{{ tenant?.billingAddress || 'N/A' }}</p>
               </div>
               <div class="space-y-1">
                  <p class="text-[9px]  text-brand-gray/30 uppercase tracking-[0.2em]">Website</p>
                  <a :href="tenant?.website" target="_blank" class="text-sm  text-brand-blue hover:text-brand-blue/70 flex items-center">
                    {{ tenant?.website || 'No website provided' }}
                    <ArrowTopRightOnSquareIcon v-if="tenant?.website" class="h-3 w-3 ml-2" />
                  </a>
               </div>
            </div>
          </div>
        </UiBaseCard>

        <!-- KYC & Identity -->
        <UiBaseCard padding title="Agent Verification (KYC)">
          <div class="grid md:grid-cols-2 gap-10 pt-4">
             <div class="space-y-4">
                <p class="text-[9px]  text-brand-gray/30 uppercase tracking-[0.2em]">ID Document</p>
                <div v-if="tenant?.kycDocuments?.idCard" class="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                   <img :src="tenant?.kycDocuments?.idCard" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   <div class="absolute inset-0 bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <UiBaseButton variant="primary" size="sm" @click="openImg(tenant?.kycDocuments?.idCard)">View Document</UiBaseButton>
                   </div>
                </div>
                <div v-else class="aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-brand-gray/20">
                   <p class="text-[10px] uppercase  tracking-widest">Not uploaded</p>
                </div>
             </div>
             
             <div class="space-y-4">
                <p class="text-[9px]  text-brand-gray/30 uppercase tracking-[0.2em]">Live Selfie</p>
                <div v-if="tenant?.kycDocuments?.selfie" class="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                   <img :src="tenant?.kycDocuments?.selfie" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   <div class="absolute inset-0 bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <UiBaseButton variant="primary" size="sm" @click="openImg(tenant?.kycDocuments?.selfie)">View Photo</UiBaseButton>
                   </div>
                </div>
                <div v-else class="aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-brand-gray/20">
                   <p class="text-[10px] uppercase  tracking-widest">Not uploaded</p>
                </div>
             </div>
          </div>
        </UiBaseCard>

        <!-- Business Documents -->
        <UiBaseCard padding title="Legal Documentation">
           <div class="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-between">
              <div class="flex items-center space-x-6">
                 <div class="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-blue">
                    <DocumentIcon class="h-8 w-8" />
                 </div>
                 <div>
                    <h5 class="text-sm  text-brand-blue uppercase tracking-widest">{{ tenant?.country === 'Nigeria' ? 'CAC Certificate' : 'Registration Doc' }}</h5>
                    <p class="text-[10px] text-brand-gray/40 font-bold uppercase tracking-widest mt-1">Tax ID: {{ tenant?.businessDocuments?.ein || 'Not provided' }}</p>
                 </div>
              </div>
              
              <UiBaseButton v-if="tenant?.businessDocuments?.documentUrl" variant="ghost" size="sm" class="bg-white border-gray-200" @click="openDoc(tenant?.businessDocuments?.documentUrl)">
                 Download PDF
              </UiBaseButton>
              <p v-else class="text-[10px] uppercase  text-brand-gray/20 tracking-widest">Pending Upload</p>
           </div>
        </UiBaseCard>
      </div>

      <!-- Right: Contact & Finance -->
      <div class="space-y-10">
        
        <!-- Profile & Contact -->
        <UiBaseCard padding>
          <div class="text-center pb-8 border-b border-gray-50">
             <div class="h-20 w-20 bg-brand-blue/5 rounded-[2rem] border-2 border-white shadow-sm flex items-center justify-center text-2xl  text-brand-blue mx-auto mb-6">
                {{ tenant?.name?.[0] }}
             </div>
             <h4 class="text-xl  text-brand-blue mb-1">Owner Profile</h4>
             <p class="text-xs font-bold text-brand-gray/40 uppercase tracking-widest">{{ tenant?.contactEmail }}</p>
          </div>
          
          <div class="py-10 space-y-8">
             <div class="flex items-center space-x-4">
                <div class="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-brand-gray/40">
                   <PhoneIcon class="h-5 w-5" />
                </div>
                <div>
                   <p class="text-[9px]  text-brand-gray/30 uppercase tracking-widest">Phone</p>
                   <p class="text-[13px]  text-brand-blue">{{ tenant?.contactPhone || 'N/A' }}</p>
                </div>
             </div>
             <div class="flex items-center space-x-4">
                <div class="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-green-500">
                   <ChatBubbleLeftRightIcon class="h-5 w-5" />
                </div>
                <div>
                   <p class="text-[9px]  text-brand-gray/30 uppercase tracking-widest">WhatsApp</p>
                   <p class="text-[13px]  text-brand-blue">{{ tenant?.whatsappNumber || 'N/A' }}</p>
                </div>
             </div>
          </div>
        </UiBaseCard>

        <!-- Bank Details -->
        <UiBaseCard padding class="bg-brand-blue text-white overflow-hidden relative">
           <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
           <p class="text-[10px]  text-white/30 tracking-[0.3em] uppercase mb-10">Payout Settlement</p>
           
           <div class="space-y-8 relative z-10">
              <div class="space-y-2">
                 <p class="text-[9px] font-bold text-white/40 uppercase tracking-widest">Bank Name</p>
                 <p class="text-base  tracking-tight">{{ tenant?.bankDetails?.bankName || 'NOT SET' }}</p>
              </div>
              <div class="space-y-2">
                 <p class="text-[9px] font-bold text-white/40 uppercase tracking-widest">Account Holder</p>
                 <p class="text-base  tracking-tight">{{ tenant?.bankDetails?.accountName || 'NOT SET' }}</p>
              </div>
              <div class="pt-6 border-t border-white/10">
                 <p class="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-2">Account Number</p>
                 <div class="flex items-center justify-between">
                    <p class="text-2xl  tracking-[0.1em]">{{ tenant?.bankDetails?.accountNumber || '**** ****' }}</p>
                    <BanknotesIcon class="h-6 w-6 text-white/20" />
                 </div>
              </div>
           </div>
        </UiBaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTenants } from '@/composables/modules/tenants/useTenants'
import { 
  ArrowLeftIcon,
  CheckBadgeIcon,
  NoSymbolIcon,
  DocumentIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const { getTenant, updateTenantStatus, tenant } = useTenants()
const updating = ref(false)

onMounted(async () => {
  await getTenant(route.params.id as string)
})

const statusClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-brand-green/10 text-brand-green'
    case 'approved': return 'bg-green-100 text-green-700'
    case 'pending': return 'bg-yellow-50 text-yellow-600'
    case 'under_review': return 'bg-blue-50 text-blue-600'
    case 'rejected': return 'bg-red-50 text-red-500'
    case 'suspended': return 'bg-gray-100 text-gray-400'
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

const openDoc = (url: string) => {
    window.open(url, '_blank')
}

const openImg = (url: string) => {
    window.open(url, '_blank')
}
</script>

<style scoped>
. { font-weight: 900; }
</style>
