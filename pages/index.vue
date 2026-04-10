<template>
  <div class="min-h-screen bg-white flex overflow-hidden font-sans text-brand-gray relative">
    <!-- Decorative Background Elements -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl animate-pulse" />
    <div class="absolute top-1/2 -right-24 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl" />
    <div class="absolute -bottom-24 left-1/2 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl" />

    <!-- Left: Branding & Visuals (Desktop) -->
    <div class="hidden lg:flex lg:w-1/2 p-20 flex-col justify-between relative overflow-hidden bg-cover bg-center" style="background-image: url('/img/auth-bg.png')">
       <!-- Background Overlay (Darker for better logo contrast) -->
       <div class="absolute inset-0 bg-slate-900/60 pointer-events-none"></div>
       
       <div class="relative z-10">
         <div class="flex items-center space-x-3 group cursor-pointer bg-white/5 backdrop-blur-md p-4 rounded-2xl w-fit border border-white/10 shadow-2xl">
            <img src="@/assets/img/logo.png" class="h-10 w-auto" alt="Flybeth Logo" />
         </div>
       </div>

        <div class="relative z-10 max-w-lg">
          <h2 class="text-6xl font-bold text-white leading-tight mb-8">
            Elevate <br/> 
            <span class="text-brand-green">global travel</span> <br/>
            operations.
          </h2>
         <p class="text-xl text-white/70 font-medium leading-relaxed">
           Manage your entire travel ecosystem with precision and ease.
         </p>
       </div>

        <div class="relative z-10 flex items-center space-x-8 text-white/40 text-[10px] font-bold uppercase tracking-widest">
           <span>© 2026 Flybeth global</span>
           <span class="h-1 w-1 rounded-full bg-white/20"></span>
           <span>Enterprise portal</span>
        </div>
    </div>

    <!-- Right: Authentication Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 relative z-10">
      <div class="w-full max-w-md space-y-10">
        <div class="lg:hidden flex items-center space-x-3 mb-8">
     <img src="@/assets/img/logo.png" class="h-10 w-auto" alt="Flybeth Logo" />
        </div>

        <div v-if="!showOtp">
          <h1 class="text-4xl font-bold text-brand-blue leading-tight mb-3">Admin login</h1>
          <p class="text-brand-gray/60 font-medium text-sm">Sign in to manage your global travel operations.</p>
        </div>

        <div v-else>
          <img src="@/assets/img/logo.png" class="h-10 w-auto mb-6" alt="Flybeth Logo" />
          <h1 class="text-4xl font-bold text-brand-blue leading-tight mb-3">Verify login</h1>
          <p class="text-brand-gray/60 font-medium text-sm">Enter the code sent to your email.</p>
        </div>

        <form v-if="!showOtp" @submit.prevent="handleLogin" class="space-y-6">
            <div class="space-y-4">
               <UiAnimatedInput 
                 v-model="form.email"
                 label="Email address" 
                 type="email"
                 required
               />
               
               <UiAnimatedInput 
                 v-model="form.password"
                 label="Password" 
                 type="password"
                 required
               />
            </div>

            <div class="flex items-center justify-between">
               <div class="flex items-center">
                  <input 
                    id="trust-device" 
                    v-model="form.remember"
                    type="checkbox" 
                    class="custom-checkbox"
                  >
                  <label for="trust-device" class="ml-3 text-sm font-bold text-brand-gray/50 cursor-pointer hover:text-brand-blue transition-premium">
                    Remember me
                  </label>
               </div>
               <a href="#" class="text-sm font-bold text-brand-blue hover:underline">Forgot password?</a>
            </div>

            <UiBaseButton 
              type="submit" 
              variant="primary" 
              size="lg" 
              block 
              :loading="loading"
              class="!py-3 !rounded-2xl !text-base !shadow-none !border-none"
            >
              Sign in
            </UiBaseButton>
        </form>

        <!-- OTP Form -->
        <form v-else @submit.prevent="handleVerifyOtp" class="space-y-10">
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
              class="!py-3 !rounded-2xl !text-base !shadow-none !border-none"
            >
              Verify and login
            </UiBaseButton>

            <button 
              type="button" 
              @click="showOtp = false" 
              class="w-full text-sm font-bold text-brand-gray/40 hover:text-brand-blue transition-premium"
            >
              Back to login
            </button>
        </form>

        <p v-if="!showOtp" class="text-center text-sm font-medium text-brand-gray/50">
          Don't have an account? 
          <NuxtLink to="/signup" class="text-brand-blue font-bold hover:underline">Sign up</NuxtLink>
        </p>

        <div class="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
           <p class="text-[10px] font-bold text-brand-gray/30 uppercase tracking-widest">Flybeth admin terminal</p>
           <div class="flex items-center space-x-2">
              <span class="text-[10px] font-bold text-brand-gray/40 uppercase tracking-widest">Global platform</span>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/modules/auth/useAuth'
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  PaperAirplaneIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: false
})

const form = ref({
  email: '',
  password: '',
  remember: false
})

const { login, verifyOtp, loading } = useAuth()

const showOtp = ref(false)
const otp = ref('')

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) return
  
  const res = await login({
    email: form.value.email,
    password: form.value.password
  }) as any
  
  if (res && res.requiresOtp) {
    showOtp.value = true
  } else if (res) {
    navigateTo('/dashboard')
  }
}

const handleVerifyOtp = async () => {
  if (!otp.value) return
  
  const res = await verifyOtp({
    email: form.value.email,
    otp: otp.value
  })
  
  if (res) {
    navigateTo('/dashboard')
  }
}
</script>
