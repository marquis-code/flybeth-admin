<template>
  <div class="container mx-auto space-y-12 pb-24 text-brand-gray">
    <div class="flex justify-between items-end bg-white border border-gray-100 p-8 rounded-[2rem] shadow-none transition-premium">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Platform Settings</h1>
        <p class="text-gray-500 font-medium text-sm">Manage commissions, regional access, and infrastructure connectors.</p>
      </div>
      <div class="flex gap-4">
        <UiBaseButton variant="outline" @click="fetchConfig" :loading="loading">
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          Refresh
        </UiBaseButton>
        <UiBaseButton variant="primary" class="bg-gray-900 text-white min-w-[160px] shadow-none" @click="saveConfig" :loading="saving">
          <SaveIcon class="h-4 w-4 mr-2" />
          Save Changes
        </UiBaseButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div class="lg:col-span-2 space-y-12">
        <!-- Commission & Service Fees -->
        <UiBaseCard padding>
          <div class="flex items-center space-x-3 mb-8">
            <div class="h-10 w-10 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
              <PercentIcon class="h-5 w-5" />
            </div>
            <h3 class="text-xl font-bold text-gray-900">Commission & Service Fees</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="space-y-3">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Agency Fee (B2B)</label>
              <div class="relative group">
                <input 
                  v-model.number="config.b2bCommission"
                  type="number" 
                  class="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-5 px-6 font-bold text-xl text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium shadow-none"
                />
                <div class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</div>
              </div>
              <p class="text-[10px] text-gray-400 leading-relaxed px-1">Applied to bookings made by sub-agents.</p>
            </div>

            <div class="space-y-3">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Platform Fee (B2C)</label>
              <div class="relative group">
                <input 
                  v-model.number="config.b2cCommission"
                  type="number" 
                  class="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-5 px-6 font-bold text-xl text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium shadow-none"
                />
                <div class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</div>
              </div>
              <p class="text-[10px] text-gray-400 leading-relaxed px-1">Applied to direct consumer bookings.</p>
            </div>

            <div class="space-y-3">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">General Extra Margin</label>
              <div class="relative group">
                <input 
                  v-model.number="config.ancillaryMargin"
                  type="number" 
                  class="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-5 px-6 font-bold text-xl text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium shadow-none"
                />
                <div class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</div>
              </div>
              <p class="text-[10px] text-gray-400 leading-relaxed px-1">Service markup on top of provider costs.</p>
            </div>
          </div>
        </UiBaseCard>

        <!-- Geo-Fencing -->
        <UiBaseCard padding>
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green">
                <GlobeIcon class="h-5 w-5" />
              </div>
              <h3 class="text-xl font-bold text-gray-900">Regional Bypassing</h3>
            </div>
            <div @click="config.isWhitelistingEnabled = !config.isWhitelistingEnabled" class="flex items-center space-x-4 cursor-pointer group">
              <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-900 transition-premium">
                {{ config.isWhitelistingEnabled ? 'Restrictive Mode' : 'Global Access' }}
              </span>
              <div class="w-12 h-6 rounded-full border border-gray-100 relative transition-premium p-1" :class="config.isWhitelistingEnabled ? 'bg-brand-green' : 'bg-gray-100'">
                <div class="h-4 w-4 bg-white rounded-full transition-premium shadow-sm" :class="{ 'translate-x-6': config.isWhitelistingEnabled }"></div>
              </div>
            </div>
          </div>

          <div class="space-y-8" :class="{ 'opacity-40 grayscale pointer-events-none': !config.isWhitelistingEnabled }">
            <div class="space-y-5">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Operational Whitelist (States/Regions)</label>
              <div class="flex flex-wrap gap-3">
                <div 
                  v-for="state in config.whitelistedStates" 
                  :key="state"
                  class="flex items-center px-5 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-bold text-gray-900 shadow-none hover:border-brand-blue group transition-premium"
                >
                  <span class="mr-4">{{ state }}</span>
                  <button @click="removeState(state)" class="h-5 w-5 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-500 transition-premium">
                    <XIcon class="h-3 w-3" />
                  </button>
                </div>
                <div class="relative flex-1 min-w-[240px]">
                  <input 
                    v-model="newState"
                    @keyup.enter="addState"
                    type="text" 
                    placeholder="Search or add region..."
                    class="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium"
                  />
                  <PlusIcon @click="addState" class="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 hover:text-brand-blue cursor-pointer transition-premium" />
                </div>
              </div>
            </div>
          </div>
        </UiBaseCard>

        <!-- Infrastructure Connectors -->
        <UiBaseCard padding>
          <div class="flex items-center space-x-3 mb-8">
            <div class="h-10 w-10 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
              <CloudIcon class="h-5 w-5" />
            </div>
            <h3 class="text-xl font-bold text-gray-900">Infrastructure Connectors</h3>
          </div>

          <div class="space-y-6">
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
                    :class="[api.enabled ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border-gray-100 shadow-none']"
                    class="h-11 px-6 flex items-center justify-center rounded-xl border transition-premium text-xs font-bold tracking-widest hover:scale-105 active:scale-95"
                  >
                     {{ api.enabled ? 'Deactivate' : 'Activate' }}
                  </button>
               </div>
            </div>
          </div>
        </UiBaseCard>
      </div>

      <!-- Right Sidebar -->
      <div class="space-y-12">
        <div class="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-8">
           <h4 class="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">System Status</h4>
           <div class="space-y-4">
              <div v-for="env in ['Flight Engine 4.0', 'Booking Gateway', 'Margin Resolver']" :key="env" class="flex items-center justify-between p-5 bg-white border border-gray-50 rounded-2xl shadow-none hover:border-brand-blue/20 transition-premium">
                 <span class="text-xs font-bold text-gray-700 tracking-tight">{{ env }}</span>
                 <div class="flex items-center">
                    <span class="text-[9px] font-bold text-emerald-500 uppercase mr-3 tracking-widest">Active</span>
                    <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                 </div>
              </div>
           </div>
           <p class="text-[10px] text-center text-gray-400 font-medium">Platform version: 2026.04.1</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  RefreshCw as RefreshCwIcon,
  Save as SaveIcon,
  Percent as PercentIcon,
  Globe as GlobeIcon,
  X as XIcon,
  Plus as PlusIcon,
  Cloud as CloudIcon
} from 'lucide-vue-next'
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

definePageMeta({
  layout: 'admin'
})
</script>
