<template>
  <div class="min-h-screen bg-white flex overflow-hidden font-sans text-brand-gray relative">
    <!-- Decorative Background Elements -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl animate-pulse" />
    <div class="absolute top-1/2 -right-24 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl" />
    <div class="absolute -bottom-24 left-1/2 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl" />

    <!-- Left: Branding & Visuals (Desktop) -->
    <div class="hidden lg:flex lg:w-1/2 p-20 flex-col justify-between relative overflow-hidden bg-cover bg-center" style="background-image: url('/img/auth-bg.png')">
       <div class="absolute inset-0 bg-slate-900/60 pointer-events-none"></div>
       
       <div class="relative z-10">
         <div class="flex items-center space-x-3 group cursor-pointer bg-white/5 backdrop-blur-md p-4 rounded-2xl w-fit border border-white/10 shadow-2xl">
            <img src="@/assets/img/logo.png" class="h-10 w-auto" alt="Flybeth Logo" />
         </div>
       </div>

       <div class="relative z-10 max-w-lg">
         <h2 class="text-6xl  text-white leading-tight mb-8">
           Join the <br/> 
           <span class="text-brand-green">Control Tower</span> <br/>
           Engine.
         </h2>
         <p class="text-xl text-white/70 font-medium leading-relaxed">
           Create your administrative account to start managing global operations.
         </p>
       </div>

       <div class="relative z-10 flex items-center space-x-8 text-white/40 text-sm  uppercase tracking-[0.3em]">
          <span>© 2026 Flybeth Global</span>
          <span class="h-1 w-1 rounded-full bg-white/20"></span>
          <span>Enterprise Portal</span>
       </div>
    </div>

    <!-- Right: Signup Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 relative z-10">
      <div class="w-full max-w-md space-y-10">
        <div class="lg:hidden flex items-center space-x-3 mb-8">
          <img src="@/assets/img/logo.png" class="h-10 w-auto" alt="Flybeth Logo" />
        </div>

        <div v-if="!showOtp">
          <h1 class="text-4xl font-bold text-brand-blue leading-tight mb-3">Create account</h1>
          <p class="text-brand-gray/60 font-medium text-sm">Join the Flybeth administrative team.</p>
        </div>

        <div v-else>
          <img src="@/assets/img/logo.png" class="h-10 w-auto mb-6" alt="Flybeth Logo" />
          <h1 class="text-4xl font-bold text-brand-blue leading-tight mb-3">Verify email</h1>
          <p class="text-brand-gray/60 font-medium text-sm">Enter the 6-digit code sent to {{ form.email }}</p>
        </div>

        <!-- Signup Form -->
        <form v-if="!showOtp" @submit.prevent="handleSignup" class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
               <UiAnimatedInput 
                 v-model="form.firstName"
                 label="First name" 
                 type="text"
                 required
               />
               <UiAnimatedInput 
                 v-model="form.lastName"
                 label="Last name" 
                 type="text"
                 required
               />
            </div>

            <UiAnimatedInput 
              v-model="form.email"
              label="Email address" 
              type="email"
              required
              :disabled="!!invitationToken"
            />

            <UiAnimatedInput 
              v-model="form.phone"
              label="Phone number" 
              type="tel"
              required
            />

            <UiAnimatedInput 
              v-model="form.password"
              label="Password" 
              type="password"
              required
            />

            <!-- Role Selection -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-widest text-brand-gray/40 ml-1">Administrative role</label>
              <UiBaseSelect 
                v-model="form.role"
                :options="roleOptions"
                placeholder="Choose role"
                :disabled="!!invitationToken"
              />
            </div>

            <!-- Master Registration Key (Only for un-invited admin setup) -->
            <div v-if="!invitationToken && ['super_admin', 'tenant_admin'].includes(form.role)" class="space-y-4 pt-2">
               <div class="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-3">
                  <div class="mt-0.5 text-amber-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px]  uppercase tracking-wider text-amber-900/60">Administrative Setup</p>
                    <p class="text-xs font-medium text-amber-900/40 leading-relaxed">
                      You are creating an administrative account without an invitation. Please provide the <b>System Master Key</b> to proceed.
                    </p>
                  </div>
               </div>
               <UiAnimatedInput 
                 v-model="masterKey"
                 label="Master registration key" 
                 type="password"
                 required
               />
            </div>

            <UiBaseButton 
              type="submit" 
              variant="primary" 
              size="lg" 
              block 
              :loading="loading"
              class="!py-3 !rounded-2xl !text-base"
            >
              Create account
            </UiBaseButton>
            
            <p class="text-center text-sm font-medium text-brand-gray/50 mt-6">
              Already have an account? 
              <NuxtLink to="/" class="text-brand-blue font-bold hover:underline">Login here</NuxtLink>
            </p>
        </form>

        <!-- OTP Form -->
        <form v-else @submit.prevent="handleVerifyOtp" class="space-y-8">
            <UiBaseOtpInput 
              v-model="otp"
              label="Verification code"
            />

            <UiBaseButton 
              type="submit" 
              variant="primary" 
              size="lg" 
              block 
              :loading="loading"
              class="!py-3 !rounded-2xl !text-base"
            >
              Verify and complete
            </UiBaseButton>

            <button 
              type="button" 
              @click="showOtp = false" 
              class="w-full text-sm font-bold text-brand-gray/40 hover:text-brand-blue transition-all duration-300"
            >
              Back to registration
            </button>
        </form>

        <div class="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
           <p class="text-[10px] font-bold text-brand-gray/30 uppercase tracking-widest">Flybeth admin terminal</p>
           <div class="flex items-center space-x-2">
              <span class="text-[10px] font-bold text-brand-gray/40 uppercase tracking-widest">Secure enrollment</span>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/modules/auth/useAuth'
