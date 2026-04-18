<template>
  <div class="space-y-10 pb-24 text-brand-gray/80 font-medium container mx-auto">
    <!-- Header Architecture -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white border border-gray-100 p-8 rounded-[2rem] shadow-none transition-premium">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Security Orchestration</h1>
        <p class="text-gray-500 font-medium">Define, audit, and deconstruct security roles across the platform infrastructure.</p>
      </div>
      <div class="flex gap-4">
        <UiBaseButton variant="outline" @click="fetchData" :loading="loading">
           <ArrowPathIcon class="h-4 w-4 mr-2" />
           Sync tiers
        </UiBaseButton>
        <UiBaseButton variant="primary" size="lg" @click="openCreateModal" class="bg-gray-900 text-white min-w-[200px] shadow-none">
          <PlusIcon class="h-5 w-5 mr-3" />
          Architect new role
        </UiBaseButton>
      </div>
    </div>

    <!-- Tier visualization -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div v-for="i in 3" :key="i" class="h-48 bg-white border border-gray-100 rounded-[2rem] animate-pulse"></div>
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Role Cards -->
      <div v-for="role in roles" :key="role._id" class="relative group">
         <div class="bg-white border border-gray-100 p-8 rounded-[2.5rem] h-full flex flex-col hover:border-brand-blue/30 hover:bg-gray-50/30 transition-premium shadow-none">
            <div class="flex justify-between items-start mb-6">
               <div class="h-14 w-14 bg-brand-blue/5 rounded-2xl flex items-center justify-center text-brand-blue shadow-none group-hover:scale-110 transition-premium">
                  <ShieldCheckIcon class="h-7 w-7" />
               </div>
               <div class="flex space-x-2">
                  <button @click="handleEdit(role)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-brand-blue hover:bg-white transition-premium shadow-none border border-transparent hover:border-gray-100">
                    <PencilSquareIcon class="h-4 w-4" />
                  </button>
                  <button v-if="!role.isDefault" @click="handleDelete(role)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-white transition-premium shadow-none border border-transparent hover:border-gray-100">
                    <TrashIcon class="h-4 w-4" />
                  </button>
               </div>
            </div>

            <h3 class="text-xl font-bold text-gray-900 mb-2 truncate uppercase tracking-tight">{{ role.name.replace('_', ' ') }}</h3>
            <p class="text-sm text-gray-500 line-clamp-2 mb-8 min-h-[40px] leading-relaxed">{{ role.description || 'No system definition provided for this security tier.' }}</p>
            
            <div class="mt-auto space-y-4">
               <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>Authorized capabilities</span>
                  <span class="text-brand-blue">{{ role.permissions.length }}</span>
               </div>
               <div class="flex flex-wrap gap-1.5 pt-2">
                  <span 
                    v-for="perm in role.permissions.slice(0, 4)" 
                    :key="perm" 
                    class="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-white px-2.5 py-1 rounded-md border border-gray-100"
                  >
                    {{ perm.split('_').pop() }}
                  </span>
                  <span v-if="role.permissions.length > 4" class="text-[9px] font-bold text-brand-blue bg-brand-blue/5 px-2.5 py-1 rounded-md border border-brand-blue/10">
                    +{{ role.permissions.length - 4 }}
                  </span>
               </div>
            </div>

            <div v-if="role.isDefault" class="absolute top-6 left-1/2 -translate-x-1/2">
               <span class="text-[10px] font-bold text-white bg-gray-900 px-4 py-1.5 rounded-full tracking-widest uppercase shadow-none ring-4 ring-gray-100/50">Core Engine Role</span>
            </div>
         </div>
      </div>
    </div>

    <!-- Security Tier Architect (Drawer) -->
    <UiSideDrawer 
      :show="showModal" 
      :title="isEdit ? 'Reconstruct security policy' : 'Architect new role'" 
      @close="showModal = false"
    >
      <div class="space-y-10 py-4">
         <div class="p-6 bg-brand-blue/5 rounded-[2rem] border border-brand-blue/10 space-y-3">
            <h4 class="text-xs font-bold text-brand-blue uppercase tracking-widest flex items-center">
               <InformationCircleIcon class="h-4 w-4 mr-2" />
               Architectural Guidance
            </h4>
            <p class="text-sm text-gray-700 leading-relaxed font-medium">Define a role designation and map it to specific infrastructure permissions. These permissions directly control sidebar accessibility and API authorization.</p>
         </div>
         
         <div class="space-y-8">
           <div class="space-y-3">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Role Designation</label>
              <input 
                v-model="form.name" 
                type="text" 
                placeholder="e.g. support_tier_3"
                class="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-lg text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium"
                :disabled="isEdit && form.isDefault"
              />
           </div>
           
           <div class="space-y-3">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">System Description</label>
              <textarea 
                v-model="form.description" 
                rows="3" 
                placeholder="Briefly define the scope of this tier..."
                class="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-sm text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium resize-none"
              ></textarea>
           </div>
           
           <div class="space-y-6">
             <div class="flex justify-between items-center px-1">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Authorized Capabilities</label>
                <button @click="toggleSelectAll" class="text-[10px] font-bold text-brand-blue uppercase tracking-widest hover:underline transition-premium">{{ allSelected ? 'Deselect all' : 'Select all' }}</button>
             </div>
             
             <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <div 
                  v-for="p in availablePermissions" 
                  :key="p.key" 
                  class="flex items-center justify-between p-5 rounded-[1.5rem] border transition-premium cursor-pointer group shadow-none"
                  :class="form.permissions.includes(p.key) ? 'bg-brand-blue/5 border-brand-blue/20' : 'bg-gray-50/50 border-gray-100 hover:border-gray-300' "
                  @click="togglePermission(p.key)"
                >
                   <div class="flex items-center space-x-4">
                      <div class="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-none transition-premium group-hover:scale-110">
                         <div class="h-1.5 w-1.5 rounded-full" :class="form.permissions.includes(p.key) ? 'bg-brand-blue' : 'bg-gray-300'"></div>
                      </div>
                      <div>
                         <p class="text-sm font-bold text-gray-900 tracking-tight">{{ p.name }}</p>
                         <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{{ p.category }}</p>
                      </div>
                   </div>
                   <div class="h-6 w-6 rounded-full border-2 flex items-center justify-center transition-premium" :class="form.permissions.includes(p.key) ? 'bg-brand-blue border-brand-blue' : 'bg-white border-gray-200'">
                      <CheckIcon v-if="form.permissions.includes(p.key)" class="h-3 w-3 text-white" />
                   </div>
                </div>
             </div>
           </div>
         </div>
      </div>

      <template #footer>
         <div class="flex gap-4 w-full px-2">
           <UiBaseButton variant="ghost" class="flex-1 py-4 text-sm font-bold" @click="showModal = false">Cancel</UiBaseButton>
           <UiBaseButton variant="primary" class="flex-1 py-4 text-sm font-bold bg-gray-900 text-white shadow-none" @click="handleSave" :loading="saving">
              {{ isEdit ? 'Update security policy' : 'Establish role' }}
           </UiBaseButton>
         </div>
      </template>
    </UiSideDrawer>
  </div>
