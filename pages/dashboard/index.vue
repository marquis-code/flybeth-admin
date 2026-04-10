<template>
  <div class="space-y-8 pb-12">
    <!-- Loading State -->
    <div v-if="loading && !dashboardData" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center space-y-4">
        <div class="h-10 w-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="text-sm font-medium text-gray-400">Loading dashboard...</p>
      </div>
    </div>

    <template v-else>
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
              <p class="text-xs font-medium text-gray-400 mb-1">{{ stat.name }}</p>
              <div class="flex items-baseline space-x-2">
                <h3 class="text-2xl font-bold text-gray-900 leading-none">{{ stat.value }}</h3>
                <span v-if="stat.trend" class="text-xs font-semibold" :class="stat.trendClass">{{ stat.trend }}</span>
              </div>
            </div>
          </div>
        </UiBaseCard>
      </div>

      <!-- Agent Marketplace -->
      <div class="space-y-5">
        <div class="flex items-end justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Top agents</h3>
            <p class="text-sm text-gray-400 mt-0.5">Best performing agency partners across the network</p>
          </div>
          <UiBaseButton variant="secondary" size="md" @click="navigateTo('/agents')">
            View all agents
            <ArrowRightIcon class="h-4 w-4 ml-2" />
          </UiBaseButton>
        </div>

        <UiBaseTable 
          :columns="agentColumns" 
          :items="topAgents"
          empty-title="No agents registered"
          empty-description="Your agent network is empty. Start by inviting new partners."
        >
          <template #cell(name)="{ item }">
            <div class="flex items-center space-x-3">
              <div class="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-semibold text-blue-700 text-sm">
                {{ item.name?.[0] || 'A' }}
              </div>
              <div>
                <div class="text-sm font-semibold text-gray-900">{{ item.name }}</div>
                <div class="text-xs text-gray-400">{{ item.email }}</div>
              </div>
            </div>
          </template>

          <template #cell(status)="{ item }">
            <span class="px-3 py-1 rounded-full text-xs font-medium inline-block text-center min-w-[80px]" :class="statusClass(item.status)">
              {{ item.status }}
            </span>
          </template>

          <template #cell(revenue)="{ item }">
            <span class="font-semibold text-gray-900 text-sm">${{ item.revenue?.toLocaleString() || '0' }}</span>
          </template>

          <template #cell(actions)="{ item }">
            <div class="flex justify-end">
              <button 
                class="hover:bg-gray-100 h-8 w-8 flex items-center justify-center rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                @click="navigateTo(`/agents/${item._id || ''}`)"
              >
                <ArrowTopRightOnSquareIcon class="h-4 w-4" />
              </button>
            </div>
          </template>
        </UiBaseTable>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAdmin } from '@/composables/modules/admin/useAdmin'
import { 
  BuildingOfficeIcon, 
  BanknotesIcon, 
  TicketIcon, 
  GlobeAltIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const { dashboardData, fetchDashboard, loading } = useAdmin()

onMounted(() => {
  fetchDashboard()
})

const computedStats = computed(() => [
  { 
    name: 'Platform revenue', 
    value: dashboardData.value?.totalRevenue || '$0.00', 
    trend: dashboardData.value?.revenueTrend || null, 
    trendClass: 'text-emerald-600', 
    icon: BanknotesIcon, 
    bgClass: 'bg-emerald-50', 
    iconClass: 'text-emerald-600' 
  },
  { 
    name: 'Agency partners', 
    value: dashboardData.value?.activeTenants || '0', 
    trend: dashboardData.value?.tenantGrowth || null, 
    trendClass: 'text-emerald-600', 
    icon: BuildingOfficeIcon, 
    bgClass: 'bg-blue-50', 
    iconClass: 'text-blue-600' 
  },
  { 
    name: 'Total bookings', 
    value: dashboardData.value?.totalBookings || '0', 
    trend: dashboardData.value?.bookingTrend || null, 
    trendClass: 'text-emerald-600', 
    icon: TicketIcon, 
    bgClass: 'bg-indigo-50', 
    iconClass: 'text-indigo-600' 
  },
  { 
    name: 'Travelers', 
    value: dashboardData.value?.totalUsers || '0', 
    trend: dashboardData.value?.userGrowth || null, 
    trendClass: 'text-emerald-600', 
    icon: GlobeAltIcon, 
    bgClass: 'bg-amber-50', 
    iconClass: 'text-amber-600' 
  },
])

const topAgents = computed(() => dashboardData.value?.topTenants || [])

const agentColumns = [
  { key: 'name', label: 'Agency partner' },
  { key: 'status', label: 'Status' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'actions', label: '', tdClass: 'text-right' },
]

const statusClass = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-emerald-50 text-emerald-700'
    case 'Pending': return 'bg-yellow-50 text-yellow-700'
    default: return 'bg-red-50 text-red-600'
  }
}
</script>
