<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-brand-blue">Airline Commissions</h1>
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
            <span class="font-bold text-brand-blue">{{ item.airlineCode }}</span>
          </div>
        </template>
        <template #cell(value)="{ item }">
          <span v-if="item.type === 'percentage'" class="font-bold text-brand-blue">{{ item.value }}%</span>
          <span v-else class="font-bold text-brand-blue">${{ item.value }}</span>
        </template>
        <template #cell(isActive)="{ item }">
          <div class="flex items-center">
            <div :class="[
              'w-2 h-2 rounded-full mr-2',
              item.isActive ? 'bg-green-500' : 'bg-red-500'
            ]"></div>
            <span class="text-xs font-black uppercase tracking-widest" :class="[
              item.isActive ? 'text-green-600' : 'text-red-500'
            ]">
              {{ item.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </template>
        <template #cell(actions)="{ item }">
          <div class="flex space-x-3">
            <button @click="editCommission(item)" class="text-xs font-bold text-brand-blue hover:underline">
              Edit
            </button>
            <button @click="deleteCommission(item._id)" class="text-xs font-bold text-red-500 hover:underline">
              Delete
            </button>
          </div>
        </template>
      </UiBaseTable>
    </UiBaseCard>

    <!-- Add/Edit Modal -->
    <UiBaseModal v-if="showAddModal || editingItem" @close="resetForm">
      <div class="p-6 space-y-6">
        <h2 class="text-xl font-bold">{{ editingItem ? 'Edit' : 'Add' }} Commission</h2>
        
        <form @submit.prevent="saveCommission" class="space-y-4">
          <UiAnimatedInput 
            v-model="form.airlineCode"
            label="Airline Code (IATA)"
            placeholder="e.g. DL, BA"
            uppercase
            required
          />

          <div class="grid grid-cols-2 gap-4">
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

          <div class="flex justify-end space-x-3 pt-4">
            <UiBaseButton @click="resetForm" variant="secondary">Cancel</UiBaseButton>
            <UiBaseButton type="submit" variant="primary" :loading="saving">
              {{ editingItem ? 'Update' : 'Save' }}
            </UiBaseButton>
          </div>
        </form>
      </div>
    </UiBaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCustomToast } from '@/composables/core/useCustomToast'

const { showToast } = useCustomToast()
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
  if (!confirm('Are you sure you want to delete this commission?')) return
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
