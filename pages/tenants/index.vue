<template>
  <div class="space-y-10 pb-12">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
       <div class="space-y-1">
         <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Agencies</h1>
         <p class="text-gray-600 font-medium text-sm">Review and manage all travel agency partners</p>
       </div>
       <UiBaseButton variant="primary" size="lg" @click="showAddAgent = true">
         <PlusIcon class="h-5 w-5 mr-2" />
         Add agency
       </UiBaseButton>
    </div>

    <!-- Filters & Search -->
     <!-- Filters & Search -->
<UiBaseCard padding class="!py-4 !overflow-visible" style="overflow: visible !important;">
  <div class="flex flex-col lg:flex-row gap-6 items-center" style="overflow: visible;">
    <div class="w-full lg:flex-grow max-w-2xl">
      <UiAnimatedInput 
        v-model="searchQuery" 
        label="Search partners"
      />
    </div>
    <div class="flex items-center space-x-6 w-full lg:w-auto" style="overflow: visible; position: relative; z-index: 50;">
      <div class="flex-grow min-w-[200px]" style="position: relative; z-index: 50;">
        <UiSelectInput
          v-model="statusFilter"
          label="Verification status"
          :options="statusOptions"
          class="w-full"
          :popper="{ strategy: 'fixed' }"
          attach="body"
        />
      </div>
      <div class="flex-grow min-w-[180px]" style="position: relative; z-index: 50;">
        <UiSelectInput
          v-model="sortBy"
          label="Recently active"
          :options="sortOptions"
          class="w-full"
          :popper="{ strategy: 'fixed' }"
          attach="body"
        />
      </div>
    </div>
  </div>
</UiBaseCard>
    <!-- <UiBaseCard padding class="!py-4">
      <div class="flex flex-col lg:flex-row gap-6 items-center">
        <div class="w-full lg:flex-grow max-w-2xl">
          <UiAnimatedInput 
            v-model="searchQuery" 
            label="Search partners"
          />
        </div>
        <div class="flex items-center space-x-6 w-full lg:w-auto">
          <div class="flex-grow min-w-[200px]">
            <UiSelectInput
              v-model="statusFilter"
              label="Verification status"
              :options="statusOptions"
              class="w-full"
            />
          </div>
          <div class="flex-grow min-w-[180px]">
            <UiSelectInput
              v-model="sortBy"
              label="Recently active"
              :options="sortOptions"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </UiBaseCard> -->

    <!-- Tenants Table -->
    <div v-if="loading && tenants.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
      <div class="h-10 w-10 border-4 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin"></div>
      <p class="mt-4 text-sm font-bold text-gray-900/40  tracking-widest">Loading agent records...</p>
    </div>

    <UiBaseTable 
      :columns="tenantColumns" 
      :items="tenants"
      :meta="meta"
      :loading="loading"
      empty-title="No partners found"
      empty-description="We couldn't find any agencies matching your current filters. Start by adding a new partner for vetting."
      @page-change="onPageChange"
      @update:limit="onLimitChange"
    >
      <template #cell(name)="{ item }">
        <div class="flex items-center space-x-4">
          <div class="h-10 w-10 rounded-xl bg-brand-blue/5 border border-brand-blue/5 flex items-center justify-center font-bold text-gray-900 transition-colors group-hover:bg-brand-blue group-hover:text-white">
            {{ item.name.split(' ').map((n: any) => n[0]).join('').substring(0, 2) }}
          </div>
          <div>
            <div class="text-sm font-bold text-gray-900 tracking-tight">{{ item.name }}</div>
            <div class="text-sm font-bold text-gray-500  tracking-widest">{{ item.email }}</div>
          </div>
        </div>
      </template>

      <template #cell(status)="{ item }">
        <span class="px-4 py-1.5 rounded-full text-sm font-bold  tracking-widest inline-block text-center min-w-[110px]" :class="statusClass(item.status)">
          {{ item.status }}
        </span>
      </template>

      <template #cell(revenue)="{ item }">
         <div class="flex flex-col">
           <span class="text-sm font-bold text-gray-900 tracking-tighter">${{ item.revenue || '0' }}</span>
           <span class="text-sm font-bold text-brand-gray/30  tracking-[0.1em]">{{ item.bookings || '0' }} bookings</span>
         </div>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex items-center justify-end space-x-2">
          <button @click="navigateTo(`/tenants/${item._id}`)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-colors hover:text-gray-900 hover:bg-brand-blue/5">
            <ArrowTopRightOnSquareIcon class="h-4 w-4" />
          </button>
          
          <button v-if="item.status === 'pending' || item.status === 'under_review'" @click="handleStatusUpdate(item._id, 'approved')" title="Approve" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-brand-green/60 transition-colors hover:text-brand-green hover:bg-brand-green/5">
            <CheckBadgeIcon class="h-4 w-4" />
          </button>
          <button v-if="item.status === 'pending' || item.status === 'under_review'" @click="handleStatusUpdate(item._id, 'rejected')" title="Reject" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-red-300 transition-colors hover:text-red-500 hover:bg-red-50">
            <NoSymbolIcon class="h-4 w-4" />
          </button>
          <button v-if="item.status === 'approved' || item.status === 'active'" @click="handleStatusUpdate(item._id, 'suspended')" title="Suspend" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-red-300 transition-colors hover:text-red-500 hover:bg-red-50">
            <NoSymbolIcon class="h-4 w-4" />
          </button>
        </div>
      </template>
    </UiBaseTable>

    <!-- Add Agent Side Drawer -->
    <UiSideDrawer 
      :show="showAddAgent" 
      title="Add new partner" 
      @close="showAddAgent = false"
    >
      <div class="space-y-8">
        <p class="text-sm text-gray-600 leading-relaxed font-medium">Initiate the vetting process for a new travel agency partner.</p>
        
        <div class="space-y-4">
          <UiAnimatedInput v-model="newAgent.name" label="Agency name" />
          <UiAnimatedInput v-model="newAgent.email" label="Owner email" type="email" />
          <UiAnimatedInput v-model="newAgent.slug" label="Portal code" />
          
          <div class="bg-gray-50/50 p-6 rounded-2xl border border-dashed border-gray-200 text-center transition-colors hover:border-brand-blue/30 group cursor-pointer">
             <CloudIcon class="h-8 w-8 mx-auto text-brand-gray/20 group-hover:text-gray-900/40" />
             <p class="text-sm font-bold text-gray-500  tracking-widest mt-2">Upload KYC documents</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-4 w-full">
          <UiBaseButton variant="ghost" class="flex-1" @click="showAddAgent = false">Dismiss</UiBaseButton>
          <UiBaseButton variant="primary" class="flex-1" :loading="loading" @click="handleAddAgent">Create account</UiBaseButton>
        </div>
      </template>
    </UiSideDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useTenants } from '@/composables/modules/tenants/useTenants'
