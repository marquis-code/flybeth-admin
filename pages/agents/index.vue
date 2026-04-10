<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Agent network</h1>
        <p class="text-sm text-gray-400">Manage partnerships, verification, and performance.</p>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <UiBaseCard v-for="stat in stats" :key="stat.label" padding>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-gray-400 mb-1">{{ stat.label }}</p>
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
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray/30" />
          <input 
            v-model="search" 
            type="text" 
            placeholder="Search agencies, names or emails..." 
            class="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-sm"
          >
        </div>
        <div class="flex gap-4">
          <select v-model="statusFilter" class="px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl outline-none font-medium text-sm text-gray-600 focus:border-blue-300">
            <option value="">All statuses</option>
            <option v-for="status in agentStatuses" :key="status" :value="status">{{ status }}</option>
          </select>
          <select v-model="tierFilter" class="px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl outline-none font-medium text-sm text-gray-600 focus:border-blue-300">
            <option value="">All tiers</option>
            <option v-for="tier in agentTiers" :key="tier" :value="tier">{{ tier }}</option>
          </select>
        </div>
      </div>
    </UiBaseCard>

    <!-- Agents Table -->
    <UiBaseCard class="!p-0 overflow-hidden">
      <UiBaseTable :columns="columns" :items="agents" :loading="loading">
        <template #cell(agency)="{ item }">
          <div class="flex flex-col">
            <span class="font-semibold text-gray-900">{{ item.agentProfile?.agencyName || 'Personal' }}</span>
            <span class="text-xs text-gray-400">{{ item.agentProfile?.registrationNumber || 'N/A' }}</span>
          </div>
        </template>

        <template #cell(contact)="{ item }">
          <div class="flex flex-col">
            <span class="font-semibold text-gray-900 text-sm">{{ item.firstName }} {{ item.lastName }}</span>
            <span class="text-xs text-gray-400">{{ item.email }}</span>
          </div>
        </template>

        <template #cell(status)="{ item }">
          <div class="flex items-center">
            <div :class="['w-1.5 h-1.5 rounded-full mr-2', getStatusColor(item.agentStatus)]"></div>
            <span class="text-xs font-medium" :class="getStatusTextColor(item.agentStatus)">
              {{ item.agentStatus }}
            </span>
          </div>
        </template>

        <template #cell(tier)="{ item }">
          <span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
            {{ item.agentTier || 'basic' }}
          </span>
        </template>

        <template #cell(actions)="{ item }">
          <NuxtLink :to="`/agents/${item._id}`" class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors">
            Review
          </NuxtLink>
        </template>
      </UiBaseTable>
    </UiBaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useUsers } from '@/composables/modules/users/useUsers'
import { 
  UsersIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  MagnifyingGlassIcon 
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const { users: agents, fetchUsers, loading } = useUsers()
const search = ref('')
const statusFilter = ref('')
const tierFilter = ref('')

const agentStatuses = ['pending', 'under_review', 'approved', 'rejected', 'suspended']
const agentTiers = ['basic', 'verified', 'premium']

const columns = [
  { label: 'Agency / Reg No', key: 'agency' },
  { label: 'Primary Contact', key: 'contact' },
  { label: 'Location', key: 'agentProfile.country' },
  { label: 'Status', key: 'status' },
  { label: 'Tier', key: 'tier' },
  { label: 'Actions', key: 'actions' }
]

const stats = [
  { label: 'Total Agents', value: '124', icon: UsersIcon, bg: 'bg-brand-blue/5', color: 'text-brand-blue' },
  { label: 'Pending Review', value: '18', icon: ClockIcon, bg: 'bg-yellow-50', color: 'text-yellow-600' },
  { label: 'Verified Partners', value: '92', icon: CheckCircleIcon, bg: 'bg-green-50', color: 'text-green-600' },
  { label: 'Flagged / Suspended', value: '4', icon: ExclamationCircleIcon, bg: 'bg-red-50', color: 'text-red-600' }
]

const fetchAgents = async () => {
  const params: any = { search: search.value, role: 'agent' }
  if (statusFilter.value) params.status = statusFilter.value
  if (tierFilter.value) params.tier = tierFilter.value
  await fetchUsers(params)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-500'
    case 'pending': return 'bg-yellow-500'
    case 'under_review': return 'bg-blue-500'
    case 'rejected': return 'bg-red-500'
    case 'suspended': return 'bg-red-700'
    default: return 'bg-gray-400'
  }
}

const getStatusTextColor = (status: string) => {
  switch (status) {
    case 'approved': return 'text-green-600'
    case 'pending': return 'text-yellow-600'
    case 'under_review': return 'text-blue-600'
    case 'rejected': return 'text-red-600'
    case 'suspended': return 'text-red-800'
    default: return 'text-gray-500'
  }
}

onMounted(fetchAgents)
watch([search, statusFilter, tierFilter], fetchAgents)
</script>
