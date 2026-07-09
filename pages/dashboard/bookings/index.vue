<template>
  <div class="space-y-10 pb-12">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
       <div class="space-y-1">
         <h1 class="text-2xl font-bold text-gray-900">Booking Records</h1>
         <p class="text-gray-600 font-medium text-sm">Monitor and oversee all travel transactions across the global network</p>
       </div>
       <div class="flex items-center gap-3">
         <div class="relative group">
           <UiBaseButton variant="outline" size="md">
             <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
             Export yield
           </UiBaseButton>
           <div class="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 z-[100] overflow-hidden">
             <button @click="exportAsCSV" class="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-brand-blue/5 hover:text-brand-blue transition-colors border-b border-gray-100">Export as CSV</button>
             <button @click="exportAsExcel" class="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-brand-blue/5 hover:text-brand-blue transition-colors">Export as Excel</button>
           </div>
         </div>
         <UiBaseButton variant="primary" size="lg" @click="showNewBooking = true">
           <PlusIcon class="h-5 w-5 mr-2" />
           Direct record
         </UiBaseButton>
       </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <UiBaseCard v-for="s in computedBookingStats" :key="s.label" padding class="group relative overflow-hidden transition-all duration-300">
        <div class="absolute right-0 top-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform">
          <component :is="s.icon" class="h-16 w-16 text-gray-900" />
        </div>
        <p class="text-sm font-bold text-gray-500 mb-1 leading-none">{{ s.label }}</p>
        <h4 class="font-bold text-gray-900 leading-none" :class="s.value?.length > 10 ? 'text-xl' : 'text-3xl'">{{ s.value }}</h4>
        <div v-if="s.trend" class="mt-4 flex items-center text-sm font-bold" :class="s.trend > 0 ? 'text-brand-green' : 'text-red-400'">
          <component :is="s.trend > 0 ? ArrowUpIcon : ArrowDownIcon" class="h-3 w-3 mr-1" /> {{ Math.abs(s.trend) }}% vs period
        </div>
      </UiBaseCard>
    </div>

    <!-- Filter & Search Bar -->
    <UiBaseCard padding overflow-visible class="!py-4 transition-all duration-300 relative z-20">
      <div class="flex flex-col lg:flex-row gap-6 items-center">
        <div class="w-full lg:flex-grow max-w-xl">
          <UiAnimatedInput 
            v-model="searchQuery" 
            label="Search records"
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
          <div class="flex-grow min-w-[200px]">
            <UiCustomDatePicker label="Select Date Range" v-model="selectedDate" mode="range" popoverPosition="right-0" />
          </div>
        </div>
      </div>
    </UiBaseCard>

    <!-- Table Section -->
    <div v-if="loading && bookings.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-200">
      <div class="h-10 w-10 border-4 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin"></div>
      <p class="mt-4 text-sm font-bold text-gray-900/40  ">Querying global ledger...</p>
    </div>

    <UiBaseTable 
      :columns="bookingColumns" 
      :items="bookings"
      :meta="meta"
      :loading="loading"
      show-checkbox
      empty-title="Archive empty"
      empty-description="No transactions found matching your audit criteria. Adjust filters or search terms."
      @page-change="onPageChange"
      @update:limit="onLimitChange"
    >
      <template #cell(reference)="{ item }">
        <div class="flex flex-col text-left">
          <span class="text-xs font-bold text-gray-500 uppercase">{{ item._id?.slice(-6) || 'N/A' }}</span>
          <span class="text-sm font-bold text-brand-green">{{ item.pnr || 'NO-PNR' }}</span>
        </div>
      </template>

      <template #cell(service)="{ item }">
        <div class="flex items-center space-x-4 text-left">
          <div class="h-9 w-9 rounded-xl bg-brand-blue/5 border border-brand-blue/5 flex items-center justify-center text-gray-900 group-hover:bg-brand-blue group-hover:text-white transition-colors">
            <component :is="serviceIcon(getServiceType(item))" class="h-4 w-4" />
          </div>
          <div>
            <div class="text-sm font-bold text-gray-900 line-clamp-1 flex items-center gap-2">
              {{ getServiceType(item) }}
              <span v-if="item.isBatchBooking" class="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full font-black border border-indigo-100">Batch</span>
            </div>
            <div class="text-xs font-bold text-gray-500">{{ formatDate(item.createdAt || item.bookedAt) }}</div>
          </div>
        </div>
      </template>

      <template #cell(agent)="{ item }">
        <div class="flex flex-col text-left">
          <div class="text-sm font-bold text-gray-900">{{ getAgentName(item) }}</div>
          <div class="flex items-center gap-2 mt-0.5">
            <div class="text-xs text-gray-500 font-bold">{{ item.contactDetails?.name || 'Unknown' }}</div>
            <span v-if="item.totalPassengers > 1" class="text-xs text-gray-400 font-bold">({{ item.totalPassengers }} pax)</span>
          </div>
        </div>
      </template>

      <template #cell(status)="{ item }">
        <span class="px-4 py-1.5 rounded-xl text-xs font-bold inline-block text-center min-w-[100px] border capitalize" :class="statusClass(item.status)">
          {{ item.status }}
        </span>
      </template>

      <template #cell(price)="{ item }">
        <span class="font-bold text-gray-900 text-sm">{{ formatCurrency(item.pricing?.totalAmount, item.pricing?.currency) }}</span>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex items-center justify-end space-x-2">
          <button @click="viewDetails(item)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-colors hover:text-gray-900 hover:bg-brand-blue/5">
            <EyeIcon class="h-4 w-4" />
          </button>
        </div>
      </template>
    </UiBaseTable>

    <!-- New Booking Side Drawer -->
    <UiSideDrawer 
      :show="showNewBooking" 
      title="Direct Ledger Entry" 
      subtitle="Manually record a booking for auditing and ledger reconciliation"
      size="full"
      @close="showNewBooking = false"
    >
      <div class="space-y-8">
        <p class="text-sm text-gray-600 leading-relaxed font-medium">Manually record a booking for auditing and ledger reconciliation.</p>
        
        <div class="space-y-4">
          <UiAnimatedInput v-model="newBooking.customer" label="Client name" />
          <UiAnimatedInput v-model="newBooking.email" label="Contact email" type="email" />
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-bold   text-gray-500 ml-1">Service category</label>
              <UiSelectInput
                v-model="newBooking.type"
                label=""
                :options="['Flight', 'Hotel', 'Car', 'Package']"
              />
            </div>
            <UiDatePicker label="Trace date" v-model="newBooking.date" />
          </div>

          <UiAnimatedInput v-model="newBooking.amount" label="Settlement amount ($)" />
        </div>
      </div>

      <template #footer>
        <div class="flex gap-4 w-full">
          <UiBaseButton variant="ghost" class="flex-1" @click="showNewBooking = false">Cancel</UiBaseButton>
          <UiBaseButton variant="primary" class="flex-1" :loading="loading" @click="handleCreateBooking">Submit entry</UiBaseButton>
        </div>
      </template>
    </UiSideDrawer>

    <!-- Booking Details Drawer -->
    <UiSideDrawer 
      :show="showDetailsDrawer" 
      title="Booking Details" 
      :subtitle="selectedBooking?.pnr ? `PNR: ${selectedBooking.pnr}` : 'Booking Record'"
      size="md"
      @close="showDetailsDrawer = false"
    >
      <div class="space-y-6" v-if="selectedBooking">
        
        <!-- Status & Dates -->
        <div class="flex justify-between items-start bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div>
            <p class="text-xs text-gray-500 font-bold mb-1">Status</p>
            <span class="px-3 py-1 rounded-lg text-xs font-bold border capitalize" :class="statusClass(selectedBooking.status)">
              {{ selectedBooking.status }}
            </span>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-500 font-bold mb-1">Booked On</p>
            <p class="text-sm font-bold text-gray-900">{{ formatDate(selectedBooking.createdAt) }}</p>
          </div>
        </div>

        <!-- Customer & Agent Info -->
        <div class="space-y-4">
          <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider">Contact & Agent</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p class="text-xs text-gray-500 font-bold mb-1">Customer</p>
              <p class="text-sm font-bold text-gray-900">{{ selectedBooking.contactDetails?.name || 'N/A' }}</p>
              <p class="text-xs text-gray-500 mt-1 truncate">{{ selectedBooking.contactDetails?.email }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ selectedBooking.contactDetails?.phone }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p class="text-xs text-gray-500 font-bold mb-1">Channel / Agent</p>
              <p class="text-sm font-bold text-gray-900">{{ getAgentName(selectedBooking) }}</p>
              <p class="text-xs text-gray-500 mt-1">ID: {{ selectedBooking.tenant || selectedBooking.user || 'Flybeth Web' }}</p>
            </div>
          </div>
        </div>

        <!-- Booking Services -->
        <div class="space-y-4">
          <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider">Services Booked</h4>
          <div v-if="selectedBooking.flights?.length" class="space-y-3">
            <div v-for="(flight, i) in selectedBooking.flights" :key="i" class="bg-brand-blue/5 p-4 rounded-2xl border border-brand-blue/10 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <PaperAirplaneIcon class="h-5 w-5 text-brand-blue" />
                <div>
                  <p class="text-sm font-bold text-gray-900 capitalize">{{ flight.class || 'Flight' }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">Offer ID: {{ flight.offerId?.slice(0, 15) }}...</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500 font-bold mb-1">Provider</p>
                <p class="text-sm font-bold text-gray-900 capitalize">{{ flight.provider }}</p>
              </div>
            </div>
          </div>
          <div v-if="!selectedBooking.flights?.length && !selectedBooking.stays?.length" class="text-sm text-gray-500">
            No specific service details available.
          </div>
        </div>

        <!-- Pricing Breakdown -->
        <div class="space-y-4">
          <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider">Pricing Breakdown</h4>
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500 font-medium">Base Fare</span>
              <span class="font-bold text-gray-900">{{ formatCurrency(selectedBooking.pricing?.baseFare, selectedBooking.pricing?.currency) }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500 font-medium">Taxes & Fees</span>
              <span class="font-bold text-gray-900">{{ formatCurrency((selectedBooking.pricing?.taxes || 0) + (selectedBooking.pricing?.fees || 0), selectedBooking.pricing?.currency) }}</span>
            </div>
            <div class="pt-3 border-t border-gray-200 flex justify-between items-center">
              <span class="text-sm font-bold text-gray-900">Total Settlement</span>
              <span class="text-lg font-black text-brand-blue">{{ formatCurrency(selectedBooking.pricing?.totalAmount, selectedBooking.pricing?.currency) }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col gap-3 w-full">
          <div class="flex gap-3 w-full" v-if="selectedBooking?.status === 'pending'">
            <UiBaseButton variant="outline" class="flex-1 !text-red-600 !border-red-200 hover:!bg-red-50" @click="handleCancelBooking(selectedBooking._id)">
              Cancel Booking
            </UiBaseButton>
            <UiBaseButton variant="primary" class="flex-1" @click="handlePayBooking(selectedBooking._id)">
              Mark as Paid
            </UiBaseButton>
          </div>
          <UiBaseButton variant="ghost" class="w-full" @click="showDetailsDrawer = false">Close</UiBaseButton>
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
import { useConfirmation } from '@/composables/core/useConfirmation'
import * as XLSX from 'xlsx'

definePageMeta({
  layout: 'admin'
})

const { bookings, loading, fetchBookings, meta, createBooking, cancelBooking, payBooking } = useBookings()
const { confirm } = useConfirmation()

const showNewBooking = ref(false)
const showDetailsDrawer = ref(false)
const selectedBooking = ref<any>(null)
const searchQuery = ref('')
const selectedDate = ref<any>(null)
const selectedFilters = ref<Record<string, string>>({
  type: 'All services',
  status: 'All status'
})
const currentPage = ref(1)
const currentLimit = ref(20)

const fetchParams = computed(() => {
  const params: any = {
    page: currentPage.value,
    limit: currentLimit.value,
    type: selectedFilters.value.type === 'All services' ? undefined : selectedFilters.value.type,
    status: selectedFilters.value.status === 'All status' ? undefined : selectedFilters.value.status,
    search: searchQuery.value,
  }

  if (selectedDate.value && typeof selectedDate.value === 'object') {
    if (selectedDate.value.start) params.startDate = new Date(selectedDate.value.start).toISOString()
    if (selectedDate.value.end) params.endDate = new Date(selectedDate.value.end).toISOString()
  } else if (selectedDate.value) {
    params.startDate = new Date(selectedDate.value).toISOString()
  }

  return params
})

const loadBookings = async () => {
  await fetchBookings(fetchParams.value)
}

const onPageChange = (page: number) => {
  currentPage.value = page
  loadBookings()
}

const onLimitChange = (limit: number) => {
  currentLimit.value = limit
  currentPage.value = 1
  loadBookings()
}

const newBooking = ref({
  customer: '',
  email: '',
  type: 'Flight',
  date: '',
  amount: ''
})

const bookingColumns = [
  { key: 'reference', label: 'Reference' },
  { key: 'service', label: 'Service Details' },
  { key: 'agent', label: 'Booking Source' },
  { key: 'status', label: 'Status' },
  { key: 'price', label: 'Total Revenue' },
  { key: 'actions', label: '', tdClass: 'text-right' },
]

const filters = ref([
  {
    label: 'Service Type',
    key: 'type',
    options: ['All services', 'Flight', 'Hotel', 'Car', 'Package', 'Cruise']
  },
  {
    label: 'Booking Status',
    key: 'status',
    options: ['All status', 'Pending', 'Confirmed', 'Ticketed', 'Failed', 'Cancelled']
  }
])

const computedBookingStats = computed(() => {
  const total = meta.value?.total || bookings.value.length || 0;
  const pending = bookings.value.filter((b: any) => b.status === 'Pending' || b.status === 'pending').length;
  const confirmed = bookings.value.filter((b: any) => b.status === 'Confirmed' || b.status === 'Ticketed' || b.status === 'ticketed' || b.status === 'success' || b.status === 'confirmed').length;
  const confirmRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
  
  const revenueByCurrency = bookings.value.reduce((map: Record<string, number>, b: any) => {
    const currency = b.pricing?.currency || b.currency || 'USD'
    const amt = Number(b.pricing?.totalAmount || b.revenue || b.amount) || 0
    map[currency] = (map[currency] || 0) + amt
    return map
  }, {})

  const formatRevenue = () => {
    const entries = Object.entries(revenueByCurrency)
    if (entries.length === 0) return '$0'
    return entries.map(([cur, val]) => formatCurrency(val as number, cur)).join(' • ')
  }

  return [
    { label: 'Total Bookings', value: total.toString(), icon: TicketIcon, trend: null },
    { label: 'Awaiting Action', value: pending.toString(), icon: CalendarDaysIcon, trend: null },
    { label: 'Total Revenue', value: formatRevenue(), icon: BanknotesIcon, trend: null },
    { label: 'Confirm Rate', value: `${confirmRate}%`, icon: ShieldCheckIcon, trend: null },
  ]
})

onMounted(() => {
  loadBookings()
})

watch([selectedFilters, searchQuery, selectedDate], () => {
  currentPage.value = 1
  loadBookings()
}, { deep: true })

const getServiceType = (item: any) => {
  if (item.flights?.length) return 'Flight'
  if (item.stays?.length) return 'Hotel'
  if (item.cars?.length) return 'Car'
  if (item.packages?.length) return 'Package'
  if (item.cruises?.length) return 'Cruise'
  return item.type || item.service || 'Service'
}

const getAgentName = (item: any) => {
  if (item.tenant) return 'Tenant Agent'
  if (item.user) return 'Agent'
  return 'Flybeth Web'
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  if (amount === undefined || amount === null) return 'N/A'
  const safeCurrency = currency || 'USD'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency
    }).format(amount)
  } catch (e) {
    return `${safeCurrency} ${amount}`
  }
}

