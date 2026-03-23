<template>
  <div class="space-y-10 pb-12">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
       <div class="space-y-1">
         <h1 class="text-4xl  font-black text-brand-blue tracking-tight">Staffing & Control</h1>
         <p class="text-brand-gray/60 font-medium">Manage your core team, administrators, and infrastructure support staff</p>
       </div>
       <UiBaseButton variant="primary" size="lg" @click="showInviteDrawer = true">
         <UserPlusIcon class="h-5 w-5 mr-3" />
         Invite Team Member
       </UiBaseButton>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <UiBaseCard v-for="s in computedUserStats" :key="s.label" padding class="group hover:bg-white transition-all duration-300">
         <p class="text-sm font-black text-brand-gray/40 uppercase tracking-[0.25em] mb-1">{{ s.label }}</p>
         <div class="flex items-center justify-between">
           <h3 class="text-3xl  font-black text-brand-blue">{{ s.value }}</h3>
           <div class="h-10 w-10 bg-brand-blue/5 rounded-xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
             <component :is="s.icon" class="h-5 w-5" />
           </div>
         </div>
      </UiBaseCard>
    </div>

    <!-- User Table -->
    <div v-if="loading && users.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100">
      <div class="h-10 w-10 border-4 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin"></div>
      <p class="mt-4 text-sm font-black text-brand-blue/40 uppercase tracking-widest">Hydrating Staff Profiles...</p>
    </div>

    <UiBaseTable 
      v-else
      :columns="userColumns" 
      :items="users"
      empty-title="No Staff Members"
      empty-description="You haven't added any team members yet. Invite your first colleague to start collaborating."
    >
      <template #cell(profile)="{ item }">
        <div class="flex items-center space-x-4">
          <div class="h-10 w-10 rounded-xl bg-brand-blue/5 border border-brand-blue/5 flex items-center justify-center font-black text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
            {{ item.name[0] }}
          </div>
          <div>
             <div class="text-sm font-black text-brand-blue">{{ item.name }}</div>
             <div class="text-sm font-bold text-brand-gray/40 uppercase tracking-widest">{{ item.email }}</div>
          </div>
        </div>
      </template>

      <template #cell(role)="{ item }">
        <span class="text-[9px] font-black text-brand-blue uppercase tracking-widest bg-brand-blue/5 px-4 py-1.5 rounded-lg border border-brand-blue/10">
          {{ item.role }}
        </span>
      </template>

      <template #cell(status)="{ item }">
         <div class="flex items-center px-4 py-1.5 rounded-xl bg-gray-50/50 border border-gray-100 w-fit">
           <div class="h-2 w-2 rounded-full mr-3" :class="item.status === 'Active' ? 'bg-brand-green animate-pulse' : 'bg-brand-gray/30'"></div>
           <span class="text-[9px] font-black uppercase tracking-widest" :class="item.status === 'Active' ? 'text-brand-green' : 'text-brand-gray/50'">
             {{ item.status }}
           </span>
         </div>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex items-center justify-end space-x-2">
          <button @click="handleEdit(item)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-brand-gray/40 transition-colors">
            <PencilSquareIcon class="h-4 w-4" />
          </button>
          <button @click="handleDelete(item._id)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-red-300 transition-colors">
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
      </template>
    </UiBaseTable>

    <!-- Invite Side Drawer -->
    <UiSideDrawer 
      :show="showInviteDrawer" 
      title="Team Expansion" 
      @close="showInviteDrawer = false"
    >
      <div class="space-y-8">
        <p class="text-sm text-brand-gray/60 leading-relaxed font-medium">Send a secure invitation to a new administrative or support staff member.</p>
        
        <div class="space-y-4">
          <UiAnimatedInput v-model="inviteForm.name" label="Full Name" />
          <UiAnimatedInput v-model="inviteForm.email" label="Professional Email" type="email" />
          <UiSelectInput
            v-model="inviteForm.role"
            label="Security Role"
            :options="roleOptions"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex gap-4 w-full">
          <UiBaseButton variant="ghost" class="flex-1" @click="showInviteDrawer = false">Cancel</UiBaseButton>
          <UiBaseButton variant="primary" class="flex-1" :loading="loading" @click="handleInvite">Send Invite</UiBaseButton>
        </div>
      </template>
    </UiSideDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUsers } from '@/composables/modules/users/useUsers'
import { 
  UserPlusIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  LifebuoyIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const { users, loading, fetchUsers, inviteUser } = useUsers()

const showInviteDrawer = ref(false)
const inviteForm = ref({
  name: '',
  email: '',
  role: 'Support Tier 1'
})

const roleOptions = ['Super Admin', 'Finance Manager', 'Content Moderator', 'Support Tier 1', 'Support Tier 2']

const userColumns = [
  { key: 'profile', label: 'Staff Profile' },
  { key: 'role', label: 'Security Role' },
  { key: 'status', label: 'Access Status' },
  { key: 'actions', label: '', tdClass: 'text-right' },
]

const computedUserStats = computed(() => [
  { label: 'Infrastructure Staff', value: users.value.length.toString(), icon: UsersIcon },
  { label: 'Global Admins', value: users.value.filter(u => u.role?.includes('Admin')).length.toString(), icon: ShieldCheckIcon },
  { label: 'Support Response', value: users.value.filter(u => u.role?.includes('Support')).length.toString(), icon: LifebuoyIcon },
])

onMounted(() => {
  fetchUsers()
})

const handleInvite = async () => {
  try {
    await inviteUser(inviteForm.value)
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
    // Logic for deletion with confirmation
}
</script>