import { 
  PlusIcon,
  CheckBadgeIcon,
  NoSymbolIcon,
  CloudIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'
import { useConfirmation } from '@/composables/core/useConfirmation'

definePageMeta({
  layout: 'admin'
})

const { tenants, meta, loading, fetchTenants, updateTenantStatus, createTenant } = useTenants()
const { confirm } = useConfirmation()

const showAddAgent = ref(false)
const searchQuery = ref('')
const statusFilter = ref('All Partners')
const sortBy = ref('Recently Joined')
const currentPage = ref(1)
const currentLimit = ref(20)

const fetchParams = computed(() => ({
  page: currentPage.value,
  limit: currentLimit.value,
  status: statusFilter.value === 'All Partners' ? undefined : statusFilter.value,
  search: searchQuery.value
}))

const loadTenants = async () => {
  await fetchTenants(fetchParams.value)
}

const onPageChange = (page: number) => {
  currentPage.value = page
  loadTenants()
}

const onLimitChange = (limit: number) => {
  currentLimit.value = limit
  currentPage.value = 1
  loadTenants()
}

const newAgent = ref({
  name: '',
  email: '',
  slug: ''
})

const statusOptions = ['All Partners', 'active', 'pending', 'under_review', 'approved', 'rejected', 'suspended']
const sortOptions = ['Newest First', 'Highest Yield', 'Most Volume']

const tenantColumns = [
  { key: 'name', label: 'Agency' },
  { key: 'status', label: 'Status' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'actions', label: '', tdClass: 'text-right' },
]

onMounted(() => {
  loadTenants()
})

watch([statusFilter, sortBy, searchQuery], () => {
  currentPage.value = 1
  loadTenants()
})

const statusClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-brand-green/10 text-brand-green'
    case 'approved': return 'bg-green-100 text-green-700'
    case 'pending': return 'bg-yellow-50 text-yellow-600'
    case 'under_review': return 'bg-blue-50 text-blue-600'
    case 'rejected': return 'bg-red-50 text-red-500'
    case 'suspended': return 'bg-gray-100 text-gray-400'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const handleStatusUpdate = async (id: string, status: string) => {
  const confirmed = await confirm({
    title: 'Update agency status',
    message: `Are you sure you want to change this agency status to ${status.toUpperCase()}? This will immediately affect their platform access.`,
    confirmText: `Confirm ${status}`,
    variant: status === 'rejected' || status === 'suspended' ? 'danger' : 'primary'
  })
  
  if (confirmed) {
    await updateTenantStatus(id, status)
    await loadTenants()
  }
}

const handleAddAgent = async () => {
  if (!newAgent.value.name || !newAgent.value.email) return
  const res = await createTenant(newAgent.value)
  if (res) {
    showAddAgent.value = false
    newAgent.value = { name: '', email: '', slug: '' }
    await loadTenants()
  }
}
</script>
