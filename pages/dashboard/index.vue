<template>
  <div class="space-y-10 pb-12">
    <!-- Loading State -->
    <div v-if="loading && !dashboardData" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center space-y-4">
        <div class="h-12 w-12 border-4 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin"></div>
        <p class="text-sm font-black text-brand-blue/40 uppercase tracking-widest">Hydrating Dashboard...</p>
      </div>
    </div>

    <template v-else>
      <!-- Main Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UiBaseCard 
          v-for="stat in computedStats" 
          :key="stat.name" 
          padding 
          class="group hover:bg-white transition-all duration-300"
        >
          <div class="flex items-center space-x-4">
            <div class="p-4 rounded-2xl transition-transform group-hover:rotate-6 shadow-sm" :class="stat.bgClass">
              <component :is="stat.icon" class="h-6 w-6" :class="stat.iconClass" />
            </div>
            <div>
              <p class="text-sm font-black text-brand-gray/40 uppercase tracking-[0.2em] mb-1 leading-none">{{ stat.name }}</p>
              <div class="flex items-baseline space-x-2">
                <h3 class="text-2xl  font-black text-brand-blue leading-none">{{ stat.value }}</h3>
                <span v-if="stat.trend" class="text-sm font-bold" :class="stat.trendClass">{{ stat.trend }}</span>
              </div>
            </div>
          </div>
        </UiBaseCard>
      </div>

      <!-- Charts & System Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <!-- System Health -->
        <UiBaseCard padding title="Infrastructure Health">
          <template #header>
            <div class="flex items-center justify-between w-full">
              <h3 class="text-xl  font-black text-brand-blue">System Vitality</h3>
              <span class="flex items-center text-sm font-black text-brand-green bg-brand-green/5 border border-brand-green/10 px-4 py-1.5 rounded-full uppercase tracking-widest">
                <div class="h-2 w-2 bg-brand-green rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(50,180,4,0.5)]"></div>
                Systems Nominal
              </span>
            </div>
          </template>
          
          <div class="space-y-6 mt-4">
            <div v-for="service in computedServices" :key="service.name" class="flex items-center justify-between group">
              <div class="flex items-center space-x-4">
                <div class="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-brand-blue/30 transition-colors">
                  <component :is="service.icon" class="h-5 w-5 text-brand-gray/40 group-hover:text-brand-blue" />
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-black text-brand-blue">{{ service.name }}</span>
                  <span class="text-[9px] font-bold text-brand-gray/30 uppercase tracking-widest">{{ service.status || 'Verified Link' }}</span>
                </div>
              </div>
              <div class="flex items-center space-x-1 px-3 h-7 bg-gray-50/50 rounded-full border border-gray-100">
                 <div v-for="i in 12" :key="i" class="h-3 w-[2px] rounded-full" :class="i > 11 ? 'bg-yellow-400' : 'bg-brand-green'"></div>
              </div>
              <span class="text-xs font-black text-brand-blue">{{ service.uptime }}%</span>
            </div>
          </div>
        </UiBaseCard>

        <!-- Revenue Distribution -->
        <UiBaseCard padding class="!bg-brand-blue relative overflow-hidden flex flex-col justify-between">
           <!-- Card Decoration -->
           <div class="absolute right-0 bottom-0 p-12 opacity-[0.03] pointer-events-none">
              <TicketIcon class="h-64 w-64 text-white" />
           </div>

           <div class="flex items-center justify-between relative z-10 mb-10">
              <h3 class="text-xl  font-black text-white">Platform Yield</h3>
              <UiBaseButton variant="ghost" class="!bg-white/5 !text-white/60 hover:!bg-white/10 !px-4 !py-2 !rounded-xl !border-transparent shadow-none" @click="navigateTo('/revenue')">
                View Reports
              </UiBaseButton>
           </div>

           <div class="h-48 flex items-end justify-between space-x-2 relative z-10 mb-6">
              <div 
                v-for="(item, i) in (revenueData || defaultRevenue)" 
                :key="i" 
                class="flex-grow rounded-xl bg-white/10 hover:bg-brand-green transition-all duration-300 cursor-pointer relative group flex items-end justify-center" 
                :style="{ height: (item.value / maxRevenue * 100) + '%' }"
              >
                <span class="absolute -top-10 text-sm font-black text-white opacity-0 group-hover:opacity-100 transition-all transform -translate-y-2 group-hover:translate-y-0 whitespace-nowrap bg-slate-900 px-3 py-1.5 rounded-lg shadow-xl">${{ (item.value / 1000).toFixed(1) }}k</span>
              </div>
           </div>

           <div class="flex justify-between relative z-10 text-[8px] font-black text-white/30 uppercase tracking-[0.2em] px-1">
              <span v-for="item in (revenueData || defaultRevenue)" :key="item.label">{{ item.label }}</span>
           </div>
        </UiBaseCard>
      </div>

      <!-- Active Agents Overview -->
      <div class="space-y-6">
        <div class="flex items-end justify-between px-2">
          <div>
            <h3 class="text-2xl  font-black text-brand-blue">Agent Marketplace</h3>
            <p class="text-sm text-brand-gray/50 font-medium">Top performing agency partners across the network</p>
          </div>
          <UiBaseButton variant="secondary" size="md" @click="navigateTo('/tenants')">
            Manage Agents
            <ArrowRightIcon class="h-4 w-4 ml-2" />
          </UiBaseButton>
        </div>

        <UiBaseTable 
          :columns="agentColumns" 
          :items="topAgents"
          empty-title="No Agents Registered"
          empty-description="Your agent marketplace is currently empty. Start by vetting new partners."
        >
          <template #cell(name)="{ item }">
            <div class="flex items-center space-x-4">
              <div class="h-10 w-10 rounded-xl bg-brand-blue/5 border border-brand-blue/5 flex items-center justify-center font-black text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                {{ item.name[0] }}
              </div>
              <div>
                <div class="text-sm font-black text-brand-blue">{{ item.name }}</div>
                <div class="text-sm font-bold text-brand-gray/40">{{ item.email }}</div>
              </div>
            </div>
          </template>

          <template #cell(status)="{ item }">
            <span class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block text-center min-w-[100px]" :class="statusClass(item.status)">
              {{ item.status }}
            </span>
          </template>

          <template #cell(revenue)="{ item }">
            <span class="font-black text-brand-blue text-sm tracking-tighter">${{ item.revenue?.toLocaleString() || '0' }}</span>
          </template>

          <template #cell(actions)="{ item }">
            <div class="flex justify-end">
              <button 
                class="hover:bg-brand-blue hover:text-white h-9 w-9 flex items-center justify-center rounded-xl transition-colors text-brand-gray/30"
                @click="navigateTo(`/tenants/${item._id || ''}`)"
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
  ServerIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const { dashboardData, revenueData, fetchDashboard, fetchRevenue, loading, systemHealth, fetchSystemHealth } = useAdmin()

