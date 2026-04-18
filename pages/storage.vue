<template>
  <div class="space-y-8">
    <!-- Header/Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <UiBaseCard padding>
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-blue-50 rounded-xl">
            <CloudIcon class="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p class="text-base font-medium text-gray-400">Total files</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-0.5">{{ files.length }}</h3>
          </div>
        </div>
      </UiBaseCard>
      
      <UiBaseCard padding>
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-emerald-50 rounded-xl">
            <DocumentIcon class="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p class="text-base font-medium text-gray-400">Total size</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-0.5">{{ formatFileSize(totalSize) }}</h3>
          </div>
        </div>
      </UiBaseCard>

      <UiBaseCard padding>
        <div @click="showUploadDrawer = true" class="h-full flex flex-col justify-center cursor-pointer group">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ArrowUpTrayIcon class="h-5 w-5" />
              </div>
              <span class="font-semibold text-gray-900">Upload new file</span>
            </div>
            <PlusIcon class="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </UiBaseCard>
    </div>

    <!-- Category Filter -->
    <div class="flex items-center gap-2">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="activeCategory = cat"
        class="px-4 py-2 rounded-lg text-base font-medium transition-all"
        :class="activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Files Table -->
    <UiBaseCard>
      <div class="p-1 min-w-full inline-block align-middle">
        <div class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-100">
            <thead>
              <tr class="bg-gray-50/50">
                <th scope="col" class="px-6 py-3.5 text-left text-base font-medium text-gray-400">Preview</th>
                <th scope="col" class="px-6 py-3.5 text-left text-base font-medium text-gray-400">Name</th>
                <th scope="col" class="px-6 py-3.5 text-left text-base font-medium text-gray-400">Category</th>
                <th scope="col" class="px-6 py-3.5 text-left text-base font-medium text-gray-400">Format</th>
                <th scope="col" class="px-6 py-3.5 text-left text-base font-medium text-gray-400">Size</th>
                <th scope="col" class="px-6 py-3.5 text-left text-base font-medium text-gray-400">Date</th>
                <th scope="col" class="px-6 py-3.5 text-right text-base font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="item in filteredFiles" :key="item.publicId" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                    <img v-if="item.resourceType === 'image'" :src="item.url" class="h-full w-full object-cover" />
                    <DocumentTextIcon v-else class="h-5 w-5 text-gray-400" />
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <span class="text-base font-semibold text-gray-900 truncate max-w-[200px]">{{ item.label || item.publicId }}</span>
                    <span v-if="item.label" class="text-sm text-gray-400 truncate max-w-[200px]">{{ item.publicId }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="item.category" class="px-2.5 py-1 text-base font-medium bg-blue-50 text-blue-700 rounded-md">{{ item.category }}</span>
                  <span v-else class="text-sm text-gray-400">—</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-base font-medium bg-gray-100 rounded text-gray-500">{{ item.format }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatFileSize(item.size) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   {{ new Date(item.createdAt).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end space-x-1">
                    <a :href="item.url" target="_blank" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <EyeIcon class="h-4 w-4" />
                    </a>
                    <button @click="onDelete(item.publicId)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!loading && filteredFiles.length === 0">
                <td colspan="7" class="px-6 py-12 text-center">
                   <div class="flex flex-col items-center">
                      <FolderOpenIcon class="h-10 w-10 text-gray-300 mb-3" />
                      <p class="text-sm text-gray-400 font-medium">No files found</p>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UiBaseCard>

    <!-- Upload Drawer -->
    <UiSideDrawer :show="showUploadDrawer" title="Upload file" @close="closeUploadDrawer">
      <div class="space-y-6">
        <p class="text-sm text-gray-500">Upload a new file to cloud storage. You can optionally give it a custom name and category for easier searching.</p>

        <!-- File Drop Zone -->
        <div 
          class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
          :class="uploadForm.file ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'"
          @click="triggerFileInput"
        >
          <input 
            type="file" 
            ref="fileInput" 
            class="hidden" 
            @change="onFileSelected"
          />
          <div v-if="uploadForm.file" class="flex flex-col items-center space-y-2">
            <div v-if="uploadForm.file.type.startsWith('image/')" class="h-32 w-32 rounded-xl border border-gray-100 overflow-hidden mb-2">
              <img :src="filePreview" class="h-full w-full object-cover" />
            </div>
            <DocumentTextIcon v-else class="h-10 w-10 text-blue-500" />
            <p class="text-base font-semibold text-gray-900">{{ uploadForm.file.name }}</p>
            <p class="text-sm text-gray-400">{{ formatFileSize(uploadForm.file.size) }}</p>
            <button @click.stop="removeSelectedFile" class="text-base font-medium text-red-500 hover:text-red-600">Remove</button>
          </div>
          <div v-else class="flex flex-col items-center space-y-2">
            <ArrowUpTrayIcon class="h-10 w-10 text-gray-300" />
            <p class="text-base font-medium text-gray-500">Click to select a file</p>
            <p class="text-sm text-gray-400">Max 25 MB · Images, PDFs, Documents</p>
          </div>
        </div>

        <!-- Optional Name -->
        <div class="space-y-1.5">
          <label class="text-base font-medium text-gray-700">File name <span class="text-gray-400">(optional)</span></label>
          <input 
            v-model="uploadForm.label" 
            type="text" 
            placeholder="e.g. Agent onboarding guide" 
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
          />
        </div>

        <!-- Category -->
        <div class="space-y-1.5">
          <label class="text-base font-medium text-gray-700">Category <span class="text-gray-400">(optional)</span></label>
          <select 
            v-model="uploadForm.category" 
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none appearance-none cursor-pointer"
          >
            <option value="">Select a category</option>
            <option value="Branding">Branding</option>
            <option value="Documents">Documents</option>
            <option value="Compliance">Compliance</option>
            <option value="Marketing">Marketing</option>
            <option value="Templates">Templates</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <!-- Folder -->
        <div class="space-y-1.5">
          <label class="text-base font-medium text-gray-700">Storage folder <span class="text-gray-400">(optional)</span></label>
          <input 
            v-model="uploadForm.folder" 
            type="text" 
            placeholder="e.g. branding, agents" 
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3 w-full">
          <UiBaseButton variant="ghost" class="flex-1" @click="closeUploadDrawer">Cancel</UiBaseButton>
          <UiBaseButton variant="primary" class="flex-1" :loading="uploading" :disabled="!uploadForm.file" @click="handleUpload">Upload file</UiBaseButton>
        </div>
      </template>
    </UiSideDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStorage } from '@/composables/modules/admin/useStorage'