import { useUsers } from '@/composables/modules/users/useUsers'
import { useCustomToast } from '@/composables/core/useCustomToast'

definePageMeta({
  layout: false
})

const route = useRoute()
const invitationToken = ref(route.query.token as string || '')

const form = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: 'tenant_admin',
  token: invitationToken.value || undefined
})

const showOtp = ref(false)
const otp = ref('')
const masterKey = ref('')

const roleOptions = [
  { label: 'Tenant Administrator', value: 'tenant_admin' },
  { label: 'Super Administrator', value: 'super_admin' }
]

const { register, verifyOtp, loading: authLoading } = useAuth()
const { verifyInvitation, loading: inviteLoading } = useUsers()
const { showToast } = useCustomToast()

const loading = computed(() => authLoading.value || inviteLoading.value)

onMounted(async () => {
  if (invitationToken.value) {
    try {
      const res = await verifyInvitation(invitationToken.value)
      if (res && res.data) {
        const { email, role } = res.data
        form.value.email = email
        form.value.role = role
        showToast({
          title: "Invitation Verified",
          message: `Welcome! You are joining as a ${role.replace('_', ' ')}.`,
          toastType: "success"
        })
      }
    } catch (error: any) {
      console.error('Invitation verification failed:', error)
      showToast({
          title: "Invalid Invitation",
          message: "Your invitation link is invalid or has expired. Please contact your administrator.",
          toastType: "error"
        })
      // Redirect to login if token is invalid
      setTimeout(() => {
        navigateTo('/')
      }, 3000)
    }
  }
})

const handleSignup = async () => {
  const signupData = { ...form.value }
  
  // If no invitation token, use the entered master key
  if (!invitationToken.value && masterKey.value) {
    signupData.token = masterKey.value
  }

  const res = await register(signupData)
  if (res) {
    showOtp.value = true
  }
}

const handleVerifyOtp = async () => {
  const res = await verifyOtp({
    email: form.value.email,
    otp: otp.value
  })
  
  if (res) {
    navigateTo('/dashboard')
  }
}
</script>
