<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Airline Commissions</h1>
      <UiBaseButton @click="showAddModal = true" variant="primary">
        Add Commission
      </UiBaseButton>
    </div>

    <UiBaseCard class="!p-0 overflow-hidden">
      <UiBaseTable 
        :columns="headers" 
        :items="commissions" 
        :loading="loading"
      >
        <template #cell(airlineCode)="{ item }">
          <div class="flex items-center space-x-2">
            <span class="font-bold text-gray-900">{{ item.airlineCode }}</span>
          </div>
        </template>
        <template #cell(value)="{ item }">
          <span v-if="item.type === 'percentage'" class="font-bold text-gray-900">{{ item.value }}%</span>
          <span v-else class="font-bold text-gray-900">${{ item.value }}</span>
        </template>
        <template #cell(isActive)="{ item }">
          <div class="flex items-center">
            <div :class="[
              'w-2 h-2 rounded-full mr-2',
              item.isActive ? 'bg-green-500' : 'bg-red-500'
            ]"></div>
            <span class="text-sm   tracking-widest" :class="[
              item.isActive ? 'text-green-600' : 'text-red-500'
            ]">
              {{ item.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </template>
        <template #cell(actions)="{ item }">
          <div class="flex space-x-3">
            <button @click="editCommission(item)" class="text-sm font-bold text-gray-900 hover:underline">
              Edit
            </button>
            <button @click="deleteCommission(item._id)" class="text-sm font-bold text-red-500 hover:underline">
              Delete
            </button>
          </div>
        </template>
      </UiBaseTable>
    </UiBaseCard>

    <!-- Add/Edit Drawer -->
    <UiSideDrawer :show="showAddModal || !!editingItem" :title="editingItem ? 'Edit Commission' : 'Add Commission'" @close="resetForm">
      <div class="space-y-6">
        <p class="text-sm text-gray-600 leading-relaxed font-medium">Configure IATA-compliant commission overrides for prioritized global carriers.</p>
        
        <form @submit.prevent="saveCommission" class="space-y-6">
          <UiAnimatedInput 
            v-model="form.airlineCode"
            label="Airline Code (IATA)"
            placeholder="e.g. DL, BA"
            
            required
          />

          <div class="grid grid-cols-1 gap-6">
            <UiBaseSelect 
              v-model="form.type"
              label="Commission Type"
              :options="[
                { label: 'Fixed Amount', value: 'fixed' },
                { label: 'Percentage', value: 'percentage' }
              ]"
            />
            <UiAnimatedInput 
              v-model="form.value"
              label="Value"
              type="number"
              step="0.01"
              required
            />
          </div>

          <div class="flex gap-4 pt-6">
            <UiBaseButton @click="resetForm" variant="ghost" class="flex-1">Cancel</UiBaseButton>
            <UiBaseButton type="submit" variant="primary" :loading="saving" class="flex-1">
              {{ editingItem ? 'Update override' : 'Save override' }}
            </UiBaseButton>
          </div>
        </form>
      </div>
    </UiSideDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCustomToast } from '@/composables/core/useCustomToast'
import { useConfirmation } from '@/composables/core/useConfirmation'

definePageMeta({
  layout: 'admin'
})

const { showToast } = useCustomToast()
const { confirm } = useConfirmation()
const loading = ref(false)
const saving = ref(false)
const showAddModal = ref(false)
const commissions = ref([])
const editingItem = ref(null)

const headers = [
  { label: 'Airline', key: 'airlineCode' },
  { label: 'Type', key: 'type' },
  { label: 'Value', key: 'value' },
  { label: 'Status', key: 'isActive' },
  { label: 'Actions', key: 'actions' }
]

const form = ref({
  airlineCode: '',
  type: 'fixed',
  value: 0,
  isActive: true
})

const fetchCommissions = async () => {
  loading.value = true
  try {
    // In a real app, use a dedicated composable or api_factory
    const res = await (useNuxtApp().$axios as any).get('/admin/commissions')
    commissions.value = res.data
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to fetch commissions', toastType: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(fetchCommissions)

const saveCommission = async () => {
  saving.value = true
  try {
    await (useNuxtApp().$axios as any).post('/admin/commissions', form.value)
    showToast({ title: 'Success', message: 'Commission saved successfully', toastType: 'success' })
    fetchCommissions()
    resetForm()
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to save commission', toastType: 'error' })
  } finally {
    saving.value = false
  }
}

const deleteCommission = async (id: string) => {
  const confirmed = await confirm({
    title: 'Delete Commission',
    message: 'Are you sure you want to permanently delete this airline commission override? This will revert this carrier to the default platform rates.',
    confirmText: 'Delete Override',
    variant: 'danger'
  })
  if (!confirmed) return
  try {
    await (useNuxtApp().$axios as any).delete(`/admin/commissions/${id}`)
    showToast({ title: 'Deleted', message: 'Commission removed', toastType: 'success' })
    fetchCommissions()
  } catch (error) {
    showToast({ title: 'Error', message: 'Failed to delete', toastType: 'error' })
  }
}

const editCommission = (item: any) => {
  editingItem.value = item
  form.value = { ...item }
  showAddModal.value = true
}

const resetForm = () => {
  showAddModal.value = false
  editingItem.value = null
  form.value = {
    airlineCode: '',
    type: 'fixed',
    value: 0,
    isActive: true
  }
}
</script>
