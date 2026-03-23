<template>
  <div class="email-editor-container bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[700px]">
    <!-- Editor Header -->
    <div class="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
      <div>
        <h3 class="text-xl  font-black text-brand-blue">Template Designer</h3>
        <p class="text-sm font-black uppercase tracking-widest text-brand-gray/40">Visual Branded Email Architecture</p>
      </div>
      <div class="flex items-center gap-3">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Editor Main Area -->
      <div class="flex-1 p-8 flex flex-col overflow-hidden">
        <div class="mb-6 space-y-4">
          <div class="space-y-1">
            <label class="text-sm font-black uppercase tracking-[0.2em] text-brand-gray/50 ml-1">Email Subject Line</label>
            <input 
              v-model="localTemplate.subject" 
              type="text" 
              placeholder="e.g. Your flight to {{destination}} is confirmed!"
              class="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-brand-blue placeholder:text-brand-gray/30 focus:ring-4 focus:ring-brand-blue/5 transition-premium outline-none"
            />
          </div>
        </div>

        <div class="editor-wrapper flex-1 bg-gray-50 rounded-3xl overflow-hidden relative border border-gray-100 shadow-inner">
          <!-- Toolbar Container -->
          <div id="toolbar" class="border-b border-gray-100 bg-white px-4 py-2 flex flex-wrap gap-2">
            <select class="ql-header bg-white border-none text-xs font-bold text-brand-blue rounded-lg cursor-pointer">
              <option selected></option>
              <option value="1"></option>
              <option value="2"></option>
            </select>
            <button class="ql-bold"></button>
            <button class="ql-italic"></button>
            <button class="ql-underline"></button>
            <button class="ql-link"></button>
            <button class="ql-image"></button>
            <button class="ql-clean"></button>
          </div>
          <!-- Editor Content -->
          <div id="editor" class="h-[calc(100%-48px)] text-brand-blue overflow-y-auto prose max-w-none px-6 py-4"></div>
        </div>
      </div>

      <!-- Variables Sidebar -->
      <div class="w-72 bg-gray-50/50 border-l border-gray-50 p-6 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h4 class="text-xs font-black uppercase tracking-widest text-brand-blue mb-4">Merge Variables</h4>
          <p class="text-sm font-medium text-brand-gray/50 leading-relaxed mb-6">Click a variable to inject it at the current cursor position.</p>
          
          <div class="space-y-2">
            <button 
              v-for="v in (variables as string[])" 
              :key="v"
              @click="insertVariable(v)"
              class="w-full text-left px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-brand-blue hover:border-brand-blue hover:shadow-md transition-premium flex items-center justify-between group"
            >
              <span>{{ v }}</span>
              <PlusIcon class="h-4 w-4 text-brand-gray/30 group-hover:text-brand-blue" />
            </button>
          </div>
        </div>

        <div class="mt-auto pt-6 border-t border-gray-100">
          <div class="p-4 bg-brand-blue/5 rounded-2xl">
             <div class="flex items-center gap-2 mb-2 text-brand-blue">
                <InformationCircleIcon class="h-4 w-4" />
                <span class="text-sm font-bold uppercase tracking-widest">Syntax Tip</span>
             </div>
             <p class="text-sm text-brand-blue/60 font-medium leading-relaxed">
               Always surround variables with double braces like <strong v-pre>{{variable}}</strong> for correct parsing.
             </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { PlusIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  variables: {
    type: Array,
    default: () => ['firstName', 'lastName', 'pnr', 'destination', 'amount', 'currency', 'checkoutUrl', 'paymentUrl']
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
  quill = new (window as any).Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: '#toolbar'
    },
    placeholder: 'Design your branded email here...'
  })

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
