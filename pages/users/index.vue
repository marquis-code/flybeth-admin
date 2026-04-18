<template>
  <div class="space-y-10 pb-12">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
       <div class="space-y-1">
         <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Team</h1>
         <p class="text-gray-600 font-medium text-sm">Manage your administrators and support staff</p>
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
         <p class="text-sm font-bold text-gray-500  tracking-widest mb-1">{{ s.label }}</p>
         <div class="flex items-center justify-between">
           <h3 class="text-3xl font-bold text-gray-900">{{ s.value }}</h3>
           <div class="h-10 w-10 bg-brand-blue/5 rounded-xl flex items-center justify-center text-gray-900 group-hover:bg-brand-blue group-hover:text-white transition-colors">
             <component :is="s.icon" class="h-5 w-5" />
           </div>
         </div>
      </UiBaseCard>
    </div>

    <!-- User Table -->
    <UiBaseTable 
      :columns="userColumns" 
      :items="users"
      :meta="meta"
      :loading="loading"
      empty-title="No staff members"
      empty-description="You haven't added any team members yet. Invite your first colleague to start collaborating."
      @page-change="onPageChange"
      @update:limit="onLimitChange"
    >
      <template #cell(profile)="{ item }">
        <div class="flex items-center space-x-4">
          <div class="h-10 w-10 rounded-xl bg-brand-blue/5 border border-brand-blue/5 flex items-center justify-center font-bold text-gray-900 group-hover:bg-brand-blue group-hover:text-white transition-colors">
            {{ item.name?.[0] || item.firstName?.[0] || '?' }}
          </div>
          <div class="text-left">
             <div class="text-sm font-bold text-gray-900 tracking-tight">{{ item.name || `${item.firstName} ${item.lastName}` }}</div>
             <div class="text-sm font-bold text-gray-500  tracking-widest">{{ item.email }}</div>
          </div>
        </div>
      </template>

      <template #cell(role)="{ item }">
        <span class="text-sm font-bold text-gray-900  tracking-widest bg-brand-blue/5 px-4 py-1.5 rounded-lg border border-brand-blue/10">
          {{ item.role }}
        </span>
      </template>

      <template #cell(status)="{ item }">
         <div class="flex items-center px-4 py-1.5 rounded-xl bg-gray-50/50 border border-gray-100 w-fit">
           <div class="h-1.5 w-1.5 rounded-full mr-3" :class="(item.status === 'Active' || item.isActive) ? 'bg-brand-green' : 'bg-brand-gray/30'"></div>
           <span class="text-sm font-bold  tracking-widest" :class="(item.status === 'Active' || item.isActive) ? 'text-brand-green' : 'text-brand-gray/50'">
             {{ item.status || (item.isActive ? 'Active' : 'Inactive') }}
           </span>
         </div>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex items-center justify-end space-x-2">
          <button @click="handleEdit(item)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-colors hover:text-gray-900 hover:bg-brand-blue/5">
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
          <p class="text-sm text-amber-600 mt-1.5 leading-relaxed font-medium">This creates a fully verified account with immediate access. The user will receive login credentials via email.</p>
        </div>
        
        <div class="space-y-4">
          <UiAnimatedInput v-model="createForm.firstName" label="First name" />
          <UiAnimatedInput v-model="createForm.lastName" label="Last name" />
          <UiAnimatedInput v-model="createForm.email" label="Email address" type="email" />
          <UiAnimatedInput v-model="createForm.password" label="Temporary password" type="password" />
          <UiAnimatedInput v-model="createForm.phone" label="Phone number (optional)" type="tel" />
          <div class="space-y-2">
            <label class="text-sm font-bold  tracking-widest text-gray-500 ml-1">System role</label>
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
        <p class="text-sm text-gray-600 leading-relaxed font-medium">Send a secure invitation to a new administrative or support staff member.</p>
        
        <div class="space-y-4">
          <UiAnimatedInput v-model="inviteForm.name" label="Full name" />
          <UiAnimatedInput v-model="inviteForm.email" label="Professional email" type="email" />
          <div class="space-y-2">
            <label class="text-sm font-bold  tracking-widest text-gray-500 ml-1">Security role</label>
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
    <!-- Edit Team Member Drawer -->
    <UiSideDrawer 
      :show="showEditDrawer" 
      title="Edit team member" 
      @close="showEditDrawer = false; editingUserId = null"
    >
      <div class="space-y-6">
        <div class="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4">
          <p class="text-sm text-blue-900 font-bold mb-1">Modify access level</p>
          <p class="text-xs text-blue-700 leading-relaxed font-medium">Changing a user's role will immediately update their permissions and platform access horizontally across all endpoints.</p>
        </div>

        <UiAnimatedInput 
          v-model="editForm.role" 
          label="Role capability" 
          type="select" 
          :options="[...createRoleOptions, ...inviteRoleOptions, 'agent', 'customer']" 
        />

        <div class="pt-8">
          <UiBaseButton variant="primary" class="w-full" :loading="loading" @click="submitEdit">
            Update role capabilities
          </UiBaseButton>
        </div>
      </div>
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

const { users, loading, fetchUsers, inviteUser, createAdminUser, updateUserRole, deleteUser } = useUsers()
const { showToast } = useCustomToast()
const { confirm } = useConfirmation()
const meta = computed(() => {
  const m = useUsers().meta
  return m?.value || null
})

const showInviteDrawer = ref(false)
const showCreateDrawer = ref(false)
const showEditDrawer = ref(false)
const editingUserId = ref<string | null>(null)
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

const editForm = ref({
  role: ''
})

const createRoleOptions = ['super_admin', 'tenant_admin', 'staff']
const inviteRoleOptions = ['Super Admin', 'Finance Manager', 'Content Moderator', 'Support Tier 1', 'Support Tier 2']

const userColumns = [
  { key: 'profile', label: 'Member' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', tdClass: 'text-right' },
]

const computedUserStats = computed(() => {
  const total = meta.value?.total || users.value.length
  return [
    { label: 'Team members', value: total.toString(), icon: UsersIcon },
    { label: 'Admins', value: users.value.filter(u => u.role?.includes('admin')).length.toString(), icon: ShieldCheckIcon },
    { label: 'Support staff', value: users.value.filter(u => u.role?.includes('staff')).length.toString(), icon: LifebuoyIcon },
  ]
})

const currentPage = ref(1)
const currentLimit = ref(20)

const fetchParams = computed(() => ({
  page: currentPage.value,
  limit: currentLimit.value
}))

const loadUsers = async () => {
  await fetchUsers(fetchParams.value)
}

const onPageChange = (page: number) => {
  currentPage.value = page
  loadUsers()
}

const onLimitChange = (limit: number) => {
  currentLimit.value = limit
  currentPage.value = 1
  loadUsers()
}

onMounted(() => {
  loadUsers()
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
    await loadUsers()
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
    await loadUsers()
  } catch (err) {
    // Error handled by composable/interceptor
  }
}

const handleEdit = (user: any) => {
  editingUserId.value = user._id
  editForm.value.role = user.role
  showEditDrawer.value = true
}

const submitEdit = async () => {
  if (!editingUserId.value || !editForm.value.role) return
  try {
    await updateUserRole(editingUserId.value, editForm.value.role)
    showToast({ title: 'Success', message: 'Team member role updated successfully!', toastType: 'success' })
    showEditDrawer.value = false
    editingUserId.value = null
    await loadUsers()
  } catch (err: any) {
     showToast({ title: 'Failed', message: 'Could not update role.', toastType: 'error' })
  }
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
         await loadUsers()
       } catch (err) {}
    }
}
</script>
