<template>
  <div class="email-editor-container bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col h-[700px] relative">
    <!-- Image Upload Overlay -->
    <div v-if="uploadingImage" class="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
      <div class="h-10 w-10 border-4 border-gray-100 border-t-brand-blue rounded-full animate-spin"></div>
      <p class="mt-4 text-sm font-bold text-gray-900">Uploading image payload...</p>
    </div>
    
    <!-- Hidden native file input for capturing block images -->
    <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleImageUpload" />
    <!-- Editor Header -->
    <div class="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
      <div>
        <h3 class="text-xl font-bold text-gray-900">Content editor</h3>
        <p class="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">Design your block content below</p>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Editor Main Area -->
      <div class="flex-1 p-8 flex flex-col overflow-hidden">
        <div class="editor-wrapper flex-1 bg-gray-50 rounded-3xl overflow-hidden relative border border-gray-100 shadow-none">
          <!-- Toolbar Container -->
          <div :id="`toolbar-${instanceId}`" class="border-b border-gray-100 bg-white px-4 py-2 flex flex-wrap gap-2">
            <select class="ql-header bg-white border-none text-sm font-bold text-gray-900 rounded-lg cursor-pointer">
              <option selected></option>
              <option value="1"></option>
              <option value="2"></option>
            </select>
            <button class="ql-bold"></button>
            <button class="ql-"></button>
            <button class="ql-underline"></button>
            <button class="ql-link"></button>
            <button v-if="!hideImageUpload" class="ql-image"></button>
            <button class="ql-clean"></button>
          </div>
          <!-- Editor Content -->
          <div :id="`editor-${instanceId}`" class="h-[calc(100%-48px)] text-gray-900 overflow-y-auto prose max-w-none px-6 py-4"></div>
        </div>
      </div>

      <!-- Variables Sidebar -->
      <div class="w-64 bg-gray-50/50 border-l border-gray-100 p-6 flex flex-col gap-6 overflow-y-auto">
        <div>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Click to add</p>
          <div class="space-y-2">
            <button 
              v-for="v in (variables as string[])" 
              :key="v"
              @click="insertVariable(v)"
              class="w-full text-left px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-900 hover:border-brand-blue hover:text-brand-blue transition-premium flex items-center justify-between group shadow-none"
            >
              <span>{{ v }}</span>
              <PlusIcon class="h-4 w-4 text-gray-500 group-hover:text-brand-blue" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { PlusIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import { adminApiFactory } from '@/api_factory/modules/admin'
import { useCustomToast } from '@/composables/core/useCustomToast'

const { showToast } = useCustomToast()
const fileInput = ref<HTMLInputElement | null>(null)
const uploadingImage = ref(false)
const instanceId = Math.random().toString(36).substr(2, 9)

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  variables: {
    type: Array,
    default: () => ['firstName', 'lastName', 'pnr', 'destination', 'amount', 'currency', 'checkoutUrl', 'paymentUrl']
  },
  hideImageUpload: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const localTemplate = ref({ ...props.modelValue })
let quill: any = null

onMounted(async () => {
  // Dynamically load Quill from CDN
  if (!(window as any).Quill) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js'
    document.head.appendChild(script)

    await new Promise(resolve => {
      script.onload = resolve
    })
  }

  // Initialize Quill 
  quill = new (window as any).Quill(`#editor-${instanceId}`, {
    theme: 'snow',
    modules: {
      toolbar: `#toolbar-${instanceId}`
    },
    placeholder: 'Write your content block here...'
  })

  // Override Image Handler if enabled
  if (!props.hideImageUpload) {
    quill.getModule('toolbar').addHandler('image', () => {
      fileInput.value?.click()
    })
  }

  // Set initial content
  if (localTemplate.value.htmlContent) {
    quill.root.innerHTML = localTemplate.value.htmlContent
  }

  // Listen for changes
  quill.on('text-change', () => {
    localTemplate.value.htmlContent = quill.root.innerHTML
    emit('update:modelValue', localTemplate.value)
  })
})

const insertVariable = (variable: string) => {
  if (!quill) return
  const range = quill.getSelection(true)
  quill.insertText(range.index, `{{${variable}}}`)
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  
  const file = input.files[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'campaign_images')
  
  uploadingImage.value = true
  try {
    const res = await adminApiFactory.uploadFile(formData)
    const url = res.data?.data?.url || res.data?.url
    if (url && quill) {
      const range = quill.getSelection(true) || { index: quill.getLength() }
      quill.insertEmbed(range.index, 'image', url)
      quill.setSelection(range.index + 1)
    }
  } catch (error) {
    showToast({ title: 'Upload failed', message: 'Could not upload image.', toastType: 'error' })
  } finally {
    uploadingImage.value = false
    input.value = ''
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal.htmlContent !== quill?.root.innerHTML) {
    localTemplate.value = { ...newVal }
    if (quill) quill.root.innerHTML = newVal.htmlContent || ''
  }
}, { deep: true })
</script>

<style>
.ql-toolbar.ql-snow {
  border-bottom: 1px solid #f3f4f6 !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
}

.ql-container.ql-snow {
  border: none !important;
}

.ql-editor {
  font-family: 'Roboto', sans-serif !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
}

.ql-snow .ql-stroke {
  stroke: #606062 !important;
}

.ql-snow .ql-fill {
  fill: #606062 !important;
}

.ql-snow.ql-toolbar button:hover .ql-stroke,
.ql-snow.ql-toolbar button:hover .ql-fill {
  stroke: #0D1DAD !important;
  fill: #0D1DAD !important;
}
</style>
