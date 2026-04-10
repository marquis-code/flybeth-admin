<template>
  <div class="space-y-10 pb-12">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
       <div class="space-y-1">
         <h1 class="text-3xl font-bold text-brand-blue tracking-tight">Staffing and control</h1>
         <p class="text-brand-gray/60 font-medium text-sm">Manage your core team, administrators, and infrastructure support staff</p>
       </div>
       <div class="flex items-center gap-4">
         <UiBaseButton variant="secondary" size="lg" @click="showCreateDrawer = true">
           <PlusCircleIcon class="h-5 w-5 mr-3" />
           Create admin user
         </UiBaseButton>
         <UiBaseButton variant="primary" size="lg" @click="showInviteDrawer = true">
           <UserPlusIcon class="h-5 w-5 mr-3" />
           Invite team member
         </UiBaseButton>
       </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <UiBaseCard v-for="s in computedUserStats" :key="s.label" padding class="group transition-all duration-300">
         <p class="text-[10px] font-bold text-brand-gray/40 uppercase tracking-widest mb-1">{{ s.label }}</p>
         <div class="flex items-center justify-between">
           <h3 class="text-3xl font-bold text-brand-blue">{{ s.value }}</h3>
           <div class="h-10 w-10 bg-brand-blue/5 rounded-xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
             <component :is="s.icon" class="h-5 w-5" />
           </div>
         </div>
      </UiBaseCard>
    </div>

    <!-- User Table -->
    <div v-if="loading && users.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
      <div class="h-10 w-10 border-4 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin"></div>
      <p class="mt-4 text-sm font-bold text-brand-blue/40 uppercase tracking-widest">Hydrating staff profiles...</p>
    </div>

    <UiBaseTable 
      v-else
      :columns="userColumns" 
      :items="users"
      empty-title="No staff members"
      empty-description="You haven't added any team members yet. Invite your first colleague to start collaborating."
    >
      <template #cell(profile)="{ item }">
        <div class="flex items-center space-x-4">
          <div class="h-10 w-10 rounded-xl bg-brand-blue/5 border border-brand-blue/5 flex items-center justify-center font-bold text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
            {{ item.name?.[0] || item.firstName?.[0] || '?' }}
          </div>
          <div class="text-left">
             <div class="text-sm font-bold text-brand-blue tracking-tight">{{ item.name || `${item.firstName} ${item.lastName}` }}</div>
             <div class="text-[10px] font-bold text-brand-gray/40 uppercase tracking-widest">{{ item.email }}</div>
          </div>
        </div>
      </template>

      <template #cell(role)="{ item }">
        <span class="text-[9px] font-bold text-brand-blue uppercase tracking-widest bg-brand-blue/5 px-4 py-1.5 rounded-lg border border-brand-blue/10">
          {{ item.role }}
        </span>
      </template>

      <template #cell(status)="{ item }">
         <div class="flex items-center px-4 py-1.5 rounded-xl bg-gray-50/50 border border-gray-100 w-fit">
           <div class="h-1.5 w-1.5 rounded-full mr-3" :class="(item.status === 'Active' || item.isActive) ? 'bg-brand-green' : 'bg-brand-gray/30'"></div>
           <span class="text-[9px] font-bold uppercase tracking-widest" :class="(item.status === 'Active' || item.isActive) ? 'text-brand-green' : 'text-brand-gray/50'">
             {{ item.status || (item.isActive ? 'Active' : 'Inactive') }}
           </span>
         </div>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex items-center justify-end space-x-2">
          <button @click="handleEdit(item)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-brand-gray/40 transition-colors hover:text-brand-blue hover:bg-brand-blue/5">
            <PencilSquareIcon class="h-4 w-4" />
          </button>
          <button @click="handleDelete(item._id)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-red-300 transition-colors hover:text-red-500 hover:bg-red-50">
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
      </template>
    </UiBaseTable>

    <!-- Create Admin User Drawer -->
    <UiSideDrawer 
      :show="showCreateDrawer" 
      title="Create admin user" 
      @close="showCreateDrawer = false"
    >
      <div class="space-y-8">
        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p class="text-sm text-amber-800 font-bold">🔒 Security notice</p>
          <p class="text-xs text-amber-600 mt-1.5 leading-relaxed font-medium">This creates a fully verified account with immediate access. The user will receive login credentials via email.</p>
        </div>
        
        <div class="space-y-4">
          <UiAnimatedInput v-model="createForm.firstName" label="First name" />
          <UiAnimatedInput v-model="createForm.lastName" label="Last name" />
          <UiAnimatedInput v-model="createForm.email" label="Email address" type="email" />
          <UiAnimatedInput v-model="createForm.password" label="Temporary password" type="password" />
          <UiAnimatedInput v-model="createForm.phone" label="Phone number (optional)" type="tel" />
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-brand-gray/40 ml-1">System role</label>
            <UiSelectInput
              v-model="createForm.role"
              label=""
              :options="createRoleOptions"
            />
          </div>
        </div>

        <p v-if="createError" class="text-sm text-red-500 font-bold">{{ createError }}</p>
      </div>

      <template #footer>
        <div class="flex gap-4 w-full">
          <UiBaseButton variant="ghost" class="flex-1" @click="showCreateDrawer = false">Cancel</UiBaseButton>
          <UiBaseButton variant="primary" class="flex-1" :loading="loading" @click="handleCreateAdmin">Create account</UiBaseButton>
        </div>
      </template>
    </UiSideDrawer>

    <!-- Invite Side Drawer -->
    <UiSideDrawer 
      :show="showInviteDrawer" 
      title="Team expansion" 
      @close="showInviteDrawer = false"
    >
      <div class="space-y-8">
        <p class="text-sm text-brand-gray/60 leading-relaxed font-medium">Send a secure invitation to a new administrative or support staff member.</p>
        
        <div class="space-y-4">
          <UiAnimatedInput v-model="inviteForm.name" label="Full name" />
          <UiAnimatedInput v-model="inviteForm.email" label="Professional email" type="email" />
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-brand-gray/40 ml-1">Security role</label>
            <UiSelectInput
              v-model="inviteForm.role"
              label=""
              :options="inviteRoleOptions"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-4 w-full">
          <UiBaseButton variant="ghost" class="flex-1" @click="showInviteDrawer = false">Cancel</UiBaseButton>
          <UiBaseButton variant="primary" class="flex-1" :loading="loading" @click="handleInvite">Send invite</UiBaseButton>
        </div>
      </template>
    </UiSideDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUsers } from '@/composables/modules/users/useUsers'