import { useConfirmation } from '@/composables/core/useConfirmation'
import { 
  CloudIcon, 
  DocumentIcon, 
  PlusIcon, 
  ArrowUpTrayIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  FolderOpenIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const { files, loading, uploading, fetchFiles, uploadFile, deleteFile } = useStorage()
const { confirm } = useConfirmation()

const showUploadDrawer = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const activeCategory = ref('All')
const categories = ['All', 'Branding', 'Documents', 'Compliance', 'Marketing', 'Templates', 'Other']
const filePreview = ref('')

const uploadForm = ref<{
  file: File | null
  label: string
  category: string
  folder: string
}>({
  file: null,
  label: '',
  category: '',
  folder: 'general'
})

const totalSize = computed(() => {
  return files.value.reduce((acc: number, curr: any) => acc + (curr.size || 0), 0)
})

const filteredFiles = computed(() => {
  if (activeCategory.value === 'All') return files.value
  return files.value.filter((f: any) => f.category === activeCategory.value)
})

onMounted(() => {
  fetchFiles()
})

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.[0]) {
    const file = input.files[0]
    uploadForm.value.file = file
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      filePreview.value = URL.createObjectURL(file)
    }

    // Auto-fill the label from filename if empty
    if (!uploadForm.value.label) {
      uploadForm.value.label = file.name.replace(/\.[^/.]+$/, '')
    }
  }
}

const removeSelectedFile = () => {
    uploadForm.value.file = null
    if(filePreview.value) {
        URL.revokeObjectURL(filePreview.value)
        filePreview.value = ''
    }
}

const handleUpload = async () => {
  if (!uploadForm.value.file) return
  await uploadFile(uploadForm.value.file, uploadForm.value.folder || 'general', {
    label: uploadForm.value.label,
    category: uploadForm.value.category
  })
  closeUploadDrawer()
}

const closeUploadDrawer = () => {
  showUploadDrawer.value = false
  removeSelectedFile()
  uploadForm.value = { file: null, label: '', category: '', folder: 'general' }
  if (fileInput.value) fileInput.value.value = ''
}

const onDelete = async (publicId: string) => {
  const confirmed = await confirm({
    title: 'Delete file',
    message: 'Are you sure you want to permanently delete this file? This action cannot be undone.',
    confirmText: 'Delete',
    variant: 'danger'
  })

  if (confirmed) {
    await deleteFile(publicId)
  }
}
</script>
