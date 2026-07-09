<template>
  <div class="space-y-10 pb-12 text-brand-gray">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
       <div class="space-y-1">
         <h1 class="text-3xl font-bold text-gray-900 ">Financial performance</h1>
         <p class="text-gray-600 font-medium text-sm">Settle transactions and monitor global revenue streams</p>
       </div>
        <div class="flex gap-3">
          <UiBaseButton variant="outline" size="md" @click="handleDownloadLedger" :loading="downloading">
            <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
            Download ledger
          </UiBaseButton>
          <UiBaseButton variant="primary" size="lg" @click="handleInitiateSettlement" :loading="settling">
            <CheckBadgeIcon class="h-4 w-4 mr-2" />
            Initiate global settlement
          </UiBaseButton>
        </div>
    </div>

    <!-- Revenue Highlights -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <UiBaseCard padding class="!bg-brand-blue text-white overflow-hidden relative group">
        <div class="absolute -right-12 -bottom-12 h-40 w-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-premium" />
        <p class="text-sm font-bold text-white/40   mb-2 leading-none">Gross settled revenue</p>
        <div v-if="loading" class="h-10 bg-white/20 animate-pulse rounded w-1/2 mb-2"></div>
        <h4 v-else class="text-4xl font-bold leading-none">${{ metrics.grossRevenue?.toLocaleString() || '0' }}</h4>
        <div class="mt-8 flex items-center justify-between">
           <div class="flex flex-col w-full">
              <span class="text-sm font-bold text-white/30  ">Commission earned</span>
              <div v-if="loading" class="h-6 bg-white/20 animate-pulse rounded w-1/3 mt-1"></div>
              <span v-else class="text-lg font-bold text-brand-green ">${{ metrics.commissionEarned?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00' }}</span>
           </div>
           <div class="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center font-bold text-brand-green border border-white/5 shrink-0">+15%</div>
        </div>
      </UiBaseCard>

      <UiBaseCard padding class="flex flex-col justify-between">
        <div>
          <p class="text-sm font-bold text-gray-500   mb-2 leading-none">Pending disbursements</p>
          <div v-if="loading" class="h-10 bg-gray-200 animate-pulse rounded w-1/2"></div>
          <h4 v-else class="text-4xl font-bold text-gray-900 leading-none">${{ metrics.pendingDisbursements?.toLocaleString() || '0' }}</h4>
        </div>
        <div class="mt-8">
           <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div class="bg-brand-blue h-full" style="width: 65%"></div>
           </div>
           <p class="text-sm font-bold text-gray-500   mt-2">65% of monthly cycle completed</p>
        </div>
      </UiBaseCard>

      <UiBaseCard padding class="flex flex-col justify-between">
        <div>
          <p class="text-sm font-bold text-gray-500   mb-2 leading-none">Average take-rate</p>
          <div v-if="loading" class="h-10 bg-gray-200 animate-pulse rounded w-1/3"></div>
          <h4 v-else class="text-4xl font-bold text-gray-900 leading-none">{{ metrics.takeRate || '0' }}%</h4>
        </div>
        <div class="mt-8 flex items-center space-x-2">
           <div v-for="i in 5" :key="i" class="flex-1 h-1 rounded-full" :class="i < 4 ? 'bg-brand-green' : 'bg-gray-100'"></div>
           <span class="text-sm font-bold text-brand-green   ml-2">Above target</span>
        </div>
      </UiBaseCard>

      <!-- VIP Upsell Tracking -->
      <UiBaseCard padding class="flex flex-col justify-between">
        <div>
          <p class="text-sm font-bold text-gray-500 mb-2 leading-none">VIP Support Revenue</p>
          <div v-if="loading" class="h-10 bg-gray-200 animate-pulse rounded w-1/2"></div>
          <h4 v-else class="text-4xl font-bold text-gray-900 leading-none">${{ metrics.vipRevenue?.toLocaleString() || '0' }}</h4>
        </div>
        <div class="mt-8 flex items-center justify-between">
           <div class="flex flex-col w-full">
              <span class="text-sm font-bold text-gray-500">Upsell Conversion</span>
              <div v-if="loading" class="h-6 bg-gray-200 animate-pulse rounded w-1/3 mt-1"></div>
              <span v-else class="text-lg font-bold text-amber-600">{{ metrics.vipConversionRate || '0' }}%</span>
           </div>
           <div class="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center font-bold text-amber-600 border border-amber-100 shrink-0">VIP</div>
        </div>
      </UiBaseCard>
    </div>

    <!-- Settlements Table -->
    <UiBaseCard>
      <div class="px-8 py-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 class="text-xl font-bold text-gray-900">Global settlement ledger</h3>
        <div class="flex items-center space-x-4">
           <UiDatePicker v-model="filterDate" />
           <UiBaseButton variant="ghost" size="sm" class="!px-4 !py-2 border border-gray-200 font-bold text-sm   hover:bg-gray-50">Filter</UiBaseButton>
        </div>
      </div>
      <div class="overflow-x-auto min-h-[300px]">
        <table v-if="!loading && transactions.length > 0" class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50">
              <th class="px-8 py-5 text-sm font-bold text-brand-gray/50  ">Transaction ID</th>
              <th class="px-8 py-5 text-sm font-bold text-brand-gray/50  ">Agency source</th>
              <th class="px-8 py-5 text-sm font-bold text-brand-gray/50  ">Total amount</th>
              <th class="px-8 py-5 text-sm font-bold text-brand-gray/50  ">Comm. rate</th>
              <th class="px-8 py-5 text-sm font-bold text-brand-gray/50  ">Net payout</th>
              <th class="px-8 py-5 text-sm font-bold text-brand-gray/50  ">Settlement</th>
              <th class="px-8 py-5 text-right text-sm font-bold text-brand-gray/50  ">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-brand-blue/[0.01] transition-all duration-300 group">
              <td class="px-8 py-6 font-bold text-gray-900/50 text-[11px]">{{ tx.id }}</td>
              <td class="px-8 py-6">
                <div class="text-sm font-bold text-gray-900 ">{{ tx.agency }}</div>
                <div class="text-sm font-bold text-brand-gray/30   mt-0.5">{{ tx.date }}</div>
              </td>
              <td class="px-8 py-6 font-bold text-gray-900 text-sm ">${{ tx.amount?.toLocaleString() }}</td>
              <td class="px-8 py-6 text-sm font-bold text-gray-600">{{ tx.rate }}%</td>
              <td class="px-8 py-6 font-bold text-brand-green text-sm ">${{ tx.payout?.toLocaleString() }}</td>
              <td class="px-8 py-6">
                <span class="px-4 py-1.5 rounded-xl text-sm font-bold   inline-block border bg-white" :class="tx.settled ? 'border-brand-green/20 text-brand-green bg-brand-green/5' : 'border-yellow-200 text-yellow-600 bg-yellow-50/50'">
                  {{ tx.settled ? 'Settled' : 'In transit' }}
                </span>
              </td>
              <td class="px-8 py-6 text-right">
                 <button class="bg-gray-50 text-gray-500 hover:bg-brand-blue/5 hover:text-gray-900 h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-300 ml-auto">
                   <ArrowTopRightOnSquareIcon class="h-4 w-4" />
                 </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Loading State -->
        <div v-else-if="loading" class="flex flex-col p-8 space-y-4">
           <div v-for="i in 5" :key="i" class="h-16 w-full bg-gray-50 animate-pulse rounded-xl"></div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
           <div class="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <CheckBadgeIcon class="h-10 w-10 text-gray-300" />
           </div>
           <h3 class="text-lg font-bold text-gray-900 mb-1">No transactions found</h3>
           <p class="text-gray-500 text-sm max-w-sm">There is no settlement data available for this period. Try adjusting your filters.</p>
        </div>
      </div>
    </UiBaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowTopRightOnSquareIcon, ArrowDownTrayIcon, CheckBadgeIcon } from '@heroicons/vue/24/outline'
import { adminApiFactory } from '@/api_factory/modules/admin'
import { useCustomToast } from '@/composables/core/useCustomToast'

definePageMeta({
  layout: 'admin'
})

const { showToast } = useCustomToast()
const filterDate = ref('')
const downloading = ref(false)
const settling = ref(false)
const loading = ref(false)

const metrics = ref({
  grossRevenue: 0,
  commissionEarned: 0,
  pendingDisbursements: 0,
  takeRate: 0,
  vipRevenue: 0,
  vipConversionRate: 0
})

const transactions = ref<any[]>([])

const handleDownloadLedger = async () => {
  downloading.value = true
  try {
    const res = await adminApiFactory.downloadLedger()
    const blob = new Blob([res.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `ledger_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast({ title: 'Success', message: 'Ledger download initiated.', toastType: 'success' })
  } catch (e) {
    showToast({ title: 'Error', message: 'Failed to download ledger.', toastType: 'error' })
  } finally {
    downloading.value = false
  }
}

const handleInitiateSettlement = async () => {
  settling.value = true
  try {
    await adminApiFactory.initiateSettlement()
    showToast({ title: 'Settlement Started', message: 'The global settlement process has been triggered.', toastType: 'success' })
  } catch (e) {
    showToast({ title: 'Error', message: 'Failed to initiate settlement.', toastType: 'error' })
  } finally {
    settling.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await adminApiFactory.getRevenue()
    if (res?.data?.success) {
      metrics.value = res.data.data.metrics || metrics.value
      transactions.value = res.data.data.ledger || []
    }
  } catch (e) {
    showToast({ title: 'Error', message: 'Failed to fetch revenue data.', toastType: 'error' })
  } finally {
    loading.value = false
  }
})
</script>
