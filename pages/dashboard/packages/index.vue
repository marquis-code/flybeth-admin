<template>
  <div class="space-y-10 pb-12">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
       <div class="space-y-1">
         <h1 class="text-2xl font-bold text-gray-900">Package Management</h1>
         <p class="text-gray-600 font-medium text-sm">Curate and manage vacation packages and special deals</p>
       </div>
       <div class="flex items-center gap-3">
         <UiBaseButton variant="primary" size="lg" @click="openCreateModal">
           <PlusIcon class="h-5 w-5 mr-2" />
           Create Package
         </UiBaseButton>
       </div>
    </div>

    <!-- Table Section -->
    <UiBaseCard padding overflow-visible class="relative z-20">
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 bg-white">
        <div class="h-10 w-10 border-4 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin"></div>
        <p class="mt-4 text-sm font-bold text-gray-900/40">Loading packages...</p>
      </div>
      
      <div v-else>
        <table class="w-full text-left text-sm text-gray-500">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3">Package Name</th>
              <th scope="col" class="px-6 py-3">Destination</th>
              <th scope="col" class="px-6 py-3">Duration</th>
              <th scope="col" class="px-6 py-3">Price</th>
              <th scope="col" class="px-6 py-3">Status</th>
              <th scope="col" class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pkg in packages" :key="pkg._id" class="bg-white border-b hover:bg-gray-50">
              <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span v-if="pkg.isFeatured" class="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-bold">Featured</span>
                  {{ pkg.name }}
                </div>
              </td>
              <td class="px-6 py-4">{{ pkg.destination }}</td>
              <td class="px-6 py-4">{{ pkg.duration }} Nights</td>
              <td class="px-6 py-4">${{ pkg.totalPrice }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-bold" :class="pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                  {{ pkg.isActive ? 'Active' : 'Draft' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <button @click="editPackage(pkg)" class="font-medium text-brand-blue hover:underline">Edit</button>
              </td>
            </tr>
            <tr v-if="packages.length === 0">
              <td colspan="6" class="px-6 py-10 text-center text-gray-500">No packages found. Create one to get started.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiBaseCard>

    <!-- Create/Edit Modal -->
    <UiBaseModal :show="showCreateModal || !!editingPackage" :title="editingPackage ? 'Edit Package' : 'Create Package'" @close="closeModal" maxWidth="max-w-2xl" contentClass="p-4 sm:p-6">
      <div class="overflow-visible">
        
        <!-- Stepper Indicator -->
        <div class="flex items-center justify-between mb-8 mt-2 relative max-w-lg mx-auto">
          <div class="absolute left-0 top-5 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
          <div class="absolute left-0 top-5 -translate-y-1/2 h-1 bg-brand-blue rounded-full z-0 transition-all duration-300" :style="{ width: ((currentStep - 1) / 2) * 100 + '%' }"></div>
          
          <div v-for="step in 3" :key="step" class="relative z-10 flex flex-col items-center gap-2" style="width: 60px;">
             <div 
               class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 shadow-sm border-2"
               :class="currentStep >= step ? 'bg-brand-blue border-brand-blue text-white' : 'bg-white border-gray-200 text-gray-400'"
             >
               <CheckIcon v-if="currentStep > step" class="w-5 h-5 text-white" />
               <span v-else>{{ step }}</span>
             </div>
             <span class="text-xs font-bold whitespace-nowrap" :class="currentStep >= step ? 'text-brand-blue' : 'text-gray-400'">
               {{ step === 1 ? 'General' : step === 2 ? 'Pricing' : 'Media' }}
             </span>
          </div>
        </div>

        <div class="min-h-[300px]">
          <!-- Step 1: General Info -->
          <Transition name="fade" mode="out-in">
            <div v-if="currentStep === 1" class="space-y-6">
              <div class="border-b pb-2">
                <h2 class="text-lg font-bold text-gray-900">General Information</h2>
                <p class="text-xs text-gray-500">The primary details displayed to customers.</p>
              </div>
              
              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">Package Name <span class="text-red-500">*</span></label>
                  <input v-model="form.name" type="text" placeholder="e.g. Summer Getaway in Maldives" class="block w-full rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-brand-blue sm:text-sm p-3.5 bg-gray-50/50" required />
                </div>
                
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">Description <span class="text-red-500">*</span></label>
                  <textarea v-model="form.description" rows="3" placeholder="Describe what makes this package special..." class="block w-full rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-brand-blue sm:text-sm p-3.5 bg-gray-50/50" required></textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-5">
                  <div class="relative">
                    <label class="block text-sm font-bold text-gray-700 mb-1">Destination <span class="text-red-500">*</span></label>
                    <div class="relative w-full overflow-visible">
                       <UiLocationPicker 
                         v-model="form.destination" 
                         label="" 
                         placeholder="Select destination"
                         class="!min-h-0 w-full" 
                       />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Duration (Nights) <span class="text-red-500">*</span></label>
                    <input v-model="form.duration" type="number" min="1" placeholder="e.g. 5" class="block w-full rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-brand-blue sm:text-sm p-3.5 bg-gray-50/50" required />
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Pricing -->
            <div v-else-if="currentStep === 2" class="space-y-6">
              <div class="border-b pb-2">
                <h2 class="text-lg font-bold text-gray-900">Components & Pricing</h2>
                <p class="text-xs text-gray-500">Configure package type and pricing rules.</p>
              </div>
              
              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">Package Type <span class="text-red-500">*</span></label>
                  <select v-model="form.packageType" class="block w-full rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-brand-blue sm:text-sm p-3.5 bg-gray-50/50">
                    <option value="hotel+flight">Hotel + Flight</option>
                    <option value="hotel+flight+car">Hotel + Flight + Car</option>
                    <option value="flight+car">Flight + Car</option>
                    <option value="hotel+car">Hotel + Car</option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Base Price ($) <span class="text-red-500">*</span></label>
                    <input v-model="form.basePrice" type="number" min="0" step="0.01" class="block w-full rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-brand-blue sm:text-sm p-3.5 bg-gray-50/50" required />
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Discount (%)</label>
                    <input v-model="form.discountPercentage" type="number" min="0" max="100" class="block w-full rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-brand-blue sm:text-sm p-3.5 bg-gray-50/50" />
                  </div>
                </div>

                <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                  <span class="text-sm font-bold text-blue-900">Calculated Final Price:</span>
                  <span class="text-2xl font-black text-brand-blue">${{ calculatedTotalPrice.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Step 3: Media & Visibility -->
            <div v-else-if="currentStep === 3" class="space-y-6">
              <div class="border-b pb-2">
                <h2 class="text-lg font-bold text-gray-900">Highlights & Media</h2>
                <p class="text-xs text-gray-500">Configure inclusions, images, and publish status.</p>
              </div>
              
              <div class="space-y-6">
                <!-- Inclusions -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Package Inclusions</label>
                  <div class="space-y-2">
                    <div v-for="(inclusion, index) in form.inclusions" :key="index" class="flex items-center gap-2">
                      <input v-model="form.inclusions[index]" type="text" placeholder="e.g. Free Airport Transfer" class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm p-2.5 border bg-gray-50/50" />
                      <button @click="removeInclusion(index)" class="text-red-500 hover:bg-red-50 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Remove">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <button @click="addInclusion" class="text-sm font-bold text-brand-blue flex items-center gap-1 hover:underline mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Add Inclusion
                    </button>
                  </div>
                </div>

                <!-- Media -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Primary Image</label>
                  <div class="flex items-center gap-3">
                    <input v-model="form.images[0]" type="url" placeholder="https://..." class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm p-3 border bg-gray-50/50" />
                    <span class="text-xs font-bold text-gray-400">OR</span>
                    <div class="relative flex-shrink-0">
                      <input type="file" accept="image/*" @change="handleImageUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <UiBaseButton variant="outline" type="button" :loading="isUploadingImage">
                        {{ isUploadingImage ? 'Uploading...' : 'Upload Image' }}
                      </UiBaseButton>
                    </div>
                  </div>
                  <div v-if="form.images[0]" class="mt-3 aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 max-h-40">
                    <img :src="form.images[0]" alt="Preview" class="w-full h-full object-cover" />
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-5 pt-2">
                  <!-- Quality Rating -->
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Quality Rating (Stars)</label>
                    <div class="flex items-center gap-3 bg-gray-50/50 border rounded-xl p-3">
                      <input v-model="form.stars" type="range" min="1" max="5" step="1" class="w-full accent-brand-blue" />
                      <span class="text-sm font-black text-brand-blue w-6 text-center">{{ form.stars }}</span>
                    </div>
                  </div>

                  <!-- Visibility -->
                  <div class="flex flex-col justify-center gap-2">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <input v-model="form.isActive" type="checkbox" class="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue" />
                      <span class="text-sm font-bold text-gray-900">Active (Published)</span>
                    </label>

                    <label class="flex items-center gap-3 cursor-pointer">
                      <input v-model="form.isFeatured" type="checkbox" class="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue" />
                      <span class="text-sm font-bold text-gray-900">Featured Package</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="mt-10 flex justify-between gap-3 pt-5 border-t">
          <UiBaseButton variant="outline" @click="prevStep" :disabled="currentStep === 1">
            <span :class="currentStep === 1 ? 'opacity-50' : ''">Back</span>
          </UiBaseButton>
          <div class="flex gap-3">
            <UiBaseButton variant="outline" @click="closeModal" v-if="currentStep < 3">Cancel</UiBaseButton>
            <UiBaseButton v-if="currentStep < 3" variant="primary" @click="nextStep">Next Step</UiBaseButton>
            <UiBaseButton v-else variant="primary" @click="savePackage" :loading="saving">
              {{ editingPackage ? 'Update Package' : 'Save Package' }}
            </UiBaseButton>
          </div>
        </div>
      </div>
    </UiBaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { packagesApi } from '@/api_factory/modules/packages'
import { adminApiFactory } from '@/api_factory/modules/admin'
import { PlusIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { useCustomToast } from '@/composables/core/useCustomToast'
import UiLocationPicker from '@/components/ui/LocationPicker.vue'

definePageMeta({
  layout: 'admin'
})

const { showToast } = useCustomToast()

const packages = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showCreateModal = ref(false)
const editingPackage = ref<any>(null)
const isUploadingImage = ref(false)

const currentStep = ref(1)

const form = ref({
  name: '',
  description: '',
  destination: '',
  duration: 1,
  stars: 3,
  basePrice: 0,
  discountPercentage: 0,
  packageType: 'hotel+flight',
  isFeatured: false,
  isActive: true,
  images: ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800"],
  inclusions: ["Roundtrip Flights", "5-Star Hotel"]
})

const calculatedTotalPrice = computed(() => {
  const base = Number(form.value.basePrice) || 0;
  const discount = Number(form.value.discountPercentage) || 0;
  return base * (1 - (discount / 100));
})

const fetchPackages = async () => {
  loading.value = true
  try {
    const response = await packagesApi.getAll()
    packages.value = response.data?.data || []
  } catch (error) {
    console.error('Failed to fetch packages:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPackages()
})

const nextStep = () => {
  if (currentStep.value === 1) {
    if (!form.value.name || !form.value.description || !form.value.destination || !form.value.duration) {
      showToast({ title: 'Validation Error', message: 'Please fill in all required fields.', toastType: 'error' });
      return;
    }
  }
  if (currentStep.value === 2) {
    if (form.value.basePrice === null || form.value.basePrice === undefined || form.value.basePrice === '') {
      showToast({ title: 'Validation Error', message: 'Please set a base price.', toastType: 'error' });
      return;
    }
  }
  if (currentStep.value < 3) {
    currentStep.value++;
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

const openCreateModal = () => {
  showCreateModal.value = true;
  currentStep.value = 1;
}

const editPackage = (pkg: any) => {
  editingPackage.value = pkg
  form.value = { ...pkg }
  if (!form.value.images?.length) form.value.images = [""]
  if (!form.value.inclusions?.length) form.value.inclusions = [""]
  currentStep.value = 1;
}

const closeModal = () => {
  showCreateModal.value = false
  editingPackage.value = null
  currentStep.value = 1;
  form.value = {
    name: '',
    description: '',
    destination: '',
    duration: 1,
    stars: 3,
    basePrice: 0,
    discountPercentage: 0,
    packageType: 'hotel+flight',
    isFeatured: false,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800"],
    inclusions: ["Roundtrip Flights", "5-Star Hotel"]
  }
}

const addInclusion = () => {
  form.value.inclusions.push('')
}

const removeInclusion = (index: number) => {
  form.value.inclusions.splice(index, 1)
  if (form.value.inclusions.length === 0) {
    addInclusion()
  }
}

const handleImageUpload = async (event: any) => {
  const file = event.target.files[0]
  if (!file) return

  isUploadingImage.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await adminApiFactory.uploadFile(formData)
    const url = response.data?.url || response.data?.data?.url || response.data
    
    // In case the backend returns the URL as a string directly, or in an object
    const finalUrl = typeof url === 'string' ? url : url?.url
    
    if (finalUrl) {
      form.value.images[0] = finalUrl
      showToast({ title: 'Success', message: 'Image uploaded successfully', toastType: 'success' })
    } else if (response.data?.url) {
       form.value.images[0] = response.data.url
       showToast({ title: 'Success', message: 'Image uploaded successfully', toastType: 'success' })
    }
  } catch (error) {
    console.error('Upload failed:', error)
    showToast({ title: 'Error', message: 'Failed to upload image', toastType: 'error' })
  } finally {
    isUploadingImage.value = false
    event.target.value = ''
  }
}

const savePackage = async () => {
  saving.value = true
  
  const payload = {
    ...form.value,
    inclusions: form.value.inclusions.filter(inc => inc.trim() !== ''),
    totalPrice: calculatedTotalPrice.value
  };

  try {
    if (editingPackage.value) {
      await packagesApi.update(editingPackage.value._id, payload)
      showToast({ title: 'Success', message: 'Package updated successfully', toastType: 'success' });
    } else {
      await packagesApi.create(payload)
      showToast({ title: 'Success', message: 'Package created successfully', toastType: 'success' });
    }
    await fetchPackages()
    closeModal()
  } catch (error: any) {
    console.error('Failed to save package:', error)
    const msg = error.response?.data?.message || 'Failed to save package';
    showToast({ title: 'Error', message: msg, toastType: 'error' });
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
