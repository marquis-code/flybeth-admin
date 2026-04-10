import { ref } from 'vue'

interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

const isVisible = ref(false)
const options = ref<ConfirmationOptions>({
  title: 'Confirm action',
  message: 'Are you sure you want to proceed?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger'
})

let resolvePromise: (value: boolean) => void

export const useConfirmation = () => {
  const confirm = (newOptions: Partial<ConfirmationOptions>) => {
    options.value = {
      title: 'Confirm action',
      message: 'Are you sure you want to proceed?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
      ...newOptions
    }
    isVisible.value = true
    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve
    })
  }

  const handleConfirm = () => {
    isVisible.value = false
    resolvePromise(true)
  }

  const handleCancel = () => {
    isVisible.value = false
    resolvePromise(false)
  }

  return {
    isVisible,
    options,
    confirm,
    handleConfirm,
    handleCancel
  }
}