onMounted(() => {
  fetchDashboard()
  fetchRevenue()
  fetchSystemHealth()
})

const computedStats = computed(() => [
  { 
    name: 'Platform Revenue', 
    value: dashboardData.value?.totalRevenue || '$0.00', 
    trend: dashboardData.value?.revenueTrend || null, 
    trendClass: 'text-brand-green', 
    icon: BanknotesIcon, 
    bgClass: 'bg-brand-green/10', 
    iconClass: 'text-brand-green' 
  },
  { 
    name: 'Agency Partners', 
    value: dashboardData.value?.activeTenants || '0', 
    trend: dashboardData.value?.tenantGrowth || null, 
    trendClass: 'text-brand-green', 
    icon: BuildingOfficeIcon, 
    bgClass: 'bg-brand-blue/10', 
    iconClass: 'text-brand-blue' 
  },
  { 
    name: 'Total Bookings', 
    value: dashboardData.value?.totalBookings || '0', 
    trend: dashboardData.value?.bookingTrend || null, 
    trendClass: 'text-brand-green', 
    icon: TicketIcon, 
    bgClass: 'bg-indigo-50', 
    iconClass: 'text-indigo-600' 
  },
  { 
    name: 'Global Travelers', 
    value: dashboardData.value?.totalUsers || '0', 
    trend: dashboardData.value?.userGrowth || null, 
    trendClass: 'text-brand-green', 
    icon: GlobeAltIcon, 
    bgClass: 'bg-amber-50', 
    iconClass: 'text-amber-600' 
  },
])

const computedServices = computed(() => {
  if (systemHealth.value) return systemHealth.value
  return [
    { name: 'Core API Cluster', uptime: '99.99', icon: ServerIcon },
    { name: 'GDS Gateway', uptime: '99.95', icon: GlobeAltIcon },
    { name: 'Property Engine', uptime: '100', icon: BuildingOfficeIcon },
    { name: 'Secure Layer', uptime: '99.98', icon: ShieldCheckIcon },
  ]
})

const topAgents = computed(() => dashboardData.value?.topTenants || [])

const agentColumns = [
  { key: 'name', label: 'Agency Partner' },
  { key: 'status', label: 'Status' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'revenue', label: 'Yield' },
  { key: 'actions', label: '', tdClass: 'text-right' },
]

const defaultRevenue = [
  { label: 'Stays', value: 40000 },
  { label: 'Flights', value: 70000 },
  { label: 'Cars', value: 45000 },
  { label: 'Pkgs', value: 90000 },
  { label: 'Activities', value: 65000 },
  { label: 'Cruises', value: 80000 },
  { label: 'Other', value: 50000 },
]

const maxRevenue = computed(() => {
  const data = revenueData.value || defaultRevenue
  return Math.max(...data.map((i: any) => i.value)) * 1.2
})

const statusClass = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-brand-green/10 text-brand-green'
    case 'Pending': return 'bg-yellow-100 text-yellow-600'
    default: return 'bg-red-50 text-red-500'
  }
}
</script>
