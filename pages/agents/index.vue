<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Agents</h1>
        <p class="text-sm text-gray-400">Manage partnerships, verification, and agent tiering.</p>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <UiBaseCard v-for="stat in computedStats" :key="stat.label" padding>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-base font-medium text-gray-400 mb-1">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          </div>
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', stat.bg]">
            <component :is="stat.icon" class="w-5 h-5" :class="stat.color" />
          </div>
        </div>
      </UiBaseCard>
    </div>

    <!-- Filters & Search -->
    <UiBaseCard padding class="!p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            v-model="search" 
            type="text" 
            placeholder="Search agencies, names or emails..." 
            class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-medium text-sm"
          >
        </div>
        <div class="flex gap-4">
          <select v-model="statusFilter" class="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-medium text-sm text-gray-600 focus:border-blue-600">
            <option value="">All statuses</option>
            <option v-for="status in agentStatuses" :key="status" :value="status">{{ status }}</option>
          </select>
          <select v-model="tierFilter" class="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-medium text-sm text-gray-600 focus:border-blue-600">
            <option value="">All tiers</option>
            <option v-for="tier in agentTiers" :key="tier" :value="tier">{{ tier }}</option>
          </select>
        </div>
      </div>
    </UiBaseCard>

    <!-- Agents Table -->
    <UiBaseCard class="!p-0 overflow-hidden">
      <UiBaseTable 
        :columns="columns" 
        :items="agents" 
        :meta="meta"
        :loading="loading"
        @page-change="onPageChange"
        @update:limit="onLimitChange"
      >
        <template #cell(agency)="{ item }">
          <div class="flex flex-col">
            <span class="font-semibold text-gray-900">{{ item.agencyName || item.agentProfile?.agencyName || 'Independent' }}</span>
            <span class="text-sm text-gray-400">{{ item.agentProfile?.registrationNumber || 'N/A' }}</span>
          </div>
        </template>

        <template #cell(contact)="{ item }">
          <div class="flex flex-col">
            <span class="font-semibold text-gray-900 text-sm">{{ item.firstName }} {{ item.lastName }}</span>
            <span class="text-sm text-gray-400">{{ item.email }}</span>
          </div>
        </template>

        <template #cell(phone)="{ item }">
          <span class="text-sm text-gray-600">{{ item.phone || item.agentProfile?.whatsappNumber || 'N/A' }}</span>
        </template>

        <template #cell(status)="{ item }">
          <span class="px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider" :class="getStatusBadgeClass(item.agentStatus)">
            {{ item.agentStatus }}
          </span>
        </template>

        <template #cell(tier)="{ item }">
          <span class="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-bold uppercase rounded-full">
            {{ item.agentTier || 'basic' }}
          </span>
        </template>

        <template #cell(joined)="{ item }">
          <span class="text-sm text-gray-500">{{ new Date(item.createdAt).toLocaleDateString() }}</span>
        </template>

        <template #cell(actions)="{ item }">
          <div class="flex justify-end pr-2">
            <NuxtLink :to="`/agents/${item._id}`" class="h-8 w-8 flex items-center justify-center bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-400 rounded-lg transition-all">
              <EyeIcon class="h-4 w-4" />
            </NuxtLink>
          </div>
        </template>
      </UiBaseTable>
    </UiBaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUsers } from '@/composables/modules/users/useUsers'
import { 
  UsersIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon 
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const { users: agents, meta, fetchUsers, loading } = useUsers()
const search = ref('')
const statusFilter = ref('')
const tierFilter = ref('')
const currentPage = ref(1)
const currentLimit = ref(20)

const agentStatuses = ['pending', 'under_review', 'approved', 'rejected', 'suspended']
const agentTiers = ['basic', 'verified', 'premium']

const columns = [
  { label: 'Agency', key: 'agency' },
  { label: 'Primary Contact', key: 'contact' },
  { label: 'Phone', key: 'phone' },
  { label: 'Tier', key: 'tier' },
  { label: 'Status', key: 'status' },
  { label: 'Joined', key: 'joined' },
  { label: '', key: 'actions', tdClass: 'text-right' }
]

const computedStats = computed(() => {
  const total = meta.value?.total || agents.value.length
  const pending = agents.value.filter(a => a.agentStatus === 'pending').length
  const approved = agents.value.filter(a => a.agentStatus === 'approved').length
  const flagged = agents.value.filter(a => ['rejected', 'suspended'].includes(a.agentStatus)).length
  return [
    { label: 'Total agents', value: total.toString(), icon: UsersIcon, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Pending review', value: pending.toString(), icon: ClockIcon, bg: 'bg-yellow-50', color: 'text-yellow-600' },
    { label: 'Verified partners', value: approved.toString(), icon: CheckCircleIcon, bg: 'bg-green-50', color: 'text-green-600' },
    { label: 'Flagged / Suspended', value: flagged.toString(), icon: ExclamationCircleIcon, bg: 'bg-red-50', color: 'text-red-600' }
  ]
})

const fetchAgents = async () => {
  const params: any = { 
    search: search.value, 
    role: 'agent',
    page: currentPage.value,
    limit: currentLimit.value
  }
  if (statusFilter.value) params.status = statusFilter.value
  if (tierFilter.value) params.tier = tierFilter.value
  await fetchUsers(params)
}

const onPageChange = (page: number) => {
  currentPage.value = page
  fetchAgents()
}

const onLimitChange = (limit: number) => {
  currentLimit.value = limit
  currentPage.value = 1
  fetchAgents()
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-emerald-50 text-emerald-700'
    case 'pending': return 'bg-yellow-50 text-yellow-700'
    case 'under_review': return 'bg-blue-50 text-blue-700'
    case 'rejected': return 'bg-red-50 text-red-700'
    case 'suspended': return 'bg-gray-100 text-gray-700'
    default: return 'bg-gray-50 text-gray-500'
  }
}

onMounted(fetchAgents)

// Reset to page 1 when filters change
watch([search, statusFilter, tierFilter], () => {
  currentPage.value = 1
  fetchAgents()
})
</script>
