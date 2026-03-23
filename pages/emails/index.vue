<template>
  <div class="space-y-10">
    <!-- Header Section -->
    <div class="flex justify-between items-end">
      <div>
        <p class="text-sm font-black uppercase tracking-[0.4em] text-brand-green mb-2">Communication Hub</p>
        <h1 class="text-5xl  font-black text-brand-blue tracking-tighter">Email Templates</h1>
      </div>
      <div class="flex gap-4">
        <UiBaseButton variant="secondary" @click="handleSeed" :loading="seeding">
          <SparklesIcon class="h-4 w-4 mr-2" />
          Seed Defaults
        </UiBaseButton>
        <UiBaseButton variant="primary" @click="navigateTo('/emails/new')">
          <PlusIcon class="h-4 w-4 mr-2" />
          Create Template
        </UiBaseButton>
      </div>
    </div>

    <!-- Templates Grid -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
       <div v-for="i in 3" :key="i" class="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
    </div>

    <div v-else-if="templates.length === 0" class="bg-white rounded-[2.5rem] p-20 text-center border border-gray-100 shadow-sm">
      <div class="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
        <EnvelopeIcon class="h-10 w-10 text-brand-gray/20" />
      </div>
      <h3 class="text-2xl  font-black text-brand-blue mb-3">No Templates Found</h3>
      <p class="text-brand-gray/50 font-medium max-w-xs mx-auto mb-10">Get started by seeding the default branded templates or create your own from scratch.</p>
      <UiBaseButton variant="primary" size="lg" @click="handleSeed">Initialize Default System</UiBaseButton>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
       <div 
         v-for="template in templates" 
         :key="template._id"
         class="group bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-2xl hover:shadow-brand-blue/5 transition-premium cursor-pointer relative overflow-hidden"
         @click="navigateTo(`/emails/${template._id}`)"
       >
          <!-- Branded Accent -->
          <div class="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-brand-blue/10 transition-premium" />
          
          <div class="relative z-10 flex flex-col h-full">
            <div class="mb-6">
              <div class="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-blue group-hover:text-white transition-premium">
                 <EnvelopeIcon class="h-6 w-6" />
              </div>
              <h3 class="text-xl  font-black text-brand-blue group-hover:translate-x-1 transition-premium">{{ template.name }}</h3>
              <p class="text-sm font-black uppercase tracking-widest text-brand-gray/40 mt-1">{{ template.slug }}</p>
            </div>

            <div class="space-y-4">
               <div>
                  <p class="text-sm font-black text-brand-gray uppercase tracking-widest mb-1 opacity-40">Subject Line</p>
                  <p class="text-sm font-bold text-brand-blue/80 line-clamp-1 italic">"{{ template.subject }}"</p>
               </div>
               
               <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-for="v in template.availableVariables.slice(0, 3)" 
                    :key="v"
                    class="text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-gray-50 text-brand-gray/60 rounded-md"
                  >
                    {{ v }}
                  </span>
                  <span v-if="template.availableVariables.length > 3" class="text-[9px] font-black text-brand-gray/30 px-2 py-1 italic">
                    +{{ template.availableVariables.length - 3 }} more
                  </span>
               </div>
            </div>

            <div class="mt-auto pt-8 flex items-center justify-between">
               <div class="flex items-center space-x-2">
                  <div class="h-2 w-2 rounded-full" :class="template.isActive ? 'bg-brand-green animate-pulse' : 'bg-red-400'" />
                  <span class="text-sm font-black uppercase tracking-widest" :class="template.isActive ? 'text-brand-green' : 'text-red-400'">
                    {{ template.isActive ? 'Active Protocol' : 'Disabled' }}
                  </span>
               </div>
               <ChevronRightIcon class="h-5 w-5 text-brand-gray/20 group-hover:text-brand-blue group-hover:translate-x-2 transition-premium" />
            </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { 
  PlusIcon, 
  SparklesIcon, 
  EnvelopeIcon,
  ChevronRightIcon 
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const { get, post } = useApi()
const templates = ref<any[]>([])
const loading = ref(true)
const seeding = ref(false)

const fetchTemplates = async () => {
  loading.value = true
  const { data, error } = await get('/notifications/templates')
  if (data && Array.isArray(data)) templates.value = data
  loading.value = false
}

const handleSeed = async () => {
  seeding.value = true
  await post('/notifications/templates/seed')
  await fetchTemplates()
  seeding.value = false
}

onMounted(fetchTemplates)
</script>
