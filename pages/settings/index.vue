<template>
  <div class="container mx-auto space-y-12 pb-24 text-brand-gray">
    <div class="flex justify-between items-end">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Platform Governance</h1>
        <p class="text-gray-500 font-medium">Global orchestration of financial models and regional operational guardrails</p>
      </div>
      <div class="flex gap-4">
        <UiBaseButton variant="outline" @click="fetchConfig" :loading="loading">
          <ArrowPathIcon class="h-4 w-4 mr-2" />
          Refresh
        </UiBaseButton>
        <UiBaseButton variant="primary" class="bg-gray-900 text-white min-w-[160px]" @click="saveConfig" :loading="saving">
          <CloudArrowUpIcon class="h-4 w-4 mr-2" />
          Commit changes
        </UiBaseButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div class="lg:col-span-2 space-y-12">
        <!-- Section 1: Financial Architecture (Commissions) -->
        <UiBaseCard padding>
          <div class="flex items-center space-x-3 mb-8">
            <div class="h-8 w-8 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
              <CurrencyDollarIcon class="h-5 w-5" />
            </div>
            <h3 class="text-xl font-bold text-gray-900">Financial architecture</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">B2B Commission (Agents)</label>
                <span class="text-xs font-bold text-brand-blue">{{ config.b2bCommission }}%</span>
              </div>
              <div class="relative group">
                <input 
                  v-model.number="config.b2bCommission"
                  type="number" 
                  class="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 px-6 font-bold text-lg text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium shadow-none"
                />
                <div class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-bold">%</div>
              </div>
              <p class="text-[11px] text-gray-400 leading-relaxed italic">Applied to all bookings made via agency subaccounts and tenant portals.</p>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">B2C Commission (Direct)</label>
                <span class="text-xs font-bold text-brand-green">{{ config.b2cCommission }}%</span>
              </div>
              <div class="relative group">
                <input 
                  v-model.number="config.b2cCommission"
                  type="number" 
                  class="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 px-6 font-bold text-lg text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium shadow-none"
                />
                <div class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-bold">%</div>
              </div>
              <p class="text-[11px] text-gray-400 leading-relaxed italic">Applied to direct bookings made by customers on the main platform.</p>
            </div>
          </div>
        </UiBaseCard>

        <!-- Section 2: Regional Guardrails (Whitelisting) -->
        <UiBaseCard padding>
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center space-x-3">
              <div class="h-8 w-8 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
                <GlobeAmericasIcon class="h-5 w-5" />
              </div>
              <h3 class="text-xl font-bold text-gray-900">Regional guardrails</h3>
            </div>
            <div @click="config.isWhitelistingEnabled = !config.isWhitelistingEnabled" class="flex items-center space-x-3 cursor-pointer group">
              <span class="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-premium">
                {{ config.isWhitelistingEnabled ? 'Active' : 'Bypassed' }}
              </span>
              <div class="w-12 h-6 rounded-full relative transition-premium p-1" :class="config.isWhitelistingEnabled ? 'bg-brand-green' : 'bg-gray-200'">
                <div class="h-4 w-4 bg-white rounded-full transition-premium shadow-sm" :class="{ 'translate-x-6': config.isWhitelistingEnabled }"></div>
              </div>
            </div>
          </div>

          <div class="space-y-8" :class="{ 'opacity-50 pointer-events-none grayscale': !config.isWhitelistingEnabled }">
            <div class="space-y-4">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1">Whitelisted States (Geo-Fencing)</label>
              <div class="flex flex-wrap gap-3">
                <div 
                  v-for="state in config.whitelistedStates" 
                  :key="state"
                  class="flex items-center px-5 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 shadow-none hover:border-brand-blue transition-premium group"
                >
                  <span class="mr-3">{{ state }}</span>
                  <XMarkIcon @click="removeState(state)" class="h-4 w-4 text-gray-300 hover:text-red-500 cursor-pointer transition-premium" />
                </div>
                <div class="relative flex-1 min-w-[200px]">
                  <input 
                    v-model="newState"
                    @keyup.enter="addState"
                    type="text" 
                    placeholder="Type state and press enter..."
                    class="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-6 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium"
                  />
                  <PlusIcon @click="addState" class="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 hover:text-brand-blue cursor-pointer" />
                </div>
              </div>
              <p class="text-[11px] text-gray-400 mt-4 leading-relaxed italic">Only bookings originating from these states will be accepted. Current whitelist: <span class="text-gray-900 font-bold">{{ config.whitelistedStates.join(', ') }}</span>.</p>
            </div>
          </div>
        </UiBaseCard>

        <!-- Section 3: Identity & Integrations (Existing) -->
         <UiBaseCard padding title="Infrastructure Connectors">
            <div class="space-y-6 mt-8">
              <div v-if="loading" class="space-y-4">
                <div v-for="i in 3" :key="i" class="h-20 bg-gray-50 animate-pulse rounded-[2rem]"></div>
              </div>
              <div v-else v-for="api in integrationsList" :key="api.name" class="flex items-center justify-between p-7 bg-gray-50/50 rounded-[2rem] border border-gray-100 hover:border-brand-blue/20 transition-premium group">
                 <div class="flex items-center space-x-6">
                    <div class="h-14 w-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-brand-blue shadow-none group-hover:scale-110 transition-premium">
                       <CloudIcon class="h-6 w-6" />
                    </div>
                    <div>
                       <p class="text-base font-bold text-gray-900 tracking-tight">{{ api.displayName || api.name }}</p>
                       <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">{{ api.name }} gateway</p>
                    </div>
                 </div>
                 <div class="flex items-center space-x-6">
                    <span :class="[api.enabled ? 'text-brand-green bg-brand-green/5 border-brand-green/10' : 'text-gray-400 bg-gray-100 border-gray-200']" class="text-xs font-bold px-4 py-2 rounded-xl tracking-widest flex items-center border">
                       <div :class="[api.enabled ? 'bg-brand-green animate-pulse' : 'bg-gray-300']" class="h-1.5 w-1.5 rounded-full mr-2"></div>
                       {{ api.enabled ? 'Operational' : 'Secured' }}
                    </span>
                    <button 
                      @click="toggleProvider(api.name, !api.enabled)"
                      :class="[api.enabled ? 'bg-brand-blue text-white' : 'bg-white text-gray-500 border-gray-100 shadow-none']"
                      class="h-11 px-6 flex items-center justify-center rounded-xl border transition-premium text-xs font-bold tracking-widest hover:scale-105 active:scale-95"
                    >
                       {{ api.enabled ? 'Deactivate' : 'Activate' }}
                    </button>
                 </div>
              </div>
            </div>
          </UiBaseCard>
      </div>

      <!-- Right Sidebar Context (Audit & Logs) -->
      <div class="space-y-10">
        <UiBaseCard padding class="!bg-brand-blue text-white overflow-hidden relative group">
           <div class="absolute -right-16 -top-16 h-48 w-48 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-premium duration-1000"></div>
           <ShieldCheckIcon class="h-12 w-12 mb-6 text-brand-green" />
           <h4 class="text-2xl font-bold mb-3 tracking-tight">Security engine</h4>
           <p class="text-sm text-white/60 leading-relaxed mb-8">All changes to global financial architectures are signed and audited for regulatory compliance.</p>
           <UiBaseButton variant="ghost" class="!bg-white/10 !text-white !w-full !rounded-2xl border-none font-bold shadow-none hover:!bg-white/20">View configuration log</UiBaseButton>
        </UiBaseCard>

        <div class="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-none space-y-6">
           <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Compliance health</h4>
           <div class="space-y-4">
              <div v-for="tier in ['Financial audit', 'PCI-DSS Sync', 'GDPR Node']" :key="tier" class="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50 shadow-none hover:border-brand-blue transition-premium">
                 <span class="text-sm font-bold text-gray-700">{{ tier }}</span>
                 <div class="h-2 w-2 rounded-full bg-brand-green shadow-[0_0_10px_rgba(20,184,166,0.4)]"></div>
              </div>
           </div>
           <p class="text-[10px] text-center text-gray-400 leading-relaxed">System metrics are updated in real-time. Contact global-ops@flybeth.com for support.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  ArrowPathIcon,
  CloudArrowUpIcon,
  CurrencyDollarIcon,
  GlobeAmericasIcon,
  ShieldCheckIcon,
  CloudIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import { useAdminSettings } from '@/composables/modules/admin/useAdminSettings'

const { 
  loading, 
  saving, 
  config, 
  integrationsList, 
  fetchConfig, 
  saveConfig: apiSaveConfig, 
  fetchIntegrations, 
  toggleProvider 
} = useAdminSettings()

const newState = ref('')

const saveConfig = async () => {
  await apiSaveConfig(config.value)
}

const addState = () => {
  if (newState.value && !config.value.whitelistedStates.includes(newState.value)) {
    config.value.whitelistedStates.push(newState.value)
    newState.value = ''
  }
}

const removeState = (state: string) => {
  config.value.whitelistedStates = config.value.whitelistedStates.filter((s: any) => s !== state)
}

onMounted(() => {
  fetchConfig()
  fetchIntegrations()
})
</script>
