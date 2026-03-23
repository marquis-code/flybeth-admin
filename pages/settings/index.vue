<template>
  <div class="max-w-6xl space-y-10 pb-12 text-brand-gray">
     <div class="space-y-1">
       <h1 class="text-4xl  font-black text-brand-blue tracking-tight">Global Parameters</h1>
       <p class="text-brand-gray/60 font-medium">Fine-tune the platform core settings and secure API integrations</p>
     </div>

     <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
       <div class="lg:col-span-2 space-y-10">
          <UiBaseCard padding title="Core Application Identity">
            <div class="space-y-8 mt-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <UiBaseInput label="Platform Branding Name" model-value="Flybeth Travel Global" :icon="GlobeAltIcon" />
                <UiBaseInput label="Primary Support Gateway" model-value="hq-ops@flybeth.com" :icon="EnvelopeIcon" />
              </div>
              <div class="space-y-2">
                 <label class="block text-[11px] font-black text-brand-gray uppercase tracking-widest opacity-60 ml-1">Universal Settlement Currency</label>
                 <select class="w-full bg-white border border-gray-100 rounded-[1.5rem] py-4 px-6 text-sm font-bold text-brand-blue outline-none transition-premium focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] appearance-none cursor-pointer">
                   <option>USD - US Dollar ($)</option>
                   <option>EUR - Euro (€)</option>
                   <option>GBP - British Pound (£)</option>
                   <option>NGN - Nigerian Naira (₦)</option>
                 </select>
              </div>
            </div>
            <template #footer>
               <div class="flex justify-end">
                 <UiBaseButton variant="primary" size="md">Commit Identity Changes</UiBaseButton>
               </div>
            </template>
          </UiBaseCard>

          <UiBaseCard padding title="Infrastructure Connectors">
            <div class="space-y-6 mt-6">
              <div v-if="loading" class="space-y-4">
                <div v-for="i in 3" :key="i" class="h-20 bg-gray-50 animate-pulse rounded-3xl"></div>
              </div>
              <div v-else v-for="api in integrationsList" :key="api.name" class="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-brand-blue/20 transition-premium group">
                 <div class="flex items-center space-x-6">
                   <div class="h-14 w-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center font-black transition-premium" :class="api.enabled ? 'text-brand-blue' : 'text-gray-300'">
                     {{ api.displayName ? api.displayName[0] : api.name[0] }}
                   </div>
                   <div>
                      <p class="text-sm font-black text-brand-blue">{{ api.displayName || api.name }}</p>
                      <p class="text-sm font-black text-brand-gray/30 uppercase tracking-widest mt-1">{{ api.name }}</p>
                   </div>
                 </div>
                 <div class="flex items-center space-x-6">
                    <span :class="[api.enabled ? 'text-brand-green bg-brand-green/5 border-brand-green/10' : 'text-gray-400 bg-gray-100 border-gray-200']" class="text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm flex items-center">
                      <div :class="[api.enabled ? 'bg-brand-green animate-pulse' : 'bg-gray-300']" class="h-1.5 w-1.5 rounded-full mr-2"></div>
                      {{ api.enabled ? 'Operational' : 'Disabled' }}
                    </span>
                    <button 
                      @click="toggleProvider(api.name, !api.enabled)"
                      :class="[api.enabled ? 'bg-brand-blue text-white' : 'bg-white text-brand-gray/40 border-gray-100']"
                      class="h-10 px-4 flex items-center justify-center rounded-xl border transition-premium text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95"
                    >
                       {{ api.enabled ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button class="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-brand-gray/40 hover:text-brand-blue hover:border-brand-blue transition-premium">
                       <Cog6ToothIcon class="h-5 w-5" />
                    </button>
                 </div>
              </div>
            </div>
          </UiBaseCard>
       </div>

       <!-- Right Sidebar Context -->
       <div class="space-y-8">
          <UiBaseCard padding class="!bg-brand-blue text-white">
             <ShieldCheckIcon class="h-12 w-12 mb-6 text-brand-green" />
             <h4 class="text-xl  font-black mb-3">Governance Guard</h4>
             <p class="text-xs text-white/60 leading-relaxed mb-8">Changes to core parameters are logged and may require multi-party authorized signatures depending on your security policy.</p>
             <UiBaseButton variant="ghost" class="!bg-white/10 !text-white !w-full !rounded-2xl border-none">View Audit Logs</UiBaseButton>
          </UiBaseCard>

          <UiBaseCard padding>
             <h4 class="text-sm font-black text-brand-blue uppercase tracking-widest mb-6">Regional Compliance</h4>
             <div class="space-y-4">
                <div v-for="i in 3" :key="i" class="flex items-center justify-between">
                   <span class="text-xs font-bold text-brand-gray/60">Tier {{ i }} KYC Verification</span>
                   <div class="h-5 w-10 bg-brand-green/20 rounded-full relative cursor-pointer">
                      <div class="h-3 w-3 bg-brand-green rounded-full absolute top-1 right-1" />
                   </div>
                </div>
             </div>
          </UiBaseCard>
       </div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { 
  GlobeAltIcon, 
  EnvelopeIcon, 
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const config = useRuntimeConfig()
const API_BASE = "http://localhost:3000/api/v1"

const integrationsList = ref<any[]>([])
const loading = ref(true)

const fetchIntegrations = async () => {
  loading.value = true
  try {
    const data = await $fetch<any>(`${API_BASE}/integrations/providers`)
    integrationsList.value = data.providers
  } catch (e) {
    console.error('Failed to fetch integrations', e)
  } finally {
    loading.value = false
  }
}

const toggleProvider = async (providerName: string, enabled: boolean) => {
  try {
    await $fetch(`${API_BASE}/integrations/providers/toggle`, {
      method: 'PATCH',
      body: { providerName, enabled }
    })
    await fetchIntegrations()
  } catch (e) {
    console.error('Failed to toggle provider', e)
  }
}

onMounted(() => {
  fetchIntegrations()
})
</script>
