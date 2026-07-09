<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl  text-gray-900 ">Currency Management</h2>
        <p class="text-gray-500 font-bold uppercase  text-sm mt-1">Configure internal exchange rates and revenue margins</p>
      </div>
      <button @click="openAddModal" class="px-6 py-3 bg-primary text-white rounded-2xl  uppercase  flex items-center shadow-none shadow-primary/20 hover:scale-105 transition-all">
        <PlusIcon class="h-5 w-5 mr-2" />
        Add Currency
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-3xl border border-gray-200 shadow-none">
        <p class="text-gray-400 font-bold uppercase  text-xs mb-1">Total Currencies</p>
        <p class="text-3xl  text-gray-900">{{ currencies.length }}</p>
      </div>
      <div class="bg-white p-6 rounded-3xl border border-gray-200 shadow-none">
        <p class="text-gray-400 font-bold uppercase  text-xs mb-1">Active Rates</p>
        <p class="text-3xl  text-emerald-500">{{ currencies.filter(c => c.isActive).length }}</p>
      </div>
      <div class="bg-white p-6 rounded-3xl border border-gray-200 shadow-none">
        <p class="text-gray-400 font-bold uppercase  text-xs mb-1">Avg Margin</p>
        <p class="text-3xl  text-primary">{{ avgMargin.toFixed(1) }}%</p>
      </div>
    </div>

    <!-- Currency Table -->
    <div class="bg-white rounded-none border border-gray-200 overflow-hidden shadow-none">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="px-8 py-6 text-xs  text-gray-400 uppercase ">Currency</th>
            <th class="px-8 py-6 text-xs  text-gray-400 uppercase ">Market Rate (1 USD)</th>
            <th class="px-8 py-6 text-xs  text-gray-400 uppercase ">Margin %</th>
            <th class="px-8 py-6 text-xs  text-gray-400 uppercase ">Client Rate</th>
            <th class="px-8 py-6 text-xs  text-gray-400 uppercase ">Status</th>
            <th class="px-8 py-6 text-xs  text-gray-400 uppercase  text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="currency in currencies" :key="currency.code" class="hover:bg-gray-50/50 transition-colors group">
            <td class="px-8 py-6">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {{ currency.symbol }}
                </div>
                <div>
                  <p class="text-lg  text-gray-900 leading-tight">{{ currency.code }}</p>
                  <p class="text-sm font-bold text-gray-400 uppercase ">{{ currency.name }}</p>
                </div>
              </div>
            </td>
            <td class="px-8 py-6 font-bold text-gray-700">
              {{ currency.rateToBase.toLocaleString() }}
            </td>
            <td class="px-8 py-6">
              <span class="px-3 py-1 bg-primary/5 text-primary text-sm  rounded-full">+{{ currency.marginPercentage }}%</span>
            </td>
            <td class="px-8 py-6  text-gray-900">
              {{ (currency.rateToBase * (1 + currency.marginPercentage / 100)).toLocaleString() }}
            </td>
            <td class="px-8 py-6">
              <div @click="toggleStatus(currency)" class="w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300" :class="currency.isActive ? 'bg-emerald-500' : 'bg-gray-200'">
                <div class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300" :class="currency.isActive ? 'translate-x-6' : ''"></div>
              </div>
            </td>
            <td class="px-8 py-6 text-right">
              <button @click="openEditModal(currency)" class="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                <PencilSquareIcon class="h-6 w-6" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit/Add Modal -->
    <!-- Edit/Add Modal -->
    <UiSideDrawer 
      :show="isModalOpen" 
      :title="isEditing ? 'Edit Currency' : 'Add New Currency'" 
      subtitle="Configure internal exchange rates and revenue margins"
      size="md"
      @close="isModalOpen = false"
    >
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs  text-gray-400 uppercase  ml-1">Currency Code</label>
            <input v-model="form.code" :disabled="isEditing" placeholder="e.g. NGN" class="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-5  uppercase  focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50" />
          </div>
          <div class="space-y-2">
            <label class="text-xs  text-gray-400 uppercase  ml-1">Symbol</label>
            <input v-model="form.symbol" placeholder="e.g. ₦" class="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-5  focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-xs  text-gray-400 uppercase  ml-1">Currency Name</label>
          <input v-model="form.name" placeholder="e.g. Nigerian Naira" class="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-5  focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
        </div>
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs  text-gray-400 uppercase  ml-1">Market Rate (per 1 USD)</label>
            <input v-model.number="form.rateToBase" type="number" step="0.0001" class="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-5  focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          </div>
          <div class="space-y-2">
            <label class="text-xs  text-gray-400 uppercase  ml-1">Revenue Margin %</label>
            <input v-model.number="form.marginPercentage" type="number" step="0.1" class="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-5  focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-4 w-full">
          <UiBaseButton variant="ghost" class="flex-1 text-sm font-bold" @click="isModalOpen = false">Cancel</UiBaseButton>
          <UiBaseButton variant="primary" class="flex-1 text-sm font-bold shadow-none" @click="saveCurrency">
            {{ isEditing ? 'Update Configuration' : 'Create Currency' }}
          </UiBaseButton>
        </div>
      </template>
    </UiSideDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'
import { useCurrencies } from '@/composables/modules/settings/useCurrencies'

definePageMeta({
  layout: 'admin'
})

const { currencies, fetchCurrencies, updateCurrency, createCurrency } = useCurrencies()

const isModalOpen = ref(false)
const isEditing = ref(false)
const form = ref({
  code: '',
  name: '',
  symbol: '',
  rateToBase: 1,
  marginPercentage: 0,
  isActive: true
})

const avgMargin = computed(() => {
  if (currencies.value.length === 0) return 0
  const sum = currencies.value.reduce((acc, curr) => acc + curr.marginPercentage, 0)
  return sum / currencies.value.length
})

onMounted(() => {
  fetchCurrencies()
})

const openAddModal = () => {
  isEditing.value = false
  form.value = {
    code: '',
    name: '',
    symbol: '',
    rateToBase: 1,
    marginPercentage: 0,
    isActive: true
  }
  isModalOpen.value = true
}

const openEditModal = (currency: any) => {
  isEditing.value = true
  form.value = { ...currency }
  isModalOpen.value = true
}

const saveCurrency = async () => {
  try {
    if (isEditing.value) {
      await updateCurrency(form.value.code, form.value)
    } else {
      await createCurrency(form.value)
    }
    isModalOpen.value = false
  } catch (error) {
    alert('Failed to save currency configuration')
  }
}

const toggleStatus = async (currency: any) => {
  try {
    await updateCurrency(currency.code, { isActive: !currency.isActive })
  } catch (error) {
    alert('Failed to toggle status')
  }
}
</script>
