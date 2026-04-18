<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <span class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <ShieldExclamationIcon class="w-6 h-6" />
          </span>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Fraud Prevention Hub</h1>
        </div>
        <p class="text-gray-500 text-sm mt-1">Monitor high-risk bookings, blocked IPs, and account security anomalies in real-time.</p>
      </div>
      <div class="flex gap-3">
        <button @click="refreshData" class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
          <ArrowPathIcon class="w-4 h-4" />
          Refresh Signals
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div :class="['w-10 h-10 rounded-xl mb-4 flex items-center justify-center', stat.colorClass]">
          <component :is="stat.icon" class="w-5 h-5" />
        </div>
        <div class="text-gray-400 text-sm font-bold  tracking-widest mb-1">{{ stat.label }}</div>
        <div class="text-2xl font-black text-gray-900">{{ stat.value }}</div>
        <div class="mt-2 text-base font-semibold flex items-center gap-1" :class="stat.trendColor">
          <ArrowTrendingDownIcon class="w-3 h-3" />
          {{ stat.trend }} vs last 7d
        </div>
      </div>
    </div>

    <!-- High Risk Bookings Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
          High Risk Bookings
          <span class="px-2 py-0.5 bg-red-100 text-red-600 text-sm rounded-full font-black  tracking-wider">Requires Action</span>
        </h3>
        <div class="flex gap-2 w-full md:w-auto">
          <div class="relative flex-1 md:flex-none">
            <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input v-model="searchQuery" type="text" placeholder="Search PNR, user, IP..."
              class="w-full md:w-64 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all" />
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50/80">
            <tr>
              <th class="px-6 py-4 text-sm font-black text-gray-400  tracking-widest">Booking / PNR</th>
              <th class="px-6 py-4 text-sm font-black text-gray-400  tracking-widest">User / IP</th>
              <th class="px-6 py-4 text-sm font-black text-gray-400  tracking-widest text-center">Risk Score</th>
              <th class="px-6 py-4 text-sm font-black text-gray-400  tracking-widest">Fraud Signals</th>
              <th class="px-6 py-4 text-sm font-black text-gray-400  tracking-widest">Amount</th>
              <th class="px-6 py-4 text-sm font-black text-gray-400  tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="booking in filteredBookings" :key="booking._id || booking.id" class="hover:bg-blue-50/30 transition-colors">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-bold text-gray-900 text-sm">{{ booking.pnr }}</span>
                  <span class="text-sm text-gray-400 font-semibold  tracking-wider mt-0.5">{{ booking.date }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-semibold text-gray-700 text-sm">{{ booking.user }}</span>
                  <span class="text-sm font-mono text-orange-500 mt-0.5">{{ booking.ip }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <div
                  class="inline-flex items-center justify-center w-12 h-12 rounded-full border-[3px] transition-all"
                  :style="{ borderColor: getRiskColor(booking.score), color: getRiskColor(booking.score) }"
                >
                  <span class="text-sm font-black">{{ booking.score }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1.5 max-w-[280px]">
                  <span v-for="signal in booking.signals" :key="signal"
                    class="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-lg font-bold whitespace-nowrap">
                    {{ signal }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-bold text-gray-900 text-sm">{{ booking.amount }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-1.5">
                  <button @click="approveBooking(booking)"
                    class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Approve & Issue Ticket">
                    <CheckCircleIcon class="w-5 h-5" />
                  </button>
                  <button @click="rejectBooking(booking)"
                    class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Reject & Refund">
                    <XCircleIcon class="w-5 h-5" />
                  </button>
                  <button class="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all" title="View Details">
                    <EllipsisVerticalIcon class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredBookings.length === 0">
              <td colspan="6" class="px-6 py-16 text-center">
                <ShieldCheckIcon class="w-12 h-12 text-green-300 mx-auto mb-3" />
                <p class="font-semibold text-gray-500">No high-risk bookings detected.</p>
                <p class="text-sm text-gray-400 mt-1">All recent bookings are within normal risk parameters.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Bot Activity -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-50">
        <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
          Recent Bot Guard Activity
          <span class="px-2 py-0.5 bg-blue-100 text-blue-600 text-sm rounded-full font-black  tracking-wider">Auto-blocked</span>
        </h3>
      </div>
      <div class="divide-y divide-gray-50">
        <div v-for="event in botEvents" :key="event.id" class="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="event.blocked ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'">
              <ShieldExclamationIcon class="w-4 h-4" />
            </div>
            <div>
              <span class="text-base font-semibold text-gray-800">{{ event.path }}</span>
              <span class="text-sm text-gray-400 ml-2 font-mono">{{ event.ip }}</span>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span :class="event.blocked ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'" class="text-sm font-bold  tracking-wider px-2 py-1 rounded-lg">
              {{ event.blocked ? 'Blocked' : 'Warned' }}
            </span>
            <span class="text-sm text-gray-400 font-semibold">{{ event.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ShieldExclamationIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  ArrowTrendingDownIcon,
  UserMinusIcon,
  CreditCardIcon,
} from '@heroicons/vue/24/outline'
import { useFraud } from '@/composables/modules/admin/useFraud'
import { useConfirmation } from '@/composables/core/useConfirmation'

const { 
  loading, 
  highRiskBookings, 
  botEvents, 
  stats: apiStats, 
  fetchHighRiskBookings, 
  fetchBotEvents, 
  fetchStats,
  approveBooking: apiApproveBooking,
  rejectBooking: apiRejectBooking
} = useFraud()

const { confirm } = useConfirmation()

definePageMeta({
  layout: 'admin',
})

const stats = computed(() => [
  { label: 'Blocked Attacks', value: apiStats.value?.blockedAttacks || '1,284', trend: '↓ 12%', icon: ShieldCheckIcon, colorClass: 'bg-green-100 text-green-600', trendColor: 'text-green-500' },
  { label: 'High Risk Alerts', value: apiStats.value?.highRiskAlerts || '24', trend: '↓ 5%', icon: ShieldExclamationIcon, colorClass: 'bg-orange-100 text-orange-600', trendColor: 'text-green-500' },
  { label: 'Banned IPs', value: apiStats.value?.bannedIps || '89', trend: '↑ 2%', icon: UserMinusIcon, colorClass: 'bg-gray-100 text-gray-600', trendColor: 'text-red-400' },
  { label: 'Chargebacks', value: apiStats.value?.chargebacks || '$850', trend: '↓ 45%', icon: CreditCardIcon, colorClass: 'bg-red-100 text-red-600', trendColor: 'text-green-500' },
])

onMounted(async () => {
  await Promise.all([
    fetchHighRiskBookings(),
    fetchBotEvents(),
    fetchStats()
  ])
})

const searchQuery = ref('')

const filteredBookings = computed(() => {
  if (!searchQuery.value) return highRiskBookings.value
  const q = searchQuery.value.toLowerCase()
  return highRiskBookings.value.filter(b =>
    b.pnr.toLowerCase().includes(q) ||
    b.user.toLowerCase().includes(q) ||
    b.ip.toLowerCase().includes(q)
  )
})

const getRiskColor = (score: number) => {
  if (score >= 80) return '#ef4444'
  if (score >= 50) return '#f97316'
  return '#22c55e'
}

const refreshData = async () => {
  await fetchStats()
  await fetchHighRiskBookings()
  await fetchBotEvents()
}

const approveBooking = async (booking: any) => {
  const confirmed = await confirm({
    title: 'Booking Approved',
    message: `Booking ${booking.pnr} has been cleared for ticketing. The agent will be notified.`,
    confirmText: 'Confirm Approval',
  })
  if (confirmed) {
    await apiApproveBooking(booking._id || booking.id)
    await fetchHighRiskBookings()
  }
}

const rejectBooking = async (booking: any) => {
  const confirmed = await confirm({
    title: 'Reject & Refund',
    message: `Are you sure you want to REJECT and REFUND booking ${booking.pnr}? This account will also be flagged in the fraud database.`,
    confirmText: 'Reject Booking',
    variant: 'danger'
  })
  
  if (confirmed) {
    await apiRejectBooking(booking._id || booking.id)
    await fetchHighRiskBookings()
  }
}
</script>
