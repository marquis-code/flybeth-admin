<template>
  <div class="space-y-4">
    <!-- Block Render Loop -->
    <div 
      v-for="(block, index) in localBlocks" 
      :key="block.id"
      class="relative p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-brand-blue/20 hover:shadow-md transition-all group"
    >
      <!-- Drag & Action Handles -->
      <div class="absolute right-4 top-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
          @click.prevent="moveBlock(index, -1)" 
          :disabled="index === 0"
          title="Move Up"
          class="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-white hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 shadow-sm border border-gray-100"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
        </button>
        <button 
          @click.prevent="moveBlock(index, 1)" 
          :disabled="index === localBlocks.length - 1"
          title="Move Down"
          class="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-white hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 shadow-sm border border-gray-100"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        <button 
          @click.prevent="removeBlock(block.id)"
          title="Delete Block"
          class="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors shadow-sm ml-2"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      <!-- Type Badge -->
      <div class="absolute -left-3 -top-3 bg-brand-blue text-white text-sm   tracking-widest px-3 py-1 rounded-full shadow-sm shadow-brand-blue/20">
        {{ block.type }} Block
      </div>

      <!-- Block Content: Text -->
      <div v-if="block.type === 'text'">
         <AdminEmailEditor 
           :modelValue="{ htmlContent: block.content }" 
           @update:modelValue="val => updateTextContent(block.id, val.htmlContent)"
           :hide-image-upload="true"
         />
      </div>

      <!-- Block Content: Image -->
      <div v-else-if="block.type === 'image'" class="mt-4">
        <div v-if="block.url" class="relative rounded-xl overflow-hidden group/img">
          <img :src="block.url" class="w-full max-w-2xl mx-auto rounded-xl object-contain" />
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
             <button @click.prevent="block.url = ''" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-xl transition-colors">
               Replace Image
             </button>
          </div>
        </div>
        <div v-else class="border-2 border-dashed border-brand-blue/30 bg-brand-blue/5 rounded-xl p-8 text-center cursor-pointer hover:bg-brand-blue/10 transition-colors" @click="triggerUpload(block.id)">
           <svg class="w-10 h-10 text-gray-900/40 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
           <p class="text-gray-900 font-bold">Upload an Image</p>
           <p class="text-gray-900/60 text-sm mt-1">Recommended width: 600px+</p>
        </div>
      </div>
    </div>

    <!-- Add Block Handlers -->
    <div class="flex items-center gap-4 py-6 border-t border-dashed border-gray-200 mt-6">
      <span class="text-sm   tracking-widest text-gray-500">Add New</span>
      <button @click.prevent="addBlock('text')" class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:border-brand-blue hover:text-gray-900 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        Text Block
      </button>
      <button @click.prevent="addBlock('image')" class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:border-brand-blue hover:text-gray-900 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        Image Block
      </button>
    </div>

    <!-- Hidden native file input for capturing block images -->
    <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileUpload" />
    <div v-if="uploading" class="fixed bottom-10 right-10 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center font-bold text-sm z-50">
      <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
      Uploading image payload...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AdminEmailEditor from './AdminEmailEditor.vue'
import { adminApiFactory } from '@/api_factory/modules/admin'
import { useCustomToast } from '@/composables/core/useCustomToast'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])
const { showToast } = useCustomToast()

interface Block {
  id: string;
  type: 'text' | 'image';
  content?: string;
  url?: string;
}

// State
const localBlocks = ref<Block[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const activeUploadBlockId = ref<string | null>(null)

// Initialize with a single text block if empty
if (!props.modelValue && localBlocks.value.length === 0) {
  localBlocks.value.push({ id: crypto.randomUUID(), type: 'text', content: '<p>Start editing your campaign here...</p>' })
} else if (localBlocks.value.length === 0) {
  // Try to parse existing single string block (backwards compatibility)
  localBlocks.value.push({ id: crypto.randomUUID(), type: 'text', content: props.modelValue })
}

const updateOutward = () => {
  // Compile the blocks into raw HTML
  const compiled = localBlocks.value.map(block => {
    if (block.type === 'text') {
      return block.content || ''
    } else if (block.type === 'image' && block.url) {
      return `<div style="text-align: center; margin: 20px 0;"><img src="${block.url}" style="max-width: 100%; border-radius: 8px;" alt="Campaign Element" /></div>`
    }
    return ''
  }).join('\n')
  
  emit('update:modelValue', compiled)
}

watch(localBlocks, () => {
  updateOutward()
}, { deep: true })

const addBlock = (type: 'text' | 'image') => {
  localBlocks.value.push({
    id: crypto.randomUUID(),
    type,
    content: type === 'text' ? '<p>Type here...</p>' : '',
    url: ''
  })
}

const removeBlock = (id: string) => {
  if (localBlocks.value.length === 1) {
    showToast({ title: 'Notice', message: 'You must have at least one block.', toastType: 'warning' })
    return
  }
  localBlocks.value = localBlocks.value.filter(b => b.id !== id)
}

const moveBlock = (index: number, direction: number) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= localBlocks.value.length) return
  
  const block = localBlocks.value[index]
  if (!block) return
  
  localBlocks.value.splice(index, 1)
  localBlocks.value.splice(newIndex, 0, block)
}

const updateTextContent = (id: string, content: string) => {
  const block = localBlocks.value.find(b => b.id === id)
  if (block) {
    block.content = content
  }
}

const triggerUpload = (blockId: string) => {
  activeUploadBlockId.value = blockId
  if (fileInput.value) {
    fileInput.value.value = ''
    fileInput.value.click()
  }
}

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  
  const file = input.files[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'campaign_blocks')
  
  uploading.value = true
  try {
    const res = await adminApiFactory.uploadFile(formData)
    // Robustly handle the nested response from Axios / useApi interceptors
    const extractedUrl = res.data?.data?.url || res.data?.url
    
    if (extractedUrl && activeUploadBlockId.value) {
      const block = localBlocks.value.find(b => b.id === activeUploadBlockId.value)
      if (block) {
        block.url = extractedUrl
      }
    } else {
      throw new Error("Could not parse image URL from payload.")
    }
  } catch (error: any) {
    console.error(error)
    showToast({ title: 'Error', message: 'Failed to upload image.', toastType: 'error' })
  } finally {
    uploading.value = false
    activeUploadBlockId.value = null
  }
}
</script>
