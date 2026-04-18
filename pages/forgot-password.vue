<template>
  <div class="min-h-screen bg-white flex overflow-hidden font-sans text-brand-gray relative">
    <!-- Decorative Background Elements -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl animate-pulse" />
    <div class="absolute top-1/2 -right-24 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl" />
    
    <div class="w-full flex items-center justify-center p-8 md:p-12 relative z-10">
      <div class="w-full max-w-md space-y-10">
        <div class="flex items-center space-x-3 mb-8 justify-center">
          <img src="@/assets/img/logo.png" class="h-10 w-auto" alt="Flybeth Logo" />
        </div>

        <div>
          <h1 class="text-4xl font-bold text-gray-900 leading-tight mb-3 text-center">Forgot password</h1>
          <p class="text-gray-600 font-medium text-sm text-center">Enter the email associated with your admin account to receive a reset link.</p>
        </div>

        <form @submit.prevent="handleForgotPassword" class="space-y-6">
            <div class="space-y-4">
               <UiAnimatedInput 
                 v-model="email"
                 label="Email address" 
                 type="email"
                 required
                 :disabled="success"
               />
            </div>

            <UiBaseButton 
              type="submit" 
              variant="primary" 
              size="lg" 
              block 
              :loading="passwordLoading"
              class="!py-3 !rounded-2xl !text-base !shadow-none !border-none"
              :disabled="success"
            >
              {{ success ? 'Reset link sent' : 'Send Reset Link' }}
            </UiBaseButton>
        </form>

        <p class="text-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-premium">
          <NuxtLink to="/">Back to login</NuxtLink>
        </p>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/modules/auth/useAuth'

definePageMeta({
  layout: false
})

const email = ref('')
const success = ref(false)

const { forgotPassword, passwordLoading } = useAuth()

const handleForgotPassword = async () => {
  if (!email.value) return
  
  try {
    const res = await forgotPassword({ email: email.value })
    if (res) {
      success.value = true
    }
  } catch(e) {
    // Handled by composable
  }
}
</script>
