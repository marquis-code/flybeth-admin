<template>
  <div class="space-y-10 pb-12">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
       <div class="space-y-1">
         <h1 class="text-4xl  font-black text-brand-blue tracking-tight">Global Inventory</h1>
         <p class="text-brand-gray/60 font-medium">Monitor and oversee all travel transactions across the global network</p>
       </div>
       <div class="flex items-center gap-3">
         <UiBaseButton variant="outline" size="md">
           <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
           Export Yield
         </UiBaseButton>
         <UiBaseButton variant="primary" size="lg" @click="showNewBooking = true">
           <PlusIcon class="h-5 w-5 mr-2" />
           Direct Record
         </UiBaseButton>
       </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <UiBaseCard v-for="s in computedBookingStats" :key="s.label" padding class="group relative overflow-hidden hover:bg-white transition-all duration-300">
        <div class="absolute right-0 top-0 p-6 opacity-[0.02] group-hover:scale-110 transition-transform">
          <component :is="s.icon" class="h-20 w-20 text-brand-blue" />
        </div>
        <p class="text-sm font-black text-brand-gray/40 uppercase tracking-[0.2em] mb-1 leading-none">{{ s.label }}</p>
        <h4 class="text-3xl  font-black text-brand-blue leading-none">{{ s.value }}</h4>
        <div v-if="s.trend" class="mt-4 flex items-center text-sm font-bold" :class="s.trend > 0 ? 'text-brand-green' : 'text-red-400'">
          <component :is="s.trend > 0 ? ArrowUpIcon : ArrowDownIcon" class="h-3 w-3 mr-1" /> {{ Math.abs(s.trend) }}% vs period
        </div>
      </UiBaseCard>
    </div>

    <!-- Filter & Search Bar -->
    <UiBaseCard padding class="!py-4">
      <div class="flex flex-col lg:flex-row gap-6 items-center">
        <div class="w-full lg:flex-grow max-w-xl">
          <UiAnimatedInput 
            v-model="searchQuery" 
            label="Search Records"
          />
        </div>
        
        <div class="flex flex-wrap items-center gap-6 w-full lg:w-auto">
          <div v-for="filter in filters" :key="filter.label" class="flex-grow min-w-[140px]">
            <UiSelectInput
              v-model="selectedFilters[filter.key]"
              :label="filter.label"
              :options="filter.options"
              class="w-full"
            />
          </div>
          <div class="flex-grow min-w-[160px]">
            <UiDatePicker label="Trace Date" v-model="selectedDate" />
          </div>
        </div>
      </div>
    </UiBaseCard>

    <!-- Table Section -->
    <div v-if="loading && bookings.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100">
      <div class="h-10 w-10 border-4 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin"></div>
      <p class="mt-4 text-sm font-black text-brand-blue/40 uppercase tracking-widest">Querying Global Ledger...</p>
    </div>

    <UiBaseTable 
      v-else
      :columns="bookingColumns" 
      :items="bookings"
      show-checkbox
      empty-title="Archive Empty"
      empty-description="No transactions found matching your audit criteria. Adjust filters or search terms."
    >
      <template #cell(reference)="{ item }">
        <div class="flex flex-col">
          <span class="text-sm font-black text-brand-blue">{{ item.reference || 'REF-N/A' }}</span>
          <span class="text-sm font-bold text-brand-green uppercase tracking-widest">{{ item.pnr || 'NO-PNR' }}</span>
        </div>
      </template>

      <template #cell(service)="{ item }">
        <div class="flex items-center space-x-4">
          <div class="h-9 w-9 rounded-xl bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
            <component :is="serviceIcon(item.type)" class="h-4 w-4" />
          </div>
          <div>
            <div class="text-sm font-bold text-brand-blue line-clamp-1">{{ item.serviceName || item.service }}</div>
            <div class="text-sm font-bold text-brand-gray/40 uppercase tracking-tight">{{ formatDate(item.createdAt || item.date) }}</div>
          </div>
        </div>
      </template>

      <template #cell(agent)="{ item }">
        <div class="flex flex-col">
          <div class="text-sm font-black text-brand-blue uppercase tracking-widest">{{ item.tenantName || item.agent }}</div>
          <div class="text-[9px] text-brand-gray/40 font-bold uppercase tracking-tight mt-0.5">{{ item.customerName || item.customer }}</div>
        </div>
      </template>

      <template #cell(status)="{ item }">
        <span class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block text-center min-w-[100px]" :class="statusClass(item.status)">
          {{ item.status }}
        </span>
      </template>

      <template #cell(price)="{ item }">
        <span class="font-black text-brand-blue text-sm tracking-tighter">${{ (item.totalPrice || item.amount)?.toLocaleString() }}</span>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex items-center justify-end space-x-2">
          <button @click="viewDetails(item)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-brand-gray/40 transition-colors">
            <EyeIcon class="h-4 w-4" />
          </button>
          <button @click="navigateTo(`/bookings/${item._id || item.id}`)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-brand-gray/40 transition-colors">
            <ArrowTopRightOnSquareIcon class="h-4 w-4" />
          </button>
        </div>
      </template>
    </UiBaseTable>

    <!-- New Booking Side Drawer -->
    <UiSideDrawer 
      :show="showNewBooking" 
      title="Direct Transaction Entry" 
      @close="showNewBooking = false"
    >
      <div class="space-y-8">
        <p class="text-sm text-brand-gray/60 leading-relaxed font-medium">Manually record a booking for auditing and ledger reconciliation.</p>
        
        <div class="space-y-4">
          <UiAnimatedInput v-model="newBooking.customer" label="Client Name" />
          <UiAnimatedInput v-model="newBooking.email" label="Contact Email" type="email" />
          
          <div class="grid grid-cols-2 gap-4">
            <UiSelectInput
              v-model="newBooking.type"
              label="Service Category"
              :options="['Flight', 'Hotel', 'Car', 'Package']"
            />
            <UiDatePicker label="Trace Date" v-model="newBooking.date" />
          </div>

          <UiAnimatedInput v-model="newBooking.amount" label="Settlement Amount ($)" />
        </div>
      </div>

      <template #footer>
        <div class="flex gap-4 w-full">
          <UiBaseButton variant="ghost" class="flex-1" @click="showNewBooking = false">Dismiss</UiBaseButton>
          <UiBaseButton variant="primary" class="flex-1" :loading="loading" @click="handleCreateBooking">Authorize Entry</UiBaseButton>
        </div>
      </template>
    </UiSideDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useBookings } from '@/composables/modules/bookings/useBookings'
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  PaperAirplaneIcon, 
  TruckIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ShieldCheckIcon,
  EyeIcon,
  BanknotesIcon,
  TicketIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const { bookings, loading, fetchBookings, metadata, createBooking } = useBookings()

