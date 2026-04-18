import { ref } from 'vue'
import { adminApiFactory } from '@/api_factory/modules/admin'
import { useCustomToast } from '@/composables/core/useCustomToast'

export const useStorage = () => {
    const files = ref<any[]>([])
    const loading = ref(false)
    const uploading = ref(false)
    const { showToast } = useCustomToast()

    const fetchFiles = async (folder?: string) => {
        loading.value = true
        try {
            const res = await adminApiFactory.getStorageFiles({ folder })
            files.value = res?.data?.data
        } catch (error: any) {
            showToast({
                title: "Error",
                message: "Failed to fetch storage items",
                toastType: "error"
            })
        } finally {
            loading.value = false
        }
    }

    const uploadFile = async (file: File, folder: string = 'general', metadata?: { label?: string; category?: string }) => {
        uploading.value = true
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)
        if (metadata?.label) formData.append('label', metadata.label)
        if (metadata?.category) formData.append('category', metadata.category)

        try {
            const res = await adminApiFactory.uploadFile(formData)
            showToast({
                title: "Success",
                message: "File uploaded successfully",
                toastType: "success"
            })
            // Add the metadata to the local files list if we got a response
            if (res?.data) {
                files.value.unshift({
                    ...res.data,
                    label: metadata?.label || '',
                    category: metadata?.category || ''
                })
            } else {
                await fetchFiles(folder)
            }
        } catch (error: any) {
            showToast({
                title: "Upload failed",
                message: error.response?.data?.message || "An error occurred during upload",
                toastType: "error"
            })
        } finally {
            uploading.value = false
        }
    }

    const deleteFile = async (publicId: string) => {
        loading.value = true
        try {
            await adminApiFactory.deleteStorageFile(publicId)
            showToast({
                title: "Deleted",
                message: "File removed from storage",
                toastType: "success"
            })
            files.value = files.value.filter(f => f.publicId !== publicId)
        } catch (error: any) {
            showToast({
                title: "Error",
                message: "Failed to delete file",
                toastType: "error"
            })
        } finally {
            loading.value = false
        }
    }

    return {
        files,
        loading,
        uploading,
        fetchFiles,
        uploadFile,
        deleteFile
    }
}
