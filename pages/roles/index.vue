<template>
  <div class="space-y-10 pb-24 text-brand-gray/80 font-medium container mx-auto">
    <!-- Header Architecture -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white border border-gray-100 p-8 rounded-[2rem] shadow-none transition-premium">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Roles & Permissions</h1>
        <p class="text-gray-500 font-medium text-sm">Create and manage what different team members can see and do on the platform.</p>
      </div>
      <div class="flex gap-4">
        <UiBaseButton variant="outline" @click="fetchData" :loading="loading">
           <RefreshCwIcon class="h-4 w-4 mr-2" />
           Sync list
        </UiBaseButton>
        <UiBaseButton variant="primary" size="lg" @click="openCreateModal" class="bg-gray-900 text-white min-w-[200px] shadow-none">
          <PlusIcon class="h-5 w-5 mr-3" />
          Create New Role
        </UiBaseButton>
      </div>
    </div>

    <!-- Tier visualization -->
    <div v-if="loading" class="bg-white border border-gray-100 rounded-[2rem] p-12 flex flex-col items-center justify-center animate-pulse">
       <RefreshCwIcon class="h-10 w-10 text-gray-200 animate-spin mb-4" />
       <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Updating data...</p>
    </div>
    
    <div v-else class="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-none">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Role Name</th>
              <th class="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Description</th>
              <th class="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Permissions</th>
              <th class="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Type</th>
              <th class="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="role in roles" :key="role._id" class="group hover:bg-gray-50/50 transition-premium">
              <td class="px-8 py-7">
                <div class="flex items-center space-x-4">
                  <div class="h-10 w-10 rounded-xl bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-premium">
                    <ShieldCheckIcon class="h-5 w-5" />
                  </div>
                  <span class="text-sm font-bold text-gray-900 uppercase tracking-tight">{{ role.name.replace('_', ' ') }}</span>
                </div>
              </td>
              <td class="px-8 py-7 max-w-xs">
                <p class="text-xs text-gray-500 leading-relaxed truncate">{{ role.description || 'No specific description provided.' }}</p>
              </td>
              <td class="px-8 py-7">
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-200/50">
                    {{ role.permissions.length }} Access Points
                  </span>
                  <div class="flex -space-x-1 overflow-hidden">
                    <div v-for="i in Math.min(3, role.permissions.length)" :key="i" class="h-5 w-5 rounded-full border-2 border-white bg-brand-blue/10 flex items-center justify-center">
                      <div class="h-1 w-1 rounded-full bg-brand-blue"></div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-8 py-7">
                <span v-if="role.isDefault" class="px-3 py-1 rounded-full bg-gray-900 text-[9px] font-bold text-white uppercase tracking-widest">System Role</span>
                <span v-else class="px-3 py-1 rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-600 uppercase tracking-widest border border-emerald-100">Custom Role</span>
              </td>
              <td class="px-8 py-7 text-right">
                <div class="flex justify-end items-center space-x-2">
                  <button @click="handleEdit(role)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-brand-blue hover:border-brand-blue/30 transition-premium shadow-sm">
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button v-if="!role.isDefault" @click="handleDelete(role)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-200 transition-premium shadow-sm">
                    <Trash2Icon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!roles.length && !loading">
              <td colspan="5" class="px-8 py-20 text-center">
                <div class="flex flex-col items-center justify-center space-y-3 opacity-40">
                  <SearchIcon class="h-10 w-10 text-gray-400" />
                  <p class="text-xs font-bold uppercase tracking-widest text-gray-500">No roles found.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Security Tier Architect (Drawer) -->
    <UiSideDrawer 
      :show="showModal" 
      :title="isEdit ? 'Edit Role Details' : 'Create New Role'" 
      subtitle="Define and map specialized team capabilities"
      size="full"
      @close="showModal = false"
    >
      <div class="space-y-10 py-4">
         <div class="p-6 bg-brand-blue/5 rounded-[2rem] border border-brand-blue/10 space-y-3">
            <h4 class="text-xs font-bold text-brand-blue uppercase tracking-widest flex items-center">
               <InfoIcon class="h-4 w-4 mr-2" />
               Quick Tips
            </h4>
            <p class="text-sm text-gray-700 leading-relaxed font-medium">Select a name for the role and choose exactly what permissions members assigned to this role should have.</p>
         </div>
         
         <div class="space-y-8">
           <div class="space-y-3">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Role Name</label>
              <input 
                v-model="form.name" 
                type="text" 
                placeholder="e.g. Sales Executive"
                class="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-lg text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium"
                :disabled="isEdit && form.isDefault"
              />
           </div>
           
           <div class="space-y-3">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">What this role does</label>
              <textarea 
                v-model="form.description" 
                rows="3" 
                placeholder="Give a short summary of this role's purpose..."
                class="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-sm text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium resize-none"
              ></textarea>
           </div>
           
           <div class="space-y-6">
             <div class="flex justify-between items-center px-1">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Assigned Permissions</label>
                <button @click="toggleSelectAll" class="text-[10px] font-bold text-brand-blue uppercase tracking-widest hover:underline transition-premium">{{ allSelected ? 'Deselect all' : 'Select all' }}</button>
             </div>
             
             <div class="border border-gray-100 rounded-[1.5rem] overflow-hidden bg-white max-h-[600px] overflow-y-auto custom-scrollbar">
                <table class="w-full text-left border-collapse">
                   <thead>
                      <tr class="bg-gray-50 border-b border-gray-100 uppercase tracking-widest text-[9px] font-bold text-gray-400">
                         <th class="px-6 py-4">Capability Name</th>
                         <th class="px-6 py-4">Group</th>
                         <th class="px-6 py-4 text-right">Enabled</th>
                      </tr>
                   </thead>
                   <tbody class="divide-y divide-gray-50 font-medium">
                      <tr 
                        v-for="p in availablePermissions" 
                        :key="p.key" 
                        class="hover:bg-gray-50/50 transition-premium cursor-pointer group"
                        @click="togglePermission(p.key)"
                      >
                         <td class="px-6 py-5">
                            <div class="flex items-center space-x-3">
                               <div class="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-brand-blue group-hover:text-white transition-premium">
                                  <div v-if="!form.permissions.includes(p.key)" class="h-1 w-1 rounded-full bg-gray-300"></div>
                                  <CheckIcon v-else class="h-3 w-3" />
                               </div>
                               <div>
                                  <p class="text-xs font-bold text-gray-900 tracking-tight">{{ p.name }}</p>
                                  <p class="text-[10px] text-gray-400 mt-0.5">{{ p.description }}</p>
                               </div>
                            </div>
                         </td>
                         <td class="px-6 py-5">
                            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 opacity-60">{{ p.category }}</span>
                         </td>
                         <td class="px-6 py-5 text-right">
                            <div 
                              class="inline-flex h-5 w-5 rounded-md border-2 transition-premium items-center justify-center ml-auto"
                              :class="form.permissions.includes(p.key) ? 'bg-brand-blue/10 border-brand-blue' : 'bg-white border-gray-200'"
                            >
                               <CheckIcon v-if="form.permissions.includes(p.key)" class="h-3 w-3 text-brand-blue" />
                            </div>
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>
           </div>
         </div>
      </div>

      <template #footer>
         <div class="flex gap-4 w-full px-2">
           <UiBaseButton variant="ghost" class="flex-1 py-4 text-sm font-bold" @click="showModal = false">Cancel</UiBaseButton>
           <UiBaseButton variant="primary" class="flex-1 py-4 text-sm font-bold bg-gray-900 text-white shadow-none" @click="handleSave" :loading="saving">
              {{ isEdit ? 'Save Changes' : 'Create Role' }}
           </UiBaseButton>
         </div>
      </template>
    </UiSideDrawer>
  </div>
</template>

<script setup lang="ts">
import { 
  ShieldCheck as ShieldCheckIcon, 
  RefreshCw as RefreshCwIcon, 
  Plus as PlusIcon, 
  Pencil as PencilIcon, 
  Trash2 as Trash2Icon, 
  Info as InfoIcon, 
  Check as CheckIcon, 
  Search as SearchIcon 
} from 'lucide-vue-next'
import { useRoles } from '@/composables/modules/admin/useRoles'
import { useCustomToast } from "@/composables/core/useCustomToast"
import { onMounted, ref, computed } from 'vue'

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
  if (confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
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
    showToast({ title: 'Role Name Missing', message: 'Please enter a name for this role.', toastType: 'error' })
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
