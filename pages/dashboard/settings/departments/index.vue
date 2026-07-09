<template>
  <main class="flex-1 overflow-y-auto bg-gray-50 p-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Departments</h1>
          <p class="text-sm text-gray-500 mt-1">Manage support departments and their assigned team members.</p>
        </div>
        <button @click="openCreateModal" class="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Department</span>
        </button>
      </div>

      <!-- Departments Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Members</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex justify-center mb-2">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                  Loading departments...
                </td>
              </tr>
              <tr v-else-if="departments.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  No departments found. Create one to get started.
                </td>
              </tr>
              <tr v-for="dept in departments" :key="dept._id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ dept.name }}</div>
                  <div class="text-xs text-gray-500 truncate max-w-[200px]">{{ dept.description || 'No description' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {{ dept.slug }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex -space-x-2 overflow-hidden items-center">
                    <template v-if="dept.members?.length > 0">
                      <div v-for="(member, i) in dept.members.slice(0, 3)" :key="i" class="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs" :title="member.firstName">
                        {{ member.avatar ? '' : (member.firstName?.charAt(0) || '') }}
                        <img v-if="member.avatar" :src="member.avatar" class="h-8 w-8 rounded-full object-cover" />
                      </div>
                      <div v-if="dept.members.length > 3" class="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                        +{{ dept.members.length - 3 }}
                      </div>
                    </template>
                    <span v-else class="text-sm text-gray-500">No members</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full']">
                    {{ dept.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="openManageMembers(dept)" class="text-indigo-600 hover:text-indigo-900 mr-4">Members</button>
                  <button @click="deleteDepartment(dept._id)" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Department Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">Create Department</h3>
        </div>
        <form @submit.prevent="submitCreate">
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
              <input v-model="form.name" required @input="autoGenerateSlug" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Flight Bookings">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Slug (Unique ID)</label>
              <input v-model="form.slug" required type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" placeholder="e.g. flight_bookings">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" placeholder="Optional details..."></textarea>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" :disabled="isSubmitting" class="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {{ isSubmitting ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Manage Members Modal -->
    <ManageDepartmentMembersModal 
      v-if="selectedDepartment"
      :department="selectedDepartment"
      @close="selectedDepartment = null"
      @updated="fetchDepartments"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { departmentApiFactory } from '@/api_factory/modules/department'
import { useCustomToast } from '@/composables/core/useCustomToast'
import ManageDepartmentMembersModal from '@/components/ManageDepartmentMembersModal.vue'

const { showToast } = useCustomToast()
const loading = ref(true)
const departments = ref<any[]>([])

const showCreateModal = ref(false)
const isSubmitting = ref(false)
const form = ref({ name: '', slug: '', description: '' })

const selectedDepartment = ref<any>(null)

definePageMeta({
  layout: 'admin'
})

onMounted(() => {
  fetchDepartments()
})

const fetchDepartments = async () => {
  loading.value = true
  try {
    const res = await departmentApiFactory.getDepartments()
    departments.value = res.data?.data || []
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to load departments', toastType: 'error' })
  } finally {
    loading.value = false
  }
}

const autoGenerateSlug = () => {
  if (!form.value.name) {
    form.value.slug = ''
    return
  }
  form.value.slug = form.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '')
}

const openCreateModal = () => {
  form.value = { name: '', slug: '', description: '' }
  showCreateModal.value = true
}

const submitCreate = async () => {
  isSubmitting.value = true
  try {
    await departmentApiFactory.createDepartment(form.value)
    showToast({ title: 'Success', message: 'Department created', toastType: 'success' })
    showCreateModal.value = false
    await fetchDepartments()
  } catch (err: any) {
    showToast({ title: 'Error', message: err.response?.data?.message || err.message || 'Creation failed', toastType: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

const deleteDepartment = async (id: string) => {
  if (!confirm('Are you sure you want to delete this department?')) return
  try {
    await departmentApiFactory.deleteDepartment(id)
    showToast({ title: 'Success', message: 'Department deleted', toastType: 'success' })
    await fetchDepartments()
  } catch (err: any) {
    showToast({ title: 'Error', message: 'Deletion failed', toastType: 'error' })
  }
}

const openManageMembers = (dept: any) => {
  selectedDepartment.value = dept
}
</script>
