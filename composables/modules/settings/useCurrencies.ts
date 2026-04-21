import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export const useCurrencies = () => {
  const { $api } = useApi()
  const currencies = ref([])
  const loading = ref(false)

  const fetchCurrencies = async () => {
    loading.value = true
    try {
      const res = await $api.get('/currency/admin/all')
      currencies.value = res.data
    } catch (error) {
      console.error('Failed to fetch currencies', error)
    } finally {
      loading.value = false
    }
  }

  const updateCurrency = async (code: string, data: any) => {
    try {
      await $api.patch(`/currency/admin/${code}`, data)
      await fetchCurrencies()
    } catch (error) {
      console.error('Failed to update currency', error)
      throw error
    }
  }

  const createCurrency = async (data: any) => {
    try {
      await $api.post('/currency/admin', data)
      await fetchCurrencies()
    } catch (error) {
      console.error('Failed to create currency', error)
      throw error
    }
  }

  return {
    currencies,
    loading,
    fetchCurrencies,
    updateCurrency,
    createCurrency
  }
}