const showNewBooking = ref(false)
const searchQuery = ref('')
const selectedDate = ref('')
const selectedFilters = ref<Record<string, string>>({
  type: 'All Services',
  status: 'All Status'
})

const newBooking = ref({
  customer: '',
  email: '',
  type: 'Flight',
  date: '',
  amount: ''
})

const filters = [
  { key: 'type', label: 'Service Class', options: ['All Services', 'Stays', 'Flights', 'Cars', 'Packages'] },
  { key: 'status', label: 'Ledger Status', options: ['All Status', 'Confirmed', 'Pending', 'Cancelled', 'Failed'] },
]

const bookingColumns = [
  { key: 'reference', label: 'Reference' },
  { key: 'service', label: 'Service Trace' },
  { key: 'agent', label: 'Channel/Client' },
  { key: 'status', label: 'Audit Status' },
  { key: 'price', label: 'Settlement' },
  { key: 'actions', label: '', tdClass: 'text-right' },
]

const computedBookingStats = computed(() => [
  { label: 'Network Requests', value: '142', icon: TicketIcon, trend: 12 },
  { label: 'Awaiting Action', value: '28', icon: CalendarDaysIcon, trend: -5 },
  { label: 'Gross Settlement', value: '$82.4k', icon: BanknotesIcon, trend: 8.4 },
  { label: 'Confirm Rate', value: '94.2%', icon: ShieldCheckIcon, trend: 2.1 },
])

onMounted(() => {
  fetchBookings()
})

watch([selectedFilters, searchQuery, selectedDate], () => {
  fetchBookings({
    type: selectedFilters.value.type === 'All Services' ? undefined : selectedFilters.value.type,
    status: selectedFilters.value.status === 'All Status' ? undefined : selectedFilters.value.status,
    search: searchQuery.value,
    date: selectedDate.value
  })
}, { deep: true })

const serviceIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'stay':
    case 'hotel': return BuildingOfficeIcon
    case 'flight': return PaperAirplaneIcon
    case 'car': return TruckIcon
    default: return MapPinIcon
  }
}

const statusClass = (status: string) => {
  switch (status) {
    case 'Confirmed': return 'bg-brand-green/10 text-brand-green'
    case 'Pending': return 'bg-yellow-100 text-yellow-600'
    case 'Cancelled': return 'bg-gray-100 text-gray-500'
    case 'Failed': return 'bg-red-50 text-red-500'
    default: return 'bg-blue-50 text-blue-400'
  }
}

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const viewDetails = (booking: any) => {
  // Opening details modal or navigation
}

const handleCreateBooking = async () => {
  if (!newBooking.value.customer || !newBooking.value.amount) return
  const res = await createBooking(newBooking.value)
  if (res) {
    showNewBooking.value = false
    newBooking.value = { customer: '', email: '', type: 'Flight', date: '', amount: '' }
    await fetchBookings()
  }
}
</script>
