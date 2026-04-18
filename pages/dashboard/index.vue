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
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">System overview</h1>
          <p class="text-gray-500 font-medium">Global mission control for Flybeth travel infrastructure</p>
        </div>
        <div class="flex gap-4">
          <UiBaseButton variant="outline" @click="handleDownloadLedger" :loading="downloading" class="shadow-none">
            <CloudArrowDownIcon class="h-4 w-4 mr-2" />
            Download ledger
          </UiBaseButton>
          <UiBaseButton variant="primary" @click="handleSettlement" :loading="settling" class="bg-gray-900 text-white shadow-none min-w-[180px]">
            <SparklesIcon class="h-4 w-4 mr-2" />
            Initiate settlement
          </UiBaseButton>
        </div>
      </div>
      <!-- Main Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <UiBaseCard 
          v-for="stat in computedStats" 
          :key="stat.name" 
          padding 
          class="group transition-all duration-300 hover:shadow-md"
        >
          <div class="flex items-center space-x-4">
            <div class="p-3 rounded-xl" :class="stat.bgClass">
              <component :is="stat.icon" class="h-5 w-5" :class="stat.iconClass" />
            </div>
            <div>
              <p class="text-base font-medium text-gray-400 mb-1">{{ stat.name }}</p>
              <div class="flex items-baseline space-x-2">
                <h3 class="text-2xl font-bold text-gray-900 leading-none">{{ stat.value }}</h3>
                <span v-if="stat.trend" class="text-base font-semibold" :class="stat.trendClass">{{ stat.trend }}</span>
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
              <h3 class="text-lg font-semibold text-gray-900">Top performing partners</h3>
              <p class="text-sm text-gray-400 mt-0.5">Best performing agency partners by revenue</p>
            </div>
            <UiBaseButton variant="secondary" size="md" @click="navigateTo('/tenants')">
              View all
              <ArrowRightIcon class="h-4 w-4 ml-2" />
            </UiBaseButton>
          </div>

          <UiBaseTable 
            :columns="agentColumns" 
            :items="topAgents"
            empty-title="No partners found"
            empty-description="Your partner network activity will appear here."
          >
            <template #cell(name)="{ item }">
              <div class="flex items-center space-x-3">
                <div class="h-8 w-8 rounded bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-gray-400 text-sm">
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
              <h3 class="text-lg font-semibold text-gray-900">Recent bookings</h3>
              <p class="text-sm text-gray-400 mt-0.5">Latest transactions across the platform</p>
            </div>
            <UiBaseButton variant="secondary" size="md" @click="navigateTo('/bookings')">
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
              <div class="text-base font-medium text-gray-900">{{ item.user?.firstName }} {{ item.user?.lastName }}</div>
            </template>
            <template #cell(amount)="{ item }">
              <span class="text-sm font-bold text-gray-900">${{ item.totalPrice || '0' }}</span>
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
      :title="drawerTitle" 
      @close="showDetailsDrawer = false"
    >
      <div v-if="selectedItem" class="space-y-8">
        <!-- Overview Header -->
        <div class="flex items-center space-x-4 p-6 bg-gray-50 rounded-2xl">
          <div class="h-14 w-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
            <component :is="selectedType === 'booking' ? TicketIcon : BuildingOfficeIcon" class="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h4 class="text-lg font-bold text-gray-900">{{ selectedType === 'booking' ? 'Transaction Details' : 'Partner Profile' }}</h4>
            <p class="text-sm text-gray-400 font-medium">Ref: {{ selectedItem._id }}</p>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 gap-6 px-2">
          <template v-if="selectedType === 'booking'">
            <div class="space-y-1">
              <p class="text-sm font-bold text-gray-400 tracking-widest uppercase">Customer</p>
              <p class="text-base font-semibold text-gray-900">{{ selectedItem.user?.firstName }} {{ selectedItem.user?.lastName }}</p>
              <p class="text-sm text-gray-500">{{ selectedItem.user?.email }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-bold text-gray-400 tracking-widest uppercase">Agency Source</p>
              <p class="text-base font-semibold text-gray-900">{{ selectedItem.tenant?.name || 'Flybeth Direct' }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-sm font-bold text-gray-400 tracking-widest uppercase">Total Value</p>
                <p class="text-sm font-bold text-gray-900">${{ selectedItem.totalPrice?.toLocaleString() }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-bold text-gray-400 tracking-widest uppercase">Current Status</p>
                <span class="inline-block px-3 py-1 rounded-full text-sm font-bold" :class="bookingStatusClass(selectedItem.status)">
                  {{ selectedItem.status }}
                </span>
              </div>
            </div>
            <div class="space-y-1">
                <p class="text-sm font-bold text-gray-400 tracking-widest uppercase">Transaction Date</p>
                <p class="text-base font-medium text-gray-700">{{ new Date(selectedItem.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) }}</p>
            </div>
          </template>

          <template v-else>
            <div class="space-y-1">
              <p class="text-sm font-bold text-gray-400 tracking-widest uppercase">Agency Name</p>
              <p class="text-base font-semibold text-gray-900">{{ selectedItem.name }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-bold text-gray-400 tracking-widest uppercase">Email Address</p>
              <p class="text-base font-semibold text-gray-900">{{ selectedItem.email }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-sm font-bold text-gray-400 tracking-widest uppercase">Overall Revenue</p>
                <p class="text-sm font-bold text-gray-900">${{ selectedItem.revenue?.toLocaleString() }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-bold text-gray-400 tracking-widest uppercase">Booking Volume</p>
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
            Go to full module
          </UiBaseButton>
        </div>
      </template>
    </UiSideDrawer>
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

const handleDownloadLedger = async () => {
    downloading.value = true
    try {
        await downloadRevenueLedger()
        showToast({ title: 'Success', message: 'Ledger exported successfully.', toastType: 'success' })
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

onMounted(() => {
  fetchDashboard()
})

const computedStats = computed(() => {
  const d = dashboardData.value
  const overview = d?.overview
  const analytics = d?.analytics
  
  const totalRev = d?.revenue?.byCurrency?.reduce((acc: number, cur: any) => acc + cur.totalAmount, 0) || 0
  const primaryCurrency = d?.revenue?.byCurrency?.[0]?._id || 'USD'

  return [
    { 
      name: 'Total revenue', 
      value: `${primaryCurrency} ${totalRev.toLocaleString()}`, 
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
const recentBookings = computed(() => dashboardData.value?.recentBookings || [])

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