</template>

<script setup lang="ts">
import { useRoles } from '@/composables/modules/admin/useRoles'
import { useCustomToast } from "@/composables/core/useCustomToast"
import { onMounted } from 'vue'

const { 
  loading, 
  saving, 
  roles, 
  availablePermissions, 
  fetchRolesAndPermissions, 
  createRole: apiCreateRole, 
  updateRole: apiUpdateRole, 
  deleteRole: apiDeleteRole 
} = useRoles()

const { showToast } = useCustomToast() // Still needed for some local validations

definePageMeta({
  layout: 'admin'
})

const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref<string | null>(null)

const form = ref({
  name: '',
  description: '',
  permissions: [] as string[],
  isDefault: false
})

const fetchData = async () => {
  await fetchRolesAndPermissions()
}

const openCreateModal = () => {
  isEdit.value = false
  currentId.value = null
  form.value = { name: '', description: '', permissions: [], isDefault: false }
  showModal.value = true
}

const handleEdit = (role: any) => {
  isEdit.value = true
  currentId.value = role._id
  form.value = { ...role }
  showModal.value = true
}

const handleDelete = async (role: any) => {
  if (confirm(`Are you sure you want to deconstruct the "${role.name}" role?`)) {
    try {
      await apiDeleteRole(role._id)
      await fetchData()
    } catch (e) {
      console.error(e)
    }
  }
}

const togglePermission = (key: string) => {
  const index = form.value.permissions.indexOf(key)
  if (index > -1) form.value.permissions.splice(index, 1)
  else form.value.permissions.push(key)
}

const allSelected = computed(() => {
  return availablePermissions.value.length > 0 && form.value.permissions.length === availablePermissions.value.length
})

const toggleSelectAll = () => {
  if (allSelected.value) form.value.permissions = []
  else form.value.permissions = availablePermissions.value.map(p => p.key)
}

const handleSave = async () => {
  if (!form.value.name) {
    showToast({ title: 'Invalid Logic', message: 'Role designation is required.', toastType: 'error' })
    return
  }
  
  try {
    if (isEdit.value && currentId.value) {
      await apiUpdateRole(currentId.value, form.value)
    } else {
      await apiCreateRole(form.value)
    }
    showModal.value = false
    await fetchData()
  } catch (e) {
    console.error(e)
  }
}

onMounted(fetchData)
</script>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
</style>
