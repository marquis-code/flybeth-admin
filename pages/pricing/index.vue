<template>
  <div class="space-y-8 pb-16">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-100 p-6 rounded-2xl">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Currency & Pricing</h1>
        <p class="text-sm text-gray-500 mt-1">Manage exchange rates and service fees. Changes here reflect on the user app in real time.</p>
      </div>
      <div class="flex gap-3">
        <button @click="loadConfig" :disabled="loading" class="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
          <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': loading }" />
          Refresh
        </button>
        <button @click="handleSave" :disabled="saving" class="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Save class="h-4 w-4" />
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Extra Services Pricing -->
    <div class="bg-white border border-gray-100 rounded-2xl p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="h-9 w-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
          <Briefcase class="h-4 w-4" />
        </div>
        <h2 class="text-base font-bold text-gray-900">Extra Services Pricing (USD)</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="space-y-2">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Extra Baggage</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
            <input v-model.number="ancillaryPrices.bags" type="number" step="1" min="0"
              class="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Seat Selection</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
            <input v-model.number="ancillaryPrices.seats" type="number" step="1" min="0"
              class="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Travel Insurance</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
            <input v-model.number="ancillaryPrices.insurance" type="number" step="1" min="0"
              class="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
          </div>
        </div>
      </div>
    </div>

    <!-- Exchange Rate Table -->
    <div class="bg-white border border-gray-100 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Coins class="h-4 w-4" />
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-900">Exchange Rates</h2>
            <p class="text-xs text-gray-400 mt-0.5">{{ exchangeRates.length }} currencies configured</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input v-model="search" type="text" placeholder="Search currencies..."
              class="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-56 transition-all" />
          </div>
          <button @click="addCurrency" class="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5">
            <Plus class="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-14 bg-gray-50 rounded-xl animate-pulse"></div>
      </div>

      <!-- Table -->
      <div v-else class="border border-gray-100 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 text-left">
              <th class="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Currency</th>
              <th class="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Symbol</th>
              <th class="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Rate (1 USD =)</th>
              <th class="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="(rate, index) in filteredRates" :key="rate._origIndex" class="hover:bg-blue-50/30 transition-colors">
              <td class="px-5 py-3">
                <input v-model="rate.currency" type="text" maxlength="4"
                  class="w-20 bg-transparent text-sm font-bold text-gray-900 uppercase border-none outline-none focus:text-blue-600" />
              </td>
              <td class="px-5 py-3">
                <input v-model="rate.symbol" type="text" maxlength="5"
                  class="w-16 bg-transparent text-sm text-gray-700 border-none outline-none focus:text-blue-600" />
              </td>
              <td class="px-5 py-3">
                <input v-model.number="rate.rate" type="number" step="0.01" min="0"
                  class="w-32 bg-transparent text-sm font-semibold text-emerald-700 border-none outline-none focus:text-blue-600" />
              </td>
              <td class="px-5 py-3 text-right">
                <button @click="removeCurrency(rate._origIndex)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 class="h-4 w-4" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredRates.length === 0">
              <td colspan="4" class="px-5 py-8 text-center text-sm text-gray-400">
                {{ search ? 'No currencies match your search.' : 'No currencies configured. Click "Add" to create one.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { RefreshCw, Save, Briefcase, Coins, Plus, Trash2, Search } from 'lucide-vue-next'
import { GATEWAY_ENDPOINT_WITH_AUTH } from '@/api_factory/axios.config'
import { useCustomToast } from '@/composables/core/useCustomToast'

const { showToast } = useCustomToast()

const loading = ref(false)
const saving = ref(false)
const search = ref('')

const exchangeRates = ref<any[]>([])
const ancillaryPrices = reactive({ bags: 0, seats: 0, insurance: 0 })

const filteredRates = computed(() => {
  const q = search.value.toLowerCase().trim()
  const mapped = exchangeRates.value.map((r: any, i: number) => ({ ...r, _origIndex: i }))
  if (!q) return mapped
  return mapped.filter((r: any) =>
    r.currency?.toLowerCase().includes(q) || r.symbol?.toLowerCase().includes(q)
  )
})

const loadConfig = async () => {
  loading.value = true
  try {
    const res = await GATEWAY_ENDPOINT_WITH_AUTH.get('/system-config', { params: { t: Date.now() } })
    const data = res.data?.data || res.data
    console.log('[Pricing] Raw backend response:', JSON.stringify(data).substring(0, 500))

    if (data?.exchangeRates?.length) {
      exchangeRates.value = data.exchangeRates.map((r: any) => ({
        currency: r.currency || '',
        symbol: r.symbol || '',
        rate: r.rate ?? 0,
        _id: r._id
      }))
    }

    if (data?.ancillaryPrices) {
      ancillaryPrices.bags = data.ancillaryPrices.bags ?? 0
      ancillaryPrices.seats = data.ancillaryPrices.seats ?? 0
      ancillaryPrices.insurance = data.ancillaryPrices.insurance ?? 0
    }

    console.log('[Pricing] Loaded', exchangeRates.value.length, 'currencies')
    console.log('[Pricing] Ancillary:', JSON.stringify(ancillaryPrices))
  } catch (err: any) {
    console.error('[Pricing] Load failed:', err?.response?.data || err.message)
    showToast({ title: 'Load Failed', message: err?.response?.data?.message || 'Could not load configuration.', toastType: 'error' })
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    // Strip _id and _origIndex from rates before saving
    const cleanRates = exchangeRates.value.map(r => ({
      currency: r.currency?.toUpperCase()?.trim(),
      symbol: r.symbol?.trim(),
      rate: Number(r.rate) || 0
    })).filter(r => r.currency && r.symbol)

    const payload = {
      exchangeRates: cleanRates,
      ancillaryPrices: {
        bags: Number(ancillaryPrices.bags) || 0,
        seats: Number(ancillaryPrices.seats) || 0,
        insurance: Number(ancillaryPrices.insurance) || 0
      }
    }

    console.log('[Pricing] Saving payload:', JSON.stringify(payload).substring(0, 500))
    await GATEWAY_ENDPOINT_WITH_AUTH.patch('/system-config', payload)
    showToast({ title: 'Saved', message: 'Exchange rates and pricing updated. Changes are live on the user app.', toastType: 'success' })
    
    // Reload to confirm
    await loadConfig()
  } catch (err: any) {
    console.error('[Pricing] Save failed:', err?.response?.data || err.message)
    showToast({ title: 'Save Failed', message: err?.response?.data?.message || 'Could not save.', toastType: 'error' })
  } finally {
    saving.value = false
  }
}

const addCurrency = () => {
  exchangeRates.value.push({ currency: '', symbol: '', rate: 0 })
}

const removeCurrency = (index: number) => {
  exchangeRates.value.splice(index, 1)
}

onMounted(() => {
  loadConfig()
})

definePageMeta({
  layout: 'admin'
})
</script>