import { useCustomToast } from '@/composables/core/useCustomToast'
import { useConfirmation } from '@/composables/core/useConfirmation'
import { 
  UserPlusIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  LifebuoyIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const { users, loading, fetchUsers, inviteUser, createAdminUser, deleteUser } = useUsers()
const { showToast } = useCustomToast()
const { confirm } = useConfirmation()

const showInviteDrawer = ref(false)
const showCreateDrawer = ref(false)
const createError = ref('')

const inviteForm = ref({
  name: '',
  email: '',
  role: 'Support Tier 1'
})

const createForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  role: 'super_admin'
})

const createRoleOptions = ['super_admin', 'tenant_admin', 'staff']
const inviteRoleOptions = ['Super Admin', 'Finance Manager', 'Content Moderator', 'Support Tier 1', 'Support Tier 2']

const userColumns = [
  { key: 'profile', label: 'Staff profile' },
  { key: 'role', label: 'Security role' },
  { key: 'status', label: 'Access status' },
  { key: 'actions', label: '', tdClass: 'text-right' },
]

const computedUserStats = computed(() => [
  { label: 'Infrastructure staff', value: users.value.length.toString(), icon: UsersIcon },
  { label: 'Global admins', value: users.value.filter(u => u.role?.includes('admin')).length.toString(), icon: ShieldCheckIcon },
  { label: 'Support response', value: users.value.filter(u => u.role?.includes('staff')).length.toString(), icon: LifebuoyIcon },
])

onMounted(() => {
  fetchUsers()
})

const handleCreateAdmin = async () => {
  createError.value = ''
  
  if (!createForm.value.firstName || !createForm.value.email || !createForm.value.password) {
    createError.value = 'First name, email, and password are required.'
    return
  }

  if (createForm.value.password.length < 8) {
    createError.value = 'Password must be at least 8 characters.'
    return
  }

  try {
    await createAdminUser(createForm.value)
    showToast({ title: 'Success', message: 'Admin user created successfully!', toastType: 'success' })
    showCreateDrawer.value = false
    createForm.value = { firstName: '', lastName: '', email: '', password: '', phone: '', role: 'super_admin' }
    await fetchUsers()
  } catch (err: any) {
    createError.value = err?.response?.data?.message || 'Failed to create admin user.'
  }
}

const handleInvite = async () => {
  try {
    await inviteUser(inviteForm.value)
    showToast({ title: 'Success', message: 'Invitation sent!', toastType: 'success' })
    showInviteDrawer.value = false
    inviteForm.value = { name: '', email: '', role: 'Support Tier 1' }
    await fetchUsers()
  } catch (err) {
    // Error handled by composable/interceptor
  }
}

const handleEdit = (user: any) => {
  // Logic for opening edit modal/drawer
}

const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Remove staff member',
      message: 'Are you sure you want to permanently revoke access for this staff member? This action cannot be reversed.',
      confirmText: 'Revoke and delete',
      variant: 'danger'
    })

    if (confirmed) {
       try {
         await deleteUser(id)
         showToast({ title: 'Deleted', message: 'Staff member removed.', toastType: 'success' })
         await fetchUsers()
       } catch (err) {}
    }
}
</script>
