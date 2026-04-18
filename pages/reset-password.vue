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
           <h1 class="text-4xl font-bold text-gray-900 leading-tight mb-3 text-center">Reset password</h1>
           <p class="text-gray-600 font-medium text-sm text-center">Securely assign a new global access code to your portal profile.</p>
        </div>

        <form @submit.prevent="handleReset" class="space-y-6">
            <div class="space-y-4">
               <UiAnimatedInput 
                 v-model="newPassword"
                 label="New Password" 
                 type="password"
                 required
               />
               <UiAnimatedInput 
                 v-model="confirmPassword"
                 label="Confirm New Password" 
                 type="password"
                 required
               />
            </div>

            <UiBaseButton 
              type="submit" 
              variant="primary" 
              size="lg" 
              block 
              :loading="passwordLoading"
              class="!py-3 !rounded-2xl !text-base !shadow-none !border-none"
            >
              Update Password
            </UiBaseButton>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/modules/auth/useAuth'
import { useRoute } from 'vue-router'
import { useCustomToast } from '@/composables/core/useCustomToast'

definePageMeta({
  layout: false
})

const route = useRoute()
const newPassword = ref('')
const confirmPassword = ref('')
const token = ref('')

const { resetPassword, passwordLoading } = useAuth()
const { showToast } = useCustomToast()

onMounted(() => {
  if (route.query.token) {
    token.value = route.query.token as string
  } else {
    showToast({
      title: "Error",
      message: "Missing reset token. Please request a new password reset.",
      toastType: "error"
    })
  }
})

const handleReset = async () => {
  if (!token.value) {
    showToast({
      title: "Error",
      message: "Missing reset token",
      toastType: "error"
    })
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    showToast({
      title: "Error",
      message: "Passwords do not match",
      toastType: "error"
    })
    return
  }
  
  try {
    const res = await resetPassword({ 
      token: token.value, 
      newPassword: newPassword.value 
    })
    if (res) {
      navigateTo('/')
    }
  } catch(e) {
    // Error handled by composable
  }
}
</script>