const exportAsCSV = () => {
  if (!bookings.value.length) return
  const headers = ['Reference', 'PNR', 'Service', 'Booking Source', 'Status', 'Total Revenue', 'Currency', 'Booked At']
  const rows = bookings.value.map((b: any) => [
    b._id,
    b.pnr || 'N/A',
    getServiceType(b),
    getAgentName(b),
    b.status,
    b.pricing?.totalAmount || b.revenue || b.amount || 0,
    b.pricing?.currency || b.currency || 'USD',
    formatDate(b.createdAt || b.bookedAt)
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map((r: any) => r.join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `bookings_export_${new Date().getTime()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportAsExcel = () => {
  if (!bookings.value.length) return
  const data = bookings.value.map((b: any) => ({
    Reference: b._id,
    PNR: b.pnr || 'N/A',
    Service: getServiceType(b),
    'Booking Source': getAgentName(b),
    Status: b.status,
    'Total Revenue': b.pricing?.totalAmount || b.revenue || b.amount || 0,
    Currency: b.pricing?.currency || b.currency || 'USD',
    'Booked At': formatDate(b.createdAt || b.bookedAt)
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Bookings")
  XLSX.writeFile(wb, `bookings_export_${new Date().getTime()}.xlsx`)
}

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
  selectedBooking.value = booking
  showDetailsDrawer.value = true
}

const handleCancelBooking = async (id: string) => {
  const confirmed = await confirm({
    title: 'Cancel Booking',
    message: 'Are you sure you want to cancel this booking? This action may trigger refund policies.',
    confirmText: 'Yes, Cancel Booking',
    variant: 'danger'
  })
  if (!confirmed) return

  const res = await cancelBooking(id)
  if (res) {
    showDetailsDrawer.value = false
    await loadBookings()
  }
}

const handlePayBooking = async (id: string) => {
  const confirmed = await confirm({
    title: 'Mark as Paid',
    message: 'Confirm that payment has been received and you want to trigger ticketing?',
    confirmText: 'Confirm Payment',
    variant: 'primary'
  })
  if (!confirmed) return

  const res = await payBooking(id)
  if (res) {
    showDetailsDrawer.value = false
    await loadBookings()
  }
}

const handleCreateBooking = async () => {
  if (!newBooking.value.customer || !newBooking.value.amount) return
  
  const confirmed = await confirm({
    title: 'Manual record entry',
    message: 'Are you sure you want to manually inject this record into the global ledger? This action is tracked for audit compliance.',
    confirmText: 'Submit entry',
    variant: 'warning'
  })
  
  if (!confirmed) return

  const res = await createBooking(newBooking.value)
  if (res) {
    showNewBooking.value = false
    newBooking.value = { customer: '', email: '', type: 'Flight', date: '', amount: '' }
    await loadBookings()
  }
}
</script>
