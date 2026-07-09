<template>
  <div class="space-y-10 pb-24 text-brand-gray/80 font-medium container mx-auto">
    <!-- Header Architecture -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white border border-gray-200 p-8 rounded-[2rem] shadow-none transition-premium">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-gray-900 ">Roles & Permissions</h1>
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
    <div v-if="loading" class="bg-white border border-gray-200 rounded-[2rem] p-12 flex flex-col items-center justify-center animate-pulse">
       <RefreshCwIcon class="h-10 w-10 text-gray-200 animate-spin mb-4" />
       <p class="text-sm font-bold text-gray-400 uppercase ">Updating data...</p>
    </div>
    
    <div v-else class="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-100">
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Role Name</th>
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 w-1/3">Description</th>
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Access Rights</th>
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Type</th>
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-for="role in roles" :key="role._id">
              <!-- Main Row -->
              <tr @click="expandedRole = expandedRole === role._id ? null : role._id" class="group hover:bg-gray-50/50 transition-colors cursor-pointer" :class="{'bg-gray-50/50': expandedRole === role._id}">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-4">
                    <div class="h-10 w-10 rounded-xl bg-brand-blue/5 flex items-center justify-center text-brand-blue shrink-0 transition-all duration-300" :class="{'bg-brand-blue text-white shadow-md': expandedRole === role._id}">
                      <ShieldCheckIcon class="h-5 w-5" />
                    </div>
                    <div>
                       <span class="text-sm font-bold text-gray-900 capitalize">{{ role.name.replace(/_/g, ' ') }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <p class="text-xs text-gray-500 leading-relaxed font-medium line-clamp-2">{{ role.description || 'No specific description provided.' }}</p>
                </td>
                <td class="px-8 py-6">
                  <div class="flex items-center gap-2 flex-wrap max-w-[280px]">
                     <span v-for="perm in getSamplePermissions(role.permissions)" :key="perm" class="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold rounded-lg shadow-sm whitespace-nowrap">
                       {{ getPermissionName(perm) }}
                     </span>
                     <span v-if="(role.permissions?.length || 0) > 3" class="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-lg whitespace-nowrap">
                       +{{ (role.permissions?.length || 0) - 3 }} more
                     </span>
                     <span v-if="(role.permissions?.length || 0) === 0" class="text-xs font-bold text-gray-400">
                        No permissions
                     </span>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <span v-if="role.isDefault" class="inline-flex px-2.5 py-1 rounded-md bg-gray-900 text-[9px] font-black text-white uppercase tracking-wider">System</span>
                  <span v-else class="inline-flex px-2.5 py-1 rounded-md bg-emerald-50 text-[9px] font-black text-emerald-600 uppercase tracking-wider border border-emerald-100">Custom</span>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex justify-end items-center gap-4">
                    <div class="flex items-center gap-2" @click.stop>
                      <button @click="handleEdit(role)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-brand-blue hover:border-brand-blue/30 transition-all shadow-sm">
                        <PencilIcon class="h-4 w-4" />
                      </button>
                      <button v-if="!role.isDefault" @click="handleDelete(role)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
                        <Trash2Icon class="h-4 w-4" />
                      </button>
                    </div>
                    <ChevronDownIcon class="h-5 w-5 text-gray-400 transition-transform duration-300" :class="{'rotate-180 text-brand-blue': expandedRole === role._id}" />
                  </div>
                </td>
              </tr>
              
              <!-- Expanded Mapping Details -->
              <tr v-if="expandedRole === role._id">
                 <td colspan="5" class="p-0 border-t border-gray-100 bg-gray-50/50">
                    <div class="px-8 py-8 border-b border-gray-200/50">
                       <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                          <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                             <h4 class="text-xs font-black text-gray-900 uppercase tracking-widest">Permission Mapping</h4>
                             <span class="px-3 py-1 bg-brand-blue/10 text-brand-blue font-black text-[10px] uppercase tracking-wider rounded-lg">{{ role.permissions?.length || 0 }} Enabled</span>
                          </div>
                          <div class="p-8">
                             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
                               <div v-for="category in getPermissionsByCategory(role.permissions)" :key="category.name" class="space-y-5">
                                  <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <span class="w-1.5 h-1.5 rounded-full bg-brand-blue opacity-50"></span>
                                    {{ category.name }}
                                  </h5>
                                  <div class="space-y-3">
                                    <div v-for="perm in category.permissions" :key="perm.key" class="flex items-start gap-3">
                                       <div class="mt-0.5 h-4 w-4 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                                          <CheckIcon class="h-3 w-3" />
                                       </div>
                                       <div>
                                          <p class="text-xs font-bold text-gray-900 leading-tight">{{ perm.name }}</p>
                                          <p class="text-[10px] font-medium text-gray-500 mt-1 leading-snug">{{ perm.description }}</p>
                                       </div>
                                    </div>
                                  </div>
                               </div>
                             </div>
                             <div v-if="(role.permissions?.length || 0) === 0" class="text-center py-12">
                               <ShieldCheckIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                               <p class="text-sm font-bold text-gray-500">No permissions mapped to this role.</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </td>
              </tr>
            </template>
            <tr v-if="!roles?.length && !loading">
              <td colspan="5" class="px-8 py-20 text-center">
                <div class="flex flex-col items-center justify-center space-y-3 opacity-60">
                  <SearchIcon class="h-10 w-10 text-gray-300" />
                  <h3 class="text-lg font-bold text-gray-900">No roles found</h3>
                  <p class="text-xs font-medium text-gray-500">Create a new specialized role to organize your team access.</p>
                  <UiBaseButton variant="primary" class="mt-4 bg-gray-900 text-white" @click="openCreateModal">
                     Create First Role
                  </UiBaseButton>
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
            <h4 class="text-xs font-bold text-brand-blue uppercase  flex items-center">
               <InfoIcon class="h-4 w-4 mr-2" />
               Quick Tips
            </h4>
            <p class="text-sm text-gray-700 leading-relaxed font-medium">Select a name for the role and choose exactly what permissions members assigned to this role should have.</p>
         </div>
         
         <div class="space-y-8">
           <div class="space-y-3">
              <label class="text-xs font-bold text-gray-400 uppercase  ml-1">Role Name</label>
              <input 
                v-model="form.name" 
                type="text" 
                placeholder="e.g. Sales Executive"
                class="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 font-bold text-lg text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium"
                :disabled="isEdit && form.isDefault"
              />
           </div>
           
           <div class="space-y-3">
              <label class="text-xs font-bold text-gray-400 uppercase  ml-1">What this role does</label>
              <textarea 
                v-model="form.description" 
                rows="3" 
                placeholder="Give a short summary of this role's purpose..."
                class="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 font-bold text-sm text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium resize-none"
              ></textarea>
           </div>
           
           <div class="space-y-6">
             <div class="flex justify-between items-center px-1">
                <label class="text-xs font-bold text-gray-400 uppercase ">Assigned Permissions</label>
                <button @click="toggleSelectAll" class="text-sm font-bold text-brand-blue uppercase  hover:underline transition-premium">{{ allSelected ? 'Deselect all' : 'Select all' }}</button>
             </div>
             
             <div class="border border-gray-200 rounded-none overflow-hidden bg-white max-h-[600px] overflow-y-auto custom-scrollbar">
                <table class="w-full text-left border-collapse">
                   <thead>
                      <tr class="bg-gray-50 border-b border-gray-200 uppercase  text-[9px] font-bold text-gray-400">
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
                                  <p class="text-xs font-bold text-gray-900 ">{{ p.name }}</p>
                                  <p class="text-sm text-gray-400 mt-0.5">{{ p.description }}</p>
                               </div>
                            </div>
                         </td>
                         <td class="px-6 py-5">
                            <span class="text-sm font-bold uppercase  text-gray-400 opacity-60">{{ p.category }}</span>
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
           <UiBaseButton variant="ghost" class="flex-1 text-sm font-bold" @click="showModal = false">Cancel</UiBaseButton>
           <UiBaseButton variant="primary" class="flex-1 text-sm font-bold bg-gray-900 text-white shadow-none" @click="handleSave" :loading="saving">
              {{ isEdit ? 'Save Changes' : 'Create Role' }}
           </UiBaseButton>
         </div>
      </template>
    </UiSideDrawer>

    <!-- View Details Drawer Removed in favor of Accordion mapping -->
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
  Search as SearchIcon,
  ChevronDown as ChevronDownIcon
} from 'lucide-vue-next'
import { useRoles } from '@/composables/modules/admin/useRoles'
import { useCustomToast } from "@/composables/core/useCustomToast"
import { onMounted, ref, computed } from 'vue'
import { ArrowRight as ArrowRightIcon } from 'lucide-vue-next'

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
const expandedRole = ref<string | null>(null)

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

const getSamplePermissions = (perms: string[] | undefined) => {
  return perms ? perms.slice(0, 3) : []
}

const getPermissionName = (key: string) => {
  const p = availablePermissions.value.find(ap => ap.key === key)
  return p ? p.name : key
}

const getPermissionsByCategory = (perms: string[] | undefined) => {
  if (!perms) return []
  // Map keys to full permission objects
  const fullPerms = perms.map(key => availablePermissions.value.find(ap => ap.key === key)).filter(Boolean) as any[]
  
  // Group by category
  const groups = {} as Record<string, any[]>
  fullPerms.forEach(p => {
    const cat = p.category || 'Other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(p)
  })
  
  // Return array format
  return Object.keys(groups).map(name => ({
    name,
    permissions: groups[name]
  })).sort((a, b) => a.name.localeCompare(b.name))
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
  return (availablePermissions.value?.length || 0) > 0 && (form.value.permissions?.length || 0) === (availablePermissions.value?.length || 0)
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
