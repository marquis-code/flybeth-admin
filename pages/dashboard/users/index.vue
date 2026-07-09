<template>
  <div class="space-y-10 pb-12">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
       <div class="space-y-1">
         <h1 class="text-2xl font-bold text-gray-900 ">Team</h1>
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
         <p class="text-sm font-bold text-gray-500   mb-1">{{ s.label }}</p>
         <div class="flex items-center justify-between">
           <h3 class="text-3xl font-bold text-gray-900">{{ s.value }}</h3>
           <div class="h-10 w-10 bg-brand-blue/5 rounded-xl flex items-center justify-center text-gray-900 group-hover:bg-brand-blue group-hover:text-white transition-colors">
             <component :is="s.icon" class="h-5 w-5" />
           </div>
         </div>
      </UiBaseCard>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 mt-8 mb-6">
      <button @click="activeTab = 'team'" :class="['px-6 py-3 font-bold text-sm border-b-2 transition-colors', activeTab === 'team' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700']">Active Team</button>
      <button @click="activeTab = 'invitations'" :class="['px-6 py-3 font-bold text-sm border-b-2 transition-colors', activeTab === 'invitations' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700']">Sent Invitations</button>
    </div>

    <!-- User Table -->
    <div v-if="activeTab === 'team'">
      <UiBaseTable 
        :columns="userColumns" 
        :items="teamMembers"
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
               <div class="text-sm font-bold text-gray-900 ">{{ item.name || `${item.firstName} ${item.lastName}` }}</div>
               <div class="text-sm font-bold text-gray-500  ">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <template #cell(role)="{ item }">
          <span class="text-sm font-bold text-gray-900 bg-brand-blue/5 px-4 py-1.5 rounded-lg border border-brand-blue/10 capitalize">
            {{ getRoleName(item.role).replace(/_/g, ' ') }}
          </span>
        </template>

        <template #cell(status)="{ item }">
           <div class="flex items-center px-4 py-1.5 rounded-xl bg-gray-50/50 border border-gray-200 w-fit">
             <div class="h-1.5 w-1.5 rounded-full mr-3" :class="(item.status === 'Active' || item.isActive) ? 'bg-brand-green' : 'bg-brand-gray/30'"></div>
             <span class="text-sm font-bold  " :class="(item.status === 'Active' || item.isActive) ? 'text-brand-green' : 'text-brand-gray/50'">
               {{ item.status || (item.isActive ? 'Active' : 'Inactive') }}
             </span>
           </div>
        </template>

        <template #cell(actions)="{ item }">
          <div class="flex items-center justify-end space-x-2">
            <button @click="handleView(item)" class="px-3 py-1.5 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 text-xs font-bold transition-colors hover:text-gray-900 hover:bg-brand-blue/5">
              <EyeIcon class="h-3.5 w-3.5 mr-1.5" /> View
            </button>
            <button @click="handleEdit(item)" class="px-3 py-1.5 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 text-xs font-bold transition-colors hover:text-gray-900 hover:bg-brand-blue/5">
              <PencilSquareIcon class="h-3.5 w-3.5 mr-1.5" /> Edit
            </button>
            <button @click="handleDelete(item._id)" class="px-3 py-1.5 flex items-center justify-center rounded-xl bg-red-50 text-red-600 text-xs font-bold transition-colors hover:text-red-700 hover:bg-red-100">
              <TrashIcon class="h-3.5 w-3.5 mr-1.5" /> Revoke
            </button>
          </div>
        </template>
      </UiBaseTable>
    </div>

    <!-- Invitations Table -->
    <div v-else>
      <UiBaseTable 
        :columns="invitationColumns" 
        :items="invitations"
        :loading="loading"
        empty-title="No sent invitations"
        empty-description="You haven't sent any invitations yet."
      >
        <template #cell(name)="{ item }">
          <div class="text-left">
             <div class="text-sm font-bold text-gray-900 ">{{ item.name }}</div>
             <div class="text-sm font-bold text-gray-500  ">{{ item.email }}</div>
          </div>
        </template>

        <template #cell(role)="{ item }">
          <span class="text-sm font-bold text-gray-900 bg-brand-blue/5 px-4 py-1.5 rounded-lg border border-brand-blue/10 capitalize">
            {{ getRoleName(item.role).replace(/_/g, ' ') }}
          </span>
        </template>

        <template #cell(status)="{ item }">
           <div class="flex items-center px-4 py-1.5 rounded-xl border w-fit"
                :class="{
                  'bg-amber-50 border-amber-200 text-amber-700': item.status === 'pending',
                  'bg-green-50 border-green-200 text-green-700': item.status === 'accepted',
                  'bg-red-50 border-red-200 text-red-700': item.status === 'expired'
                }">
             <span class="text-xs font-bold uppercase tracking-wider">
               {{ item.status }}
             </span>
           </div>
        </template>

        <template #cell(expiresAt)="{ item }">
          <span class="text-sm font-medium text-gray-600">{{ new Date(item.expiresAt).toLocaleDateString() }}</span>
        </template>

        <template #cell(actions)="{ item }">
          <div class="flex items-center justify-end space-x-2" v-if="item.status === 'pending'">
            <button @click="handleResend(item._id)" class="px-3 py-1.5 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 text-xs font-bold transition-colors hover:text-gray-900 hover:bg-brand-blue/5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3.5 mr-1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Resend
            </button>
            <button @click="handleCancelInvite(item._id)" class="px-3 py-1.5 flex items-center justify-center rounded-xl bg-red-50 text-red-600 text-xs font-bold transition-colors hover:text-red-700 hover:bg-red-100">
              <TrashIcon class="h-3.5 w-3.5 mr-1.5" /> Cancel
            </button>
          </div>
        </template>
      </UiBaseTable>
    </div>

    <!-- Create Admin User Drawer -->
    <UiSideDrawer 
      :show="showCreateDrawer" 
      title="Team Member Creation" 
      subtitle="Instantly provision new administrative access"
      size="full"
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
            <label class="text-sm font-bold   text-gray-500 ml-1">System role</label>
            <UiSelectInput
              v-model="createForm.role"
              label=""
              :options="dynamicRoleOptions"
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
      title="Team Expansion" 
      subtitle="Send a secure invitation to join the platform"
      size="full"
      @close="showInviteDrawer = false"
    >
      <div class="space-y-8">
        <p class="text-sm text-gray-600 leading-relaxed font-medium">Send a secure invitation to a new administrative or support staff member.</p>
        
        <div class="space-y-4">
          <UiAnimatedInput v-model="inviteForm.name" label="Full name" />
          <UiAnimatedInput v-model="inviteForm.email" label="Professional email" type="email" />
          <div class="space-y-2">
            <label class="text-sm font-bold   text-gray-500 ml-1">Security role</label>
            <UiSelectInput
              v-model="inviteForm.role"
              label=""
              :options="dynamicRoleOptions"
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
      title="Credential Update" 
      subtitle="Modify team member access and governance tiers"
      size="full"
      @close="showEditDrawer = false; editingUserId = null"
    >
      <div class="space-y-6">
        <div class="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4">
          <p class="text-sm text-blue-900 font-bold mb-1">Modify access level</p>
          <p class="text-xs text-blue-700 leading-relaxed font-medium">Changing a user's role will immediately update their permissions and platform access horizontally across all endpoints.</p>
        </div>

        <UiSelectInput 
          v-model="editForm.role" 
          label="Role capability" 
          :options="dynamicRoleOptions" 
        />

        <div class="pt-8">
          <UiBaseButton variant="primary" class="w-full" :loading="loading" @click="submitEdit">
            Update role capabilities
          </UiBaseButton>
        </div>
      </div>
    </UiSideDrawer>
    <!-- Member Details Drawer -->
    <UiSideDrawer 
      :show="showDetailsDrawer" 
      title="Member Profile" 
      subtitle="Comprehensive overview of team member details"
      size="md"
      @close="showDetailsDrawer = false; selectedMember = null"
    >
      <div v-if="selectedMember" class="space-y-8">
        <div class="flex items-center space-x-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <div class="h-16 w-16 rounded-2xl bg-[#033958] flex items-center justify-center font-bold text-white text-2xl shadow-sm">
            {{ selectedMember.name?.[0] || selectedMember.firstName?.[0] || '?' }}
          </div>
          <div>
             <h3 class="text-xl font-bold text-gray-900">{{ selectedMember.name || `${selectedMember.firstName} ${selectedMember.lastName}` }}</h3>
             <p class="text-sm font-semibold text-[#3BAB22] capitalize">{{ getRoleName(selectedMember.role).replace(/_/g, ' ') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="p-5 border border-gray-100 rounded-2xl bg-white hover:border-gray-200 transition-colors">
            <p class="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Email Address</p>
            <p class="text-sm font-semibold text-gray-900">{{ selectedMember.email }}</p>
          </div>
          
          <div class="p-5 border border-gray-100 rounded-2xl bg-white hover:border-gray-200 transition-colors">
            <p class="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Phone Number</p>
            <p class="text-sm font-semibold text-gray-900">{{ selectedMember.phone || 'Not provided' }}</p>
          </div>

          <div class="p-5 border border-gray-100 rounded-2xl bg-white hover:border-gray-200 transition-colors flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Account Status</p>
              <p class="text-sm font-semibold text-gray-900">{{ selectedMember.isActive ? 'Active' : 'Inactive' }}</p>
            </div>
            <div class="h-3 w-3 rounded-full" :class="selectedMember.isActive ? 'bg-[#3BAB22]' : 'bg-gray-300'"></div>
          </div>
          
          <div class="p-5 border border-gray-100 rounded-2xl bg-white hover:border-gray-200 transition-colors">
            <p class="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Member Since</p>
            <p class="text-sm font-semibold text-gray-900">{{ new Date(selectedMember.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          </div>
        </div>
      </div>
    </UiSideDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUsers } from '@/composables/modules/users/useUsers'
import { useRoles } from '@/composables/modules/admin/useRoles'
import { useCustomToast } from '@/composables/core/useCustomToast'
import { useConfirmation } from '@/composables/core/useConfirmation'
import { 
  UserPlusIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  LifebuoyIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const activeTab = ref('team')

const { users, invitations, loading, fetchUsers, fetchInvitations, inviteUser, createAdminUser, updateUserRole, deleteUser, resendInvitation, cancelInvitation } = useUsers()
const { roles, fetchRolesAndPermissions } = useRoles()
const { showToast } = useCustomToast()
const { confirm } = useConfirmation()

const getRoleName = (roleIdOrName: any) => {
  if (!roleIdOrName) return 'Unassigned'
  if (typeof roleIdOrName === 'object' && roleIdOrName.name) return roleIdOrName.name
  const role = roles.value.find(r => r._id === roleIdOrName)
  if (role) return role.name
  return roleIdOrName.length === 24 ? 'Unknown Role' : roleIdOrName
}

const teamMembers = computed(() => {
  if (!users.value) return []
  return users.value.filter((u: any) => {
    const roleName = getRoleName(u.role)?.toLowerCase() || ''
    return !['agent', 'customer', 'user'].includes(roleName)
  })
})

const dynamicRoleOptions = computed(() => {
   return roles.value
     .filter(r => !['agent', 'customer', 'user'].includes(r.name.toLowerCase()))
     .map(r => ({
       value: r._id,
       label: r.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
     }))
})
const meta = computed(() => {
  const m = useUsers().meta
  return m?.value || null
})

const showInviteDrawer = ref(false)
const showCreateDrawer = ref(false)
const showEditDrawer = ref(false)
const showDetailsDrawer = ref(false)
const selectedMember = ref<any>(null)
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



const userColumns = [
  { key: 'profile', label: 'Member' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', tdClass: 'text-right' },
]

const invitationColumns = [
  { key: 'name', label: 'Invited User' },
  { key: 'role', label: 'Assigned Role' },
  { key: 'status', label: 'Status' },
  { key: 'expiresAt', label: 'Expires On' },
  { key: 'actions', label: '', tdClass: 'text-right' },
]

const computedUserStats = computed(() => {
  const team = teamMembers.value
  return [
    { label: 'Team members', value: team.length.toString(), icon: UsersIcon },
    { label: 'Admins', value: team.filter((u: any) => getRoleName(u.role)?.toLowerCase().includes('admin')).length.toString(), icon: ShieldCheckIcon },
    { label: 'Support staff', value: team.filter((u: any) => getRoleName(u.role)?.toLowerCase().includes('staff') || getRoleName(u.role)?.toLowerCase().includes('support')).length.toString(), icon: LifebuoyIcon },
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

onMounted(async () => {
  await fetchRolesAndPermissions()
  loadUsers()
  fetchInvitations()
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

const handleView = (user: any) => {
  selectedMember.value = user
  showDetailsDrawer.value = true
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

const handleResend = async (id: string) => {
  try {
    await resendInvitation(id)
    showToast({ title: 'Success', message: 'Invitation resent successfully!', toastType: 'success' })
    await fetchInvitations()
  } catch (err: any) {
    showToast({ title: 'Error', message: err?.response?.data?.message || 'Failed to resend invitation', toastType: 'error' })
  }
}

const handleCancelInvite = async (id: string) => {
    const confirmed = await confirm({
      title: 'Cancel Invitation',
      message: 'Are you sure you want to cancel this invitation?',
      confirmText: 'Yes, cancel it',
      variant: 'danger'
    })

    if (confirmed) {
       try {
         await cancelInvitation(id)
         showToast({ title: 'Cancelled', message: 'Invitation has been cancelled.', toastType: 'success' })
         await fetchInvitations()
       } catch (err) {}
    }
}
</script>
