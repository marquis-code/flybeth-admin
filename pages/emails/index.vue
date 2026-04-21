<template>
  <div class="space-y-10">
    <!-- Documentation Note -->
    <div class="bg-brand-blue/5 border border-brand-blue/10 rounded-3xl p-6 mb-8 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="h-10 w-10 bg-white border border-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
          <InformationCircleIcon class="h-5 w-5" />
        </div>
        <div>
          <h4 class="text-base font-bold text-gray-900">Automation Protocol</h4>
          <p class="text-sm text-gray-500 font-medium tracking-tight mt-0.5">Templates support dynamic data injection using the double-brace <code class="text-brand-blue">{{ renderVariable('variable') }}</code> syntax.</p>
        </div>
      </div>
      <NuxtLink to="/emails/new" class="text-sm font-bold text-brand-blue hover:underline">View Syntax Guide</NuxtLink>
    </div>

    <!-- Header Section -->
    <div class="flex justify-between items-end">
      <div>
        <p class="text-sm   tracking-[0.4em] text-brand-green mb-2">Communication Hub</p>
        <h1 class="text-3xl text-gray-900 tracking-tighter">Email Templates</h1>
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

    <div v-else-if="templates.length === 0" class="bg-white rounded-[2.5rem] p-20 text-center border border-gray-100">
      <div class="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
        <EnvelopeIcon class="h-10 w-10 text-brand-gray/20" />
      </div>
      <h3 class="text-2xl   text-gray-900 mb-3">No Templates Found</h3>
      <p class="text-brand-gray/50 font-medium max-w-xs mx-auto mb-10">Get started by seeding the default branded templates or create your own from scratch.</p>
      <UiBaseButton variant="primary" size="lg" @click="handleSeed">Initialize Default System</UiBaseButton>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
       <div 
         v-for="template in templates" 
         :key="template._id"
         class="group bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:border-brand-blue/30 transition-premium cursor-pointer relative overflow-hidden"
         @click="navigateTo(`/emails/${template._id}`)">
          <!-- Branded Accent -->
          <div class="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-brand-blue/10 transition-premium" />
          
          <div class="relative z-10 flex flex-col h-full">
            <div class="mb-6">
              <div class="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-blue group-hover:text-white transition-premium">
                 <EnvelopeIcon class="h-6 w-6" />
              </div>
              <h3 class="text-xl   text-gray-900 group-hover:translate-x-1 transition-premium">{{ template.name }}</h3>
              <p class="text-sm   tracking-widest text-gray-500 mt-1">{{ template.slug }}</p>
            </div>

            <div class="space-y-4">
               <div>
                  <p class="text-sm  text-brand-gray  tracking-widest mb-1 opacity-40">Subject Line</p>
                  <p class="text-sm font-bold text-gray-900/80 line-clamp-1 ">"{{ template.subject }}"</p>
               </div>
               
               <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-for="v in template.availableVariables.slice(0, 3)" 
                    :key="v"
                    class="text-sm   tracking-wider px-2 py-1 bg-gray-50 text-gray-600 rounded-md"
                  >
                    {{ v }}
                  </span>
                  <span v-if="template.availableVariables.length > 3" class="text-sm  text-brand-gray/30 px-2 py-1 ">
                    +{{ template.availableVariables.length - 3 }} more
                  </span>
               </div>
            </div>

            <div class="mt-auto pt-8 flex items-center justify-between">
               <div class="flex items-center space-x-2">
                  <div class="h-2 w-2 rounded-full" :class="template.isActive ? 'bg-brand-green animate-pulse' : 'bg-red-400'" />
                  <span class="text-sm   tracking-widest" :class="template.isActive ? 'text-brand-green' : 'text-red-400'">
                    {{ template.isActive ? 'Active Protocol' : 'Disabled' }}
                  </span>
               </div>
               <ChevronRightIcon class="h-5 w-5 text-brand-gray/20 group-hover:text-gray-900 group-hover:translate-x-2 transition-premium" />
            </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotifications } from '@/composables/modules/notifications/useNotifications'
import { 
  PlusIcon, 
  SparklesIcon, 
  EnvelopeIcon,
  ChevronRightIcon,
  InformationCircleIcon 
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const { 
  templates, 
  loading, 
  seeding, 
  fetchTemplates, 
  seedTemplates 
} = useNotifications()

const renderVariable = (v: string) => `{{${v}}}`

const handleSeed = async () => {
  await seedTemplates()
}

onMounted(fetchTemplates)
</script>
