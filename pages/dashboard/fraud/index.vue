<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <span class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <ShieldExclamationIcon class="w-6 h-6" />
          </span>
          <h1 class="text-2xl font-bold text-gray-900 ">Fraud Prevention Hub</h1>
        </div>
        <p class="text-gray-500 text-sm mt-1">Monitor high-risk bookings, blocked IPs, and account security anomalies in real-time.</p>
      </div>
      <div class="flex gap-3">
        <button @click="refreshData" class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-none">
          <ArrowPathIcon class="w-4 h-4" />
          Refresh Signals
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-2xl border border-gray-200 shadow-none hover:shadow-none transition-all duration-300">
        <div :class="['w-10 h-10 rounded-xl mb-4 flex items-center justify-center', stat.colorClass]">
          <component :is="stat.icon" class="w-5 h-5" />
        </div>
        <div class="text-gray-400 text-sm font-bold   mb-1">{{ stat.label }}</div>
        <div class="text-2xl  text-gray-900">{{ stat.value }}</div>
        <div class="mt-2 text-base font-semibold flex items-center gap-1" :class="stat.trendColor">
          <ArrowTrendingDownIcon class="w-3 h-3" />
          {{ stat.trend }} vs last 7d
        </div>
      </div>
    </div>

    <!-- High Risk Bookings Table -->
    <div class="bg-white rounded-none border border-gray-200 shadow-none overflow-hidden">
      <div class="p-6 border-b border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
          High Risk Bookings
          <span class="px-2 py-0.5 bg-red-100 text-red-600 text-sm rounded-full   ">Requires Action</span>
        </h3>
        <div class="flex gap-2 w-full md:w-auto">
          <div class="relative flex-1 md:flex-none">
            <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input v-model="searchQuery" type="text" placeholder="Search PNR, user, IP..."
              class="w-full md:w-64 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all" />
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50/80">
            <tr>
              <th class="px-6 py-4 text-sm  text-gray-400  ">Booking / PNR</th>
              <th class="px-6 py-4 text-sm  text-gray-400  ">User / IP</th>
              <th class="px-6 py-4 text-sm  text-gray-400   text-center">Risk Score</th>
              <th class="px-6 py-4 text-sm  text-gray-400  ">Fraud Signals</th>
              <th class="px-6 py-4 text-sm  text-gray-400  ">Amount</th>
              <th class="px-6 py-4 text-sm  text-gray-400   text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="booking in filteredBookings" :key="booking._id || booking.id" class="hover:bg-blue-50/30 transition-colors">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-bold text-gray-900 text-sm">{{ booking.pnr }}</span>
                  <span class="text-sm text-gray-400 font-semibold   mt-0.5">{{ booking.date }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-semibold text-gray-700 text-sm">{{ booking.user?.firstName }} {{ booking.user?.lastName }}</span>
                  <span class="text-sm font-mono text-orange-500 mt-0.5">{{ booking.ipAddress }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <div
                  class="inline-flex items-center justify-center w-12 h-12 rounded-full border-[3px] transition-all"
                  :style="{ borderColor: getRiskColor(booking.riskScore), color: getRiskColor(booking.riskScore) }"
                >
                  <span class="text-sm ">{{ booking.riskScore }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1.5 max-w-[280px]">
                  <span v-for="signal in booking.fraudSignals" :key="signal"
                    class="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-lg font-bold whitespace-nowrap">
                    {{ signal }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-bold text-gray-900 text-sm">{{ booking.pricing?.totalAmount }} {{ booking.pricing?.currency }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-1.5">
                  <template v-if="isActionable(booking)">
                    <button @click="approveBooking(booking)"
                      class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Approve & Issue Ticket">
                      <CheckCircleIcon class="w-5 h-5" />
                    </button>
                    <button @click="rejectBooking(booking)"
                      class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Reject & Refund">
                      <XCircleIcon class="w-5 h-5" />
                    </button>
                  </template>
                  <template v-else>
                    <span class="px-2 py-1 text-xs font-bold rounded-lg uppercase whitespace-nowrap"
                          :class="getBadgeClass(booking)">
                      {{ getBadgeText(booking) }}
                    </span>
                  </template>
                  <button @click="selectedBooking = booking" class="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all" title="View Details">
                    <EyeIcon class="w-5 h-5" />
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
    <div class="bg-white rounded-none border border-gray-200 shadow-none overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
          Recent Bot Guard Activity
          <span class="px-2 py-0.5 bg-blue-100 text-blue-600 text-sm rounded-full   ">Auto-blocked</span>
        </h3>
      </div>
      <div class="divide-y divide-gray-50">
        <div v-for="event in botEvents" :key="event._id" class="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-600">
              <ShieldExclamationIcon class="w-4 h-4" />
            </div>
            <div>
              <span class="text-base font-semibold text-gray-800">{{ event.eventCount }} suspicious events</span>
              <span class="text-sm text-gray-400 ml-2 font-mono">{{ event._id }}</span>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-red-600 bg-red-50 text-sm font-bold   px-2 py-1 rounded-lg">
              Auto-Flagged
            </span>
            <span class="text-sm text-gray-400 font-semibold">{{ new Date(event.lastEvent).toLocaleTimeString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Details Modal -->
    <Teleport to="body">
      <div v-if="selectedBooking" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8 flex flex-col max-h-[90vh]">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold text-gray-900">Booking Details</h2>
            <span class="px-3 py-1 bg-gray-100 text-gray-700 font-mono text-sm font-bold rounded-lg">{{ selectedBooking.pnr }}</span>
          </div>
          <button @click="selectedBooking = null" class="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto flex-1 space-y-6 bg-gray-50/50">
          <!-- Security Context -->
          <div class="bg-white p-5 rounded-xl border border-red-100 shadow-sm flex flex-col md:flex-row gap-6">
            <div class="flex flex-col items-center justify-center min-w-[120px] p-4 rounded-xl" :style="{ backgroundColor: getRiskColor(selectedBooking.riskScore) + '1A' }">
              <span class="text-3xl font-black" :style="{ color: getRiskColor(selectedBooking.riskScore) }">{{ selectedBooking.riskScore }}</span>
              <span class="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Risk Score</span>
            </div>
            <div class="flex-1 space-y-3">
              <h4 class="font-bold text-gray-900 flex items-center gap-2">
                <ShieldExclamationIcon class="w-5 h-5 text-red-500" /> Fraud Signals Detected
              </h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="signal in selectedBooking.fraudSignals" :key="signal" class="px-3 py-1.5 bg-red-50 text-red-700 text-sm font-bold rounded-lg border border-red-100">
                  {{ signal }}
                </span>
              </div>
            </div>
          </div>

          <!-- Customer & Contact -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h4 class="font-bold text-gray-900 border-b border-gray-100 pb-2">Customer Details</h4>
              <div class="space-y-3">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500 uppercase font-semibold">Name</span>
                  <span class="font-medium text-gray-900">{{ selectedBooking.contactDetails?.name || 'N/A' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500 uppercase font-semibold">Email</span>
                  <span class="font-medium text-blue-600">{{ selectedBooking.contactDetails?.email || 'N/A' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500 uppercase font-semibold">Phone</span>
                  <span class="font-medium text-gray-900">{{ selectedBooking.contactDetails?.phone || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <!-- Pricing & Status -->
            <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h4 class="font-bold text-gray-900 border-b border-gray-100 pb-2">Payment & Pricing</h4>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500 font-medium">Base Fare</span>
                  <span class="text-sm text-gray-900">{{ selectedBooking.pricing?.baseFare?.toLocaleString() }} {{ selectedBooking.pricing?.currency }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500 font-medium">Taxes</span>
                  <span class="text-sm text-gray-900">{{ selectedBooking.pricing?.taxes?.toLocaleString() }} {{ selectedBooking.pricing?.currency }}</span>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span class="text-sm font-bold text-gray-900">Total Amount</span>
                  <span class="text-base font-black text-gray-900">{{ selectedBooking.pricing?.totalAmount?.toLocaleString() }} {{ selectedBooking.pricing?.currency }}</span>
                </div>
                <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                  <span class="text-sm text-gray-500 font-medium">Payment Status</span>
                  <span class="px-2 py-1 rounded-md text-xs font-bold uppercase" :class="selectedBooking.payment?.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'">
                    {{ selectedBooking.payment?.status || 'Unknown' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Trip Details -->
          <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h4 class="font-bold text-gray-900 border-b border-gray-100 pb-2">Trip Information</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="flex flex-col">
                <span class="text-xs text-gray-500 uppercase font-semibold">Booking Status</span>
                <span class="font-bold text-gray-900 capitalize">{{ selectedBooking.status }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-500 uppercase font-semibold">Passengers</span>
                <span class="font-medium text-gray-900">{{ selectedBooking.totalPassengers }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-500 uppercase font-semibold">Created At</span>
                <span class="font-medium text-gray-900">{{ new Date(selectedBooking.createdAt).toLocaleDateString() }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-500 uppercase font-semibold">Expires At</span>
                <span class="font-medium text-gray-900">{{ new Date(selectedBooking.expiresAt).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0 rounded-b-2xl">
          <button @click="selectedBooking = null" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            Close
          </button>
          <template v-if="isActionable(selectedBooking)">
            <button @click="rejectBooking(selectedBooking); selectedBooking = null" class="px-5 py-2 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2 shadow-sm">
              <XCircleIcon class="w-5 h-5" /> Reject Booking
            </button>
            <button @click="approveBooking(selectedBooking); selectedBooking = null" class="px-5 py-2 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2 shadow-sm">
              <CheckCircleIcon class="w-5 h-5" /> Approve Booking
            </button>
          </template>
          <template v-else>
             <span class="px-3 py-1.5 text-sm font-bold rounded-lg uppercase"
                   :class="getBadgeClass(selectedBooking)">
               {{ getBadgeText(selectedBooking) }}
             </span>
          </template>
        </div>
      </div>
    </div>
    </Teleport>
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
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowTrendingDownIcon,
  UserMinusIcon,
  CreditCardIcon,
  XMarkIcon,
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
  { label: 'Analyzed Events', value: apiStats.value?.totalEventsAnalyzed?.toLocaleString() || '0', trend: 'Live', icon: ShieldCheckIcon, colorClass: 'bg-green-100 text-green-600', trendColor: 'text-green-500' },
  { label: 'High Risk Alerts', value: apiStats.value?.highRiskBookings || '0', trend: apiStats.value?.riskLevel || 'None', icon: ShieldExclamationIcon, colorClass: 'bg-orange-100 text-orange-600', trendColor: 'text-orange-500' },
  { label: 'Bot Threats', value: apiStats.value?.activeBotThreats || '0', trend: 'Active', icon: UserMinusIcon, colorClass: 'bg-gray-100 text-gray-600', trendColor: 'text-red-400' },
  { label: 'Security Score', value: `${apiStats.value?.securityScore || 100}%`, trend: 'System', icon: CreditCardIcon, colorClass: 'bg-blue-100 text-blue-600', trendColor: 'text-blue-500' },
])

onMounted(async () => {
  await Promise.all([
    fetchHighRiskBookings(),
    fetchBotEvents(),
    fetchStats()
  ])
})

const searchQuery = ref('')
const selectedBooking = ref<any>(null)

const filteredBookings = computed(() => {
  const bookings = highRiskBookings.value || []
  if (!searchQuery.value) return bookings
  const q = searchQuery.value.toLowerCase()
  return bookings.filter(b =>
    (b.pnr || '').toLowerCase().includes(q) ||
    (b.user?.firstName || b.user?.email || '').toLowerCase().includes(q) ||
    (b.ipAddress || '').includes(q)
  )
})

const getRiskColor = (score: number) => {
  if (score >= 80) return '#ef4444'
  if (score >= 50) return '#f97316'
  return '#22c55e'
}

const isActionable = (booking: any) => {
  if (booking.status !== 'pending') return false;
  if (booking.fraudSignals?.includes('Manually rejected as fraud by admin')) return false;
  if (booking.fraudSignals?.includes('Manually approved by admin')) return false;
  return true;
}

const getBadgeText = (booking: any) => {
  if (booking.fraudSignals?.includes('Manually rejected as fraud by admin')) return 'REJECTED';
  if (booking.fraudSignals?.includes('Manually approved by admin')) return 'APPROVED';
  return booking.status;
}

const getBadgeClass = (booking: any) => {
  if (booking.fraudSignals?.includes('Manually rejected as fraud by admin') || booking.status === 'cancelled') return 'bg-red-100 text-red-700';
  if (booking.fraudSignals?.includes('Manually approved by admin') || booking.status === 'ticketed') return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-500';
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
    // Seamless optimistic update
    booking.fraudSignals = ['Manually approved by admin'];
    booking.riskScore = 0;
    
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
    // Seamless optimistic update
    booking.fraudSignals = ['Manually rejected as fraud by admin'];
    booking.riskScore = 100;
    
    await apiRejectBooking(booking._id || booking.id)
    await fetchHighRiskBookings()
  }
}
</script>
