<template>
  <div class="space-y-8 pb-12">
    <!-- Loading State -->
    <div v-if="loading && !dashboardData" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center space-y-4">
        <div class="h-10 w-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="text-base font-medium text-gray-400">Loading dashboard...</p>
      </div>
    </div>

    <template v-else>
      <!-- Dashboard Header & Actions -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 ">Dashboard Overview</h1>
          <p class="text-gray-500 font-medium">A quick glance at your business performance</p>
        </div>
        <div class="flex items-center gap-3">
          <UiBaseButton variant="outline" @click="showDownloadModal = true" class="shadow-none">
            <CloudArrowDownIcon class="h-4 w-4 mr-2" />
            Download
          </UiBaseButton>
          <UiBaseButton variant="primary" @click="handleSettlement" :loading="settling" class="bg-gray-900 text-white shadow-none min-w-[180px]">
            <SparklesIcon class="h-4 w-4 mr-2" />
            Withdraw Funds
          </UiBaseButton>
        </div>
      </div>
      <!-- Main Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <UiBaseCard 
          v-for="stat in computedStats" 
          :key="stat.name" 
          padding 
          class="group transition-all duration-300 hover:shadow-none"
        >
          <div class="flex items-center space-x-4">
            <div class="p-3 rounded-xl" :class="stat.bgClass">
              <component :is="stat.icon" class="h-5 w-5" :class="stat.iconClass" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm md:text-base font-medium text-gray-400 mb-1 truncate">{{ stat.name }}</p>
              <div class="flex flex-col gap-1.5">
                <template v-if="Array.isArray(stat.value)">
                  <div v-for="(val, idx) in stat.value" :key="idx" class="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                    <h3 class="text-xl font-bold text-gray-900 leading-none">{{ val }}</h3>
                    <span v-if="idx === 0 && stat.trend" class="text-sm font-semibold whitespace-nowrap" :class="stat.trendClass">{{ stat.trend }}</span>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                    <h3 class="text-xl font-bold text-gray-900 leading-none">{{ stat.value }}</h3>
                    <span v-if="stat.trend" class="text-sm font-semibold whitespace-nowrap" :class="stat.trendClass">{{ stat.trend }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </UiBaseCard>
      </div>

      <!-- Tables Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <!-- Top performing partners -->
        <div class="space-y-5">
          <div class="flex items-end justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Top Agencies</h3>
              <p class="text-sm text-gray-400 mt-0.5">Agencies generating the most revenue</p>
            </div>
            <UiBaseButton variant="secondary" size="md" @click="navigateTo('/dashboard/tenants')">
              View all
              <ArrowRightIcon class="h-4 w-4 ml-2" />
            </UiBaseButton>
          </div>

          <UiBaseTable 
            :columns="agentColumns" 
            :items="topAgents"
            empty-title="No agencies found"
            empty-description="Your network activity will appear here."
          >
            <template #cell(name)="{ item }">
              <div class="flex items-center space-x-3">
                <div class="h-8 w-8 rounded bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-gray-400 text-sm">
                  {{ item.name?.[0] || 'A' }}
                </div>
                <div class="text-base font-medium text-gray-900">{{ item.name }}</div>
              </div>
            </template>
            <template #cell(revenue)="{ item }">
              <span class="text-sm font-bold text-gray-900">${{ item.revenue?.toLocaleString() || '0' }}</span>
            </template>
            <template #cell(bookings)="{ item }">
              <span class="text-sm text-gray-600">{{ item.bookings || '0' }}</span>
            </template>
            <template #cell(actions)="{ item }">
              <button @click="openDetails(item, 'partner')" class="text-gray-400 hover:text-blue-600 transition-colors">
                <EyeIcon class="h-4 w-4" />
              </button>
            </template>
          </UiBaseTable>
        </div>

        <!-- Recent bookings -->
        <div class="space-y-5">
          <div class="flex items-end justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <p class="text-sm text-gray-400 mt-0.5">Latest customer bookings across the platform</p>
            </div>
            <UiBaseButton variant="secondary" size="md" @click="navigateTo('/dashboard/bookings')">
              All bookings
              <ArrowRightIcon class="h-4 w-4 ml-2" />
            </UiBaseButton>
          </div>

          <UiBaseTable 
            :columns="bookingColumns" 
            :items="recentBookings"
            empty-title="No recent activity"
          >
            <template #cell(user)="{ item }">
              <div class="text-base font-medium text-gray-900 capitalize">{{ item.contactDetails?.name || `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim() || 'Guest' }}</div>
            </template>
            <template #cell(amount)="{ item }">
              <span class="text-sm font-bold text-gray-900 uppercase">{{ item.pricing?.currency || 'USD' }} {{ item.pricing?.totalAmount?.toLocaleString() || '0' }}</span>
            </template>
            <template #cell(status)="{ item }">
              <span class="px-2.5 py-0.5 rounded-full text-sm font-bold" :class="bookingStatusClass(item.status)">
                {{ item.status }}
              </span>
            </template>
            <template #cell(actions)="{ item }">
              <button @click="openDetails(item, 'booking')" class="text-gray-400 hover:text-blue-600 transition-colors">
                <EyeIcon class="h-4 w-4" />
              </button>
            </template>
          </UiBaseTable>
        </div>
      </div>
    </template>

    <!-- Details Side Drawer -->
    <UiSideDrawer 
      :show="showDetailsDrawer" 
      title="System Insight" 
      subtitle="Review detailed forensics for selected transaction or partner profile"
      size="full"
      @close="showDetailsDrawer = false"
    >
      <div v-if="selectedItem" class="space-y-8">
        <!-- Overview Header -->
        <div class="flex items-center space-x-4 p-6 bg-gray-50 rounded-2xl">
          <div class="h-14 w-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-none">
            <component :is="selectedType === 'booking' ? TicketIcon : BuildingOfficeIcon" class="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h4 class="text-lg font-bold text-gray-900">{{ selectedType === 'booking' ? 'Booking Details' : 'Agency Profile' }}</h4>
            <p class="text-sm text-gray-400 font-medium">Ref: {{ selectedItem._id }}</p>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 gap-6 px-2">
          <template v-if="selectedType === 'booking'">
            <div class="space-y-1">
              <p class="text-sm font-bold text-gray-400  uppercase">Customer</p>
              <p class="text-base font-semibold text-gray-900 capitalize">{{ selectedItem.contactDetails?.name || `${selectedItem.user?.firstName || ''} ${selectedItem.user?.lastName || ''}`.trim() || 'Guest' }}</p>
              <p class="text-sm text-gray-500">{{ selectedItem.contactDetails?.email || selectedItem.user?.email || 'N/A' }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-bold text-gray-400  uppercase">Agency Source</p>
              <p class="text-base font-semibold text-gray-900">{{ selectedItem.tenant?.name || 'Flybeth Direct' }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-sm font-bold text-gray-400  uppercase">Total Value</p>
                <p class="text-sm font-bold text-gray-900 uppercase">{{ selectedItem.pricing?.currency || 'USD' }} {{ selectedItem.pricing?.totalAmount?.toLocaleString() || '0' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-bold text-gray-400  uppercase">Current Status</p>
                <span class="inline-block px-3 py-1 rounded-full text-sm font-bold" :class="bookingStatusClass(selectedItem.status)">
                  {{ selectedItem.status }}
                </span>
              </div>
            </div>
            <div class="space-y-1">
                <p class="text-sm font-bold text-gray-400  uppercase">Booking Date</p>
                <p class="text-base font-medium text-gray-700">{{ new Date(selectedItem.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) }}</p>
            </div>
          </template>

          <template v-else>
            <div class="space-y-1">
              <p class="text-sm font-bold text-gray-400  uppercase">Agency Name</p>
              <p class="text-base font-semibold text-gray-900">{{ selectedItem.name }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-bold text-gray-400  uppercase">Email Address</p>
              <p class="text-base font-semibold text-gray-900">{{ selectedItem.email }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-sm font-bold text-gray-400  uppercase">Overall Revenue</p>
                <p class="text-sm font-bold text-gray-900">${{ selectedItem.revenue?.toLocaleString() }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-bold text-gray-400  uppercase">Booking Volume</p>
                <p class="text-sm font-bold text-gray-900">{{ selectedItem.bookings }} entries</p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <template #footer>
        <div class="w-full">
          <UiBaseButton 
            variant="primary" 
            block 
            @click="navigateTo(selectedType === 'booking' ? '/bookings' : `/tenants/${selectedItem?._id}`)"
          >
            View Full Details
          </UiBaseButton>
        </div>
      </template>
    </UiSideDrawer>

    <!-- Download Ledger Modal -->
    <Teleport to="body" v-if="mounted">
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
        <div v-if="showDownloadModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md" @click.self="showDownloadModal = false">
          <div class="bg-white rounded-[2.5rem] border border-white/20 w-full max-w-lg shadow-none shadow-slate-900/20" @click.stop>
            <div class="px-10 py-8 flex items-center justify-between border-b border-gray-100 rounded-t-[2.5rem]">
              <h3 class="text-2xl font-bold text-gray-900">Download Ledger</h3>
              <button @click="showDownloadModal = false" class="p-2 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900">
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>
            
            <div class="px-10 py-8 space-y-8">
              <div>
                <p class="text-[15px] text-gray-500 font-medium mb-3">Please select the date range to download the ledger for.</p>
                <div class="relative z-[110]">
                  <UiDateRangePicker v-model="ledgerDateRange" />
                </div>
              </div>

              <div class="space-y-4">
                <label class="block text-sm font-bold text-gray-900">Export Format</label>
                <div class="flex gap-6">
                  <label class="flex items-center gap-3 cursor-pointer group">
                    <div class="relative flex items-center justify-center">
                      <input type="radio" v-model="downloadFormat" value="csv" class="peer sr-only">
                      <div class="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-gray-900 peer-checked:bg-gray-900 transition-all"></div>
                      <div class="absolute w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                    </div>
                    <span class="text-[15px] font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">CSV (.csv)</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer group">
                    <div class="relative flex items-center justify-center">
                      <input type="radio" v-model="downloadFormat" value="excel" class="peer sr-only">
                      <div class="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-gray-900 peer-checked:bg-gray-900 transition-all"></div>
                      <div class="absolute w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                    </div>
                    <span class="text-[15px] font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">Excel (.xlsx)</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="px-10 py-8 bg-gray-50/50 flex justify-end space-x-3 rounded-b-[2.5rem]">
              <UiBaseButton variant="outline" @click="showDownloadModal = false" class="shadow-none border-gray-200">Cancel</UiBaseButton>
              <UiBaseButton 
                variant="primary" 
                @click="handleDownloadLedger" 
                :loading="downloading" 
                :disabled="!ledgerDateRange"
                class="bg-gray-900 text-white shadow-none px-8"
              >
                Submit
              </UiBaseButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdmin } from '@/composables/modules/admin/useAdmin'
import { 
  BuildingOfficeIcon, 
  BanknotesIcon, 
  TicketIcon, 
  GlobeAltIcon,
  ArrowRightIcon,
  EyeIcon,
  CloudArrowDownIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'
import { useCustomToast } from '@/composables/core/useCustomToast'
import { useConfirmation } from '@/composables/core/useConfirmation'

definePageMeta({
  layout: 'admin'
})

const { dashboardData, fetchDashboard, loading, downloadRevenueLedger, initiateGlobalSettlement } = useAdmin()
const { showToast } = useCustomToast()
const { confirm } = useConfirmation()

const downloading = ref(false)
const settling = ref(false)
const showDownloadModal = ref(false)
const downloadFormat = ref('csv')
const ledgerDateRange = ref<{ start: string, end: string } | null>(null)

const handleDownloadLedger = async () => {
    if (!ledgerDateRange.value) {
        showToast({ title: 'Error', message: 'Please select a date range first.', toastType: 'error' })
        return
    }
    downloading.value = true
    try {
        await downloadRevenueLedger({
            startDate: ledgerDateRange.value.start,
            endDate: ledgerDateRange.value.end,
            format: downloadFormat.value
        })
        showToast({ title: 'Success', message: 'Ledger exported successfully.', toastType: 'success' })
        showDownloadModal.value = false
    } finally {
        downloading.value = false
    }
}

const handleSettlement = async () => {
    const confirmed = await confirm({
        title: 'Initiate Global Settlement?',
        message: 'This will reconcile all pending commissions and update partner balances. This action is irreversible.',
        confirmText: 'Yes, settle all'
    })
    if (!confirmed) return

    settling.value = true
    try {
        const success = await initiateGlobalSettlement()
        if (success) {
            showToast({ title: 'Settlement Initiated', message: 'Global accounts are being updated.', toastType: 'success' })
        } else {
            showToast({ title: 'Settlement Failed', message: 'The protocol encountered an error.', toastType: 'error' })
        }
    } finally {
        settling.value = false
    }
}

// Details Drawer State
const showDetailsDrawer = ref(false)
const selectedItem = ref<any>(null)
const selectedType = ref<'booking' | 'partner'>('booking')

const openDetails = (item: any, type: 'booking' | 'partner') => {
  selectedItem.value = item
  selectedType.value = type
  showDetailsDrawer.value = true
}

const drawerTitle = computed(() => {
  if (!selectedItem.value) return 'Details'
  return selectedType.value === 'booking' ? 'Booking Insight' : 'Partner insight'
})

const mounted = ref(false)

onMounted(() => {
  mounted.value = true
  fetchDashboard()
})

const computedStats = computed(() => {
  const d = dashboardData.value
  const overview = d?.overview
  const analytics = d?.analytics
  
  const revenueValues = d?.revenue?.byCurrency?.length 
    ? d.revenue.byCurrency.map((c: any) => `${c._id} ${c.totalAmount.toLocaleString()}`)
    : ['USD 0']

  return [
    { 
      name: 'Total revenue', 
      value: revenueValues, 
      trend: analytics?.successRate ? `${analytics.successRate} success` : null, 
      trendClass: 'text-emerald-600', 
      icon: BanknotesIcon, 
      bgClass: 'bg-emerald-50', 
      iconClass: 'text-emerald-600' 
    },
    { 
      name: 'Active agencies', 
      value: overview?.totalTenants || '0', 
      trend: null, 
      trendClass: 'text-emerald-600', 
      icon: BuildingOfficeIcon, 
      bgClass: 'bg-blue-50', 
      iconClass: 'text-blue-600' 
    },
    { 
      name: 'Bookings monthly', 
      value: overview?.currentMonthPerformance?.newBookings || '0', 
      trend: overview?.bookingTrend || null, 
      trendClass: (overview?.bookingTrend || '').startsWith('-') ? 'text-red-500' : 'text-emerald-600', 
      icon: TicketIcon, 
      bgClass: 'bg-indigo-50', 
      iconClass: 'text-indigo-600' 
    },
    { 
      name: 'New customers', 
      value: overview?.currentMonthPerformance?.newUsers || '0', 
      trend: overview?.userTrend || null, 
      trendClass: (overview?.userTrend || '').startsWith('-') ? 'text-red-500' : 'text-emerald-600', 
      icon: GlobeAltIcon, 
      bgClass: 'bg-amber-50', 
      iconClass: 'text-amber-600' 
    },
  ]
})

const topAgents = computed(() => dashboardData.value?.revenue?.topPartners || [])
const recentBookings = computed(() => (dashboardData.value?.recentBookings || []).slice(0, 5))

const agentColumns = [
  { key: 'name', label: 'Agency' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'bookings', label: 'Volume' },
  { key: 'actions', label: '', tdClass: 'text-right' },
]

const bookingColumns = [
  { key: 'user', label: 'Customer' },
  { key: 'amount', label: 'Value' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', tdClass: 'text-right' },
]

const bookingStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed': case 'ticketed': return 'bg-emerald-50 text-emerald-700'
    case 'pending': return 'bg-yellow-50 text-yellow-700'
    case 'cancelled': case 'failed': return 'bg-red-50 text-red-700'
    default: return 'bg-gray-50 text-gray-500'
  }
}
</script>

