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

        <!-- Success State -->
        <div v-if="success" class="success-container">
          <div class="success-icon-wrapper">
            <div class="success-icon-circle">
              <svg class="success-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          <h2 class="text-2xl font-bold text-gray-900 text-center">Check your email</h2>
          <p class="text-gray-500 text-sm text-center leading-relaxed" style="max-width: 340px; margin: 0 auto;">
            We've sent a password reset link to
            <span class="font-semibold text-gray-800 block mt-1">{{ email }}</span>
          </p>

          <div class="success-info-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; color: var(--brand-blue, #1a2b6d);">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span class="text-xs text-gray-500">Didn't receive the email? Check your spam folder or try again in a few minutes.</span>
          </div>

          <UiBaseButton 
            variant="primary" 
            size="lg" 
            block 
            class="!py-3 !rounded-2xl !text-base !shadow-none !border-none"
            @click="resetForm"
          >
            Try another email
          </UiBaseButton>

          <p class="text-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-premium">
            <NuxtLink to="/">Back to login</NuxtLink>
          </p>
        </div>

        <!-- Default Form State -->
        <template v-else>
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
                Send Reset Link
              </UiBaseButton>
          </form>

          <p class="text-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-premium">
            <NuxtLink to="/">Back to login</NuxtLink>
          </p>
        </template>

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

const resetForm = () => {
  success.value = false
  email.value = ''
}
</script>

<style scoped>
.success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  animation: fadeInUp 0.5s ease-out;
}

.success-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.success-icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow-none: 0 8px 24px rgba(34, 197, 94, 0.3);
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.success-checkmark {
  width: 36px;
  height: 36px;
  color: white;
  animation: drawCheck 0.5s ease-out 0.3s both;
}

.success-info-box {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  background: #f8f9fc;
  border-radius: 12px;
  border: 1px solid #e8ebf0;
  width: 100%;
  margin-top: 0.25rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes drawCheck {
  from {
    stroke-dasharray: 30;
    stroke-dashoffset: 30;
    opacity: 0;
  }
  to {
    stroke-dasharray: 30;
    stroke-dashoffset: 0;
    opacity: 1;
  }
}
</style>
