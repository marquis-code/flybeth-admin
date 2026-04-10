<template>
  <div class="space-y-10 pb-12 text-brand-gray/80 font-medium">
     <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
       <div class="space-y-1">
         <h1 class="text-4xl font-bold text-brand-blue tracking-tight">Security roles</h1>
         <p class="text-brand-gray/60 font-medium">Define and audit security tiers across the global infrastructure</p>
       </div>
       <UiBaseButton variant="primary" size="lg" @click="showCreateModal = true">
         <PlusIcon class="h-5 w-5 mr-3" />
         Architect new role
       </UiBaseButton>
     </div>

     <!-- Roles Table -->
     <UiBaseTable 
       :columns="roleColumns" 
       :items="roles"
       show-checkbox
     >
       <template #cell(name)="{ item }">
         <div class="flex flex-col text-left">
           <span class="text-sm font-bold text-brand-blue tracking-tight">{{ item.name }}</span>
           <span class="text-[10px] font-bold text-brand-gray/30 uppercase tracking-[0.2em] mt-0.5">Role tier: {{ item.tier }}</span>
         </div>
       </template>

       <template #cell(permissions)="{ item }">
         <div class="flex flex-wrap gap-2 max-w-md">
           <span 
             v-for="perm in item.permissions" 
             :key="perm" 
             class="text-[9px] font-bold text-brand-blue uppercase tracking-widest bg-brand-blue/5 px-3 py-1 rounded-lg border border-brand-blue/10"
           >
             {{ perm }}
           </span>
         </div>
       </template>

       <template #cell(users)="{ item }">
         <div class="flex -space-x-3">
           <div v-for="i in Math.min(item.users, 3)" :key="i" class="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-brand-blue">
             {{ String.fromCharCode(64 + i) }}
           </div>
           <div v-if="item.users > 3" class="h-8 w-8 rounded-full bg-brand-green/20 border-2 border-white flex items-center justify-center text-[10px] font-bold text-brand-green">
             +{{ item.users - 3 }}
           </div>
           <div v-if="item.users === 0" class="text-xs text-brand-gray/30 font-bold uppercase tracking-widest self-center ml-2">Empty</div>
         </div>
       </template>

       <template #cell(actions)="{ item }">
         <div class="flex items-center justify-end space-x-2">
           <button @click="handleAudit(item)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-brand-gray/40 transition-colors hover:text-brand-blue hover:bg-brand-blue/5" title="Audit logs">
             <ShieldCheckIcon class="h-4 w-4" />
           </button>
           <button @click="handleEdit(item)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-brand-gray/40 transition-colors hover:text-brand-blue hover:bg-brand-blue/5" title="Update policy">
             <PencilSquareIcon class="h-4 w-4" />
           </button>
         </div>
       </template>
     </UiBaseTable>

     <!-- Create Role Drawer -->
     <UiSideDrawer 
       :show="showCreateModal" 
       title="Architect new role" 
       @close="showCreateModal = false"
     >
       <div class="space-y-8">
          <p class="text-sm text-brand-gray/60 leading-relaxed font-medium">Define a new security tier with specific platform-wide permissions.</p>
          
          <div class="space-y-6">
            <UiAnimatedInput v-model="roleForm.name" label="Role designation" />
            <UiAnimatedInput v-model="roleForm.description" label="Objective/Description" />
            
            <div class="space-y-4">
              <label class="text-[10px] font-bold uppercase tracking-widest text-brand-gray/40 ml-1">Assigned permissions</label>
              <div class="grid grid-cols-1 gap-3">
                <div 
                  v-for="p in availablePermissions" 
                  :key="p" 
                  class="flex items-center p-4 rounded-2xl border transition-colors cursor-pointer group"
                  :class="roleForm.permissions.includes(p) ? 'bg-brand-blue/5 border-brand-blue/20' : 'bg-gray-50/50 border-gray-100' "
                  @click="togglePermission(p)"
                >
                  <div class="h-5 w-5 rounded-lg border flex items-center justify-center mr-3 transition-colors" :class="roleForm.permissions.includes(p) ? 'bg-brand-blue border-brand-blue text-white' : 'bg-white border-gray-200'">
                    <CheckIcon v-if="roleForm.permissions.includes(p)" class="h-3 w-3" />
                  </div>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-brand-blue group-hover:text-brand-blue/70">{{ p }}</span>
                </div>
              </div>
            </div>
          </div>
       </div>

       <template #footer>
          <div class="flex gap-4 w-full">
            <UiBaseButton variant="ghost" class="flex-1" @click="showCreateModal = false">Cancel</UiBaseButton>
            <UiBaseButton variant="primary" class="flex-1" @click="handleCreateRole">Establish role</UiBaseButton>
          </div>
       </template>
     </UiSideDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon, ShieldCheckIcon, PencilSquareIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { useCustomToast } from '@/composables/core/useCustomToast'

definePageMeta({
  layout: 'admin'
})

const { showToast } = useCustomToast()
const showCreateModal = ref(false)

const roleForm = ref({
  name: '',
  description: '',
  permissions: [] as string[]
})

const availablePermissions = [
  'Full Root Access',
  'Financial Settlement',
  'Tenant Sovereignty',
  'Security Auditing',
  'Booking Escalation',
  'Inventory Vetting',
  'Refund Authority',
  'Tax Compliance'
]

const roleColumns = [
  { key: 'name', label: 'Security Tier' },
  { key: 'permissions', label: 'Authorized Capabilities' },
  { key: 'users', label: 'Assigned Entities' },
  { key: 'actions', label: '', tdClass: 'text-right' },
]

const roles = ref([
  { 
    name: 'Super Admin', 
    tier: 'Infrastructure',
    users: 2, 
    description: 'Unrestricted master access. Complete governance over agents, finances, and platform security matrices.',
    permissions: ['Full Root Access', 'Financial Settlement', 'Tenant Sovereignty', 'Security Auditing']
  },
  { 
    name: 'Support Operations', 
    tier: 'Operational',
    users: 15, 
    description: 'Tier-2 operational oversight. Capacity to manage inventory, refunds, and global passenger records.',
    permissions: ['Booking Escalation', 'Inventory Vetting', 'Refund Authority']
  },
  { 
    name: 'Financial Controller', 
    tier: 'Fiscal',
    users: 4, 
    description: 'Economic ledger oversight. Specialized access to payout cycles, tax records, and revenue share auditing.',
    permissions: ['Financial Settlement', 'Tax Compliance', 'Security Auditing']
  }
])

const togglePermission = (p: string) => {
  if (roleForm.value.permissions.includes(p)) {
    roleForm.value.permissions = roleForm.value.permissions.filter(x => x !== p)
  } else {
    roleForm.value.permissions.push(p)
  }
}

const handleCreateRole = () => {
  if (!roleForm.value.name) return
  
  roles.value.push({
    ...roleForm.value,
    tier: 'Custom',
    users: 0
  })
  
  showToast({
    title: 'Security policy updated',
    message: `New role "${roleForm.value.name}" has been established.`,
    toastType: 'success'
  })
  
  showCreateModal.value = false
  roleForm.value = { name: '', description: '', permissions: [] }
}

const handleAudit = (role: any) => {
  showToast({ title: 'Audit logs', message: `Retrieving audit history for ${role.name}...`, toastType: 'info' })
}

const handleEdit = (role: any) => {
  showToast({ title: 'Update Policy', message: `Policy adjustments for ${role.name} coming soon.`, toastType: 'info' })
}
</script>
