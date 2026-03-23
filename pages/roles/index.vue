<template>
  <div class="space-y-10 pb-12 text-brand-gray">
     <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
       <div class="space-y-1">
         <h1 class="text-4xl  font-black text-brand-blue tracking-tight">Access Control</h1>
         <p class="text-brand-gray/60 font-medium">Define and audit security tiers across the global infrastructure</p>
       </div>
       <UiBaseButton variant="primary" size="lg">
         <PlusIcon class="h-5 w-5 mr-3" />
         Create Security Role
       </UiBaseButton>
     </div>

     <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
       <UiBaseCard v-for="role in roles" :key="role.name" padding class="group hover:-translate-y-2 transition-premium">
         <template #header>
           <div class="flex items-center justify-between w-full">
             <h3 class="text-xl  font-black text-brand-blue">{{ role.name }}</h3>
             <span class="text-sm font-black text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
               {{ role.users }} Members
             </span>
           </div>
         </template>
         
         <p class="text-sm text-brand-gray/60 mb-8 font-medium leading-relaxed">{{ role.description }}</p>
         
         <div class="space-y-4 mb-10">
           <div v-for="perm in role.permissions" :key="perm" class="flex items-center text-xs font-black text-brand-blue/70 bg-gray-50/50 p-3 rounded-2xl border border-gray-100 group-hover:border-brand-blue/10 transition-premium">
             <CheckCircleIcon class="h-5 w-5 text-brand-green mr-3" />
             <span class="uppercase tracking-wider">{{ perm }}</span>
           </div>
         </div>

         <div class="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
           <UiBaseButton variant="secondary" size="sm" class="!px-6 !rounded-xl !text-sm font-black uppercase tracking-widest">
             Audit logs
           </UiBaseButton>
           <button class="text-brand-blue hover:text-brand-green font-black text-sm uppercase tracking-widest transition-premium">
             Update Policy
           </button>
         </div>
       </UiBaseCard>

       <!-- Create New Role Placeholder -->
       <button class="border-4 border-dashed border-gray-100 rounded-[3rem] p-10 flex flex-col items-center justify-center text-brand-gray/20 hover:border-brand-blue/20 hover:text-brand-blue/40 transition-premium group bg-white/50 hover:bg-white shadow-sm hover:shadow-2xl hover:shadow-brand-blue/5">
         <div class="h-16 w-16 rounded-3xl border-2 border-gray-100 flex items-center justify-center mb-6 group-hover:border-brand-blue transition-premium group-hover:rotate-12 bg-white">
           <PlusIcon class="h-8 w-8" />
         </div>
         <span class="text-xs font-black uppercase tracking-[0.3em] ">Architect New Role</span>
       </button>
     </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon, PlusIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const roles = [
  { 
    name: 'Super Admin', 
    users: 2, 
    description: 'Unrestricted master access. Complete governance over agents, finances, and platform security matrices.',
    permissions: ['Full Root Access', 'Financial Settlement', 'Tenant Sovereignty', 'Security Auditing']
  },
  { 
    name: 'Support Operations', 
    users: 15, 
    description: 'Tier-2 operational oversight. Capacity to manage inventory, refunds, and global passenger records.',
    permissions: ['Booking Escalation', 'User Dispute Resolver', 'Inventory Vetting', 'Refund Authority']
  },
  { 
    name: 'Financial Controller', 
    users: 4, 
    description: 'Economic ledger oversight. Specialized access to payout cycles, tax records, and revenue share auditing.',
    permissions: ['Revenue Oversight', 'Payout Execution', 'Tax Compliance', 'Ledger Integrity']
  }
]
</script>
