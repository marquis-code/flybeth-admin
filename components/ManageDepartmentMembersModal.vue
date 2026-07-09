<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Manage Members</h3>
          <p class="text-sm text-gray-500">Assign team members to {{ department.name }}</p>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="p-4 border-b border-gray-100 bg-white">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search team members..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-2">
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>

        <div v-else-if="filteredAdmins.length === 0" class="text-center py-12">
          <p class="text-gray-500 text-sm">No team members found.</p>
        </div>

        <ul v-else class="space-y-1">
          <li v-for="admin in filteredAdmins" :key="admin._id" class="p-3 hover:bg-gray-50 rounded-lg flex items-center justify-between transition-colors">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <img v-if="admin.avatar" :src="admin.avatar" class="h-10 w-10 rounded-full object-cover border border-gray-200" />
                <div v-else class="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {{ admin.firstName?.charAt(0) }}{{ admin.lastName?.charAt(0) }}
                </div>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ admin.firstName }} {{ admin.lastName }}</p>
                <p class="text-xs text-gray-500">{{ admin.email }}</p>
              </div>
            </div>
            
            <button
              @click="toggleMember(admin)"
              :disabled="isToggling"
              :class="[
                isMember(admin._id)
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200',
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1 disabled:opacity-50'
              ]"
            >
              <span v-if="isMember(admin._id)">Remove</span>
              <span v-else>Add</span>
            </button>
          </li>
        </ul>
      </div>
      
      <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
        <button @click="$emit('close')" class="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors">
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { departmentApiFactory } from '@/api_factory/modules/department'
import { GATEWAY_ENDPOINT } from '@/api_factory/axios.config'
import { useCustomToast } from '@/composables/core/useCustomToast'

const props = defineProps({
  department: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])
const { showToast } = useCustomToast()

const loading = ref(true)
const isToggling = ref(false)
const admins = ref<any[]>([])
const searchQuery = ref('')
const currentMembers = ref<string[]>([])

onMounted(async () => {
  currentMembers.value = props.department.members?.map((m: any) => m._id || m) || []
  await fetchAdmins()
})

const fetchAdmins = async () => {
  try {
    const res = await GATEWAY_ENDPOINT.get('/admin/users')
    admins.value = res.data?.data || []
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to fetch users', toastType: 'error' })
  } finally {
    loading.value = false
  }
}

const isMember = (userId: string) => {
  return currentMembers.value.includes(userId)
}

const filteredAdmins = computed(() => {
  if (!searchQuery.value) return admins.value
  const query = searchQuery.value.toLowerCase()
  return admins.value.filter(a => 
    a.firstName?.toLowerCase().includes(query) || 
    a.lastName?.toLowerCase().includes(query) ||
    a.email?.toLowerCase().includes(query)
  )
})

const toggleMember = async (admin: any) => {
  isToggling.value = true
  try {
    const userId = admin._id
    if (isMember(userId)) {
      await departmentApiFactory.removeMember(props.department._id, userId)
      currentMembers.value = currentMembers.value.filter(id => id !== userId)
      showToast({ title: 'Success', message: 'Member removed', toastType: 'success' })
    } else {
      await departmentApiFactory.addMember(props.department._id, userId)
      currentMembers.value.push(userId)
      showToast({ title: 'Success', message: 'Member added', toastType: 'success' })
    }
    emit('updated')
  } catch (err: any) {
    showToast({ title: 'Error', message: err.message || 'Action failed', toastType: 'error' })
  } finally {
    isToggling.value = false
  }
}
</script>
