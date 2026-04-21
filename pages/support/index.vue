<template>
  <div class="p-6 lg:p-10 space-y-8">
    
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl  text-gray-900 tracking-tight">Support & Outreach</h1>
        <p class="text-sm text-gray-500 font-medium mt-1">Manage user inquiries and newsletter subscriptions.</p>
      </div>
      
      <div class="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button 
          v-for="t in tabs" 
          :key="t.id"
          @click="activeTab = t.id"
          class="px-6 py-2.5 rounded-lg text-xs  uppercase tracking-widest transition-all"
          :class="activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- ── Newsletter Tab ── -->
    <div v-if="activeTab === 'newsletter'" class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-50 flex items-center justify-between">
        <h3 class="font-bold text-gray-800">Newsletter Subscriptions</h3>
        <button @click="fetchSubscriptions" class="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
          <RefreshCcw class="h-4 w-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50">
              <th class="px-6 py-4 text-[10px]  uppercase tracking-widest text-gray-400">Email Address</th>
              <th class="px-6 py-4 text-[10px]  uppercase tracking-widest text-gray-400">Status</th>
              <th class="px-6 py-4 text-[10px]  uppercase tracking-widest text-gray-400">Source</th>
              <th class="px-6 py-4 text-[10px]  uppercase tracking-widest text-gray-400">Date Joined</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="sub in subscriptions" :key="sub._id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4">
                <span class="text-sm font-bold text-gray-900">{{ sub.email }}</span>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="px-3 py-1 rounded-full text-[10px]  uppercase tracking-widest"
                  :class="sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'"
                >
                  {{ sub.status }}
                </span>
              </td>
              <td class="px-6 py-4 font-medium text-gray-400 text-xs">
                {{ sub.source || 'N/A' }}
              </td>
              <td class="px-6 py-4 font-medium text-gray-400 text-xs">
                {{ new Date(sub.createdAt).toLocaleDateString() }}
              </td>
            </tr>
            <tr v-if="!subscriptions.length && !loading">
              <td colspan="4" class="px-6 py-12 text-center text-gray-400 font-medium">No subscriptions found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Inquiries Tab ── -->
    <div v-if="activeTab === 'inquiries'" class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-50 flex items-center justify-between">
        <h3 class="font-bold text-gray-800">Contact Inquiries</h3>
        <button @click="fetchInquiries" class="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
          <RefreshCcw class="h-4 w-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50">
              <th class="px-6 py-4 text-[10px]  uppercase tracking-widest text-gray-400">User</th>
              <th class="px-6 py-4 text-[10px]  uppercase tracking-widest text-gray-400">Inquiry</th>
              <th class="px-6 py-4 text-[10px]  uppercase tracking-widest text-gray-400">Status</th>
              <th class="px-6 py-4 text-[10px]  uppercase tracking-widest text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="inq in inquiries" :key="inq._id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-900">{{ inq.name }}</span>
                  <span class="text-xs text-gray-400">{{ inq.email }}</span>
                </div>
              </td>
              <td class="px-6 py-4 max-w-xs">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-700 truncate">{{ inq.subject }}</span>
                  <span class="text-xs text-gray-400 line-clamp-1 mt-1">{{ inq.message }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="px-3 py-1 rounded-full text-[10px]  uppercase tracking-widest"
                  :class="getStatusClass(inq.status)"
                >
                  {{ inq.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button @click="selectedInquiry = inq" class="p-2 hover:bg-primary/5 rounded-lg text-primary transition-colors">
                    <Eye class="h-4 w-4" />
                  </button>
                  <button v-if="inq.status === 'new'" @click="updateStatus(inq._id, 'read')" class="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                    <CheckCircle2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!inquiries.length && !loading">
              <td colspan="4" class="px-6 py-12 text-center text-gray-400 font-medium">No inquiries found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Inquiry Detail Modal ── -->
    <div v-if="selectedInquiry" class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div class="p-8 lg:p-10 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-4">
             <div class="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
               <MessageSquare class="h-6 w-6" />
             </div>
             <div>
               <h3 class="text-xl  text-gray-900 tracking-tight">Inquiry Details</h3>
               <p class="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">Received on {{ new Date(selectedInquiry.createdAt).toLocaleString() }}</p>
             </div>
          </div>
          <button @click="selectedInquiry = null" class="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all">
            <X class="h-5 w-5" />
          </button>
        </div>
        
        <div class="p-8 lg:p-10 space-y-8 overflow-y-auto max-h-[60vh] no-scrollbar">
          <div class="grid grid-cols-2 gap-8">
            <div class="space-y-1">
              <p class="text-[9px]  uppercase tracking-widest text-gray-300 ml-1">From</p>
              <p class="text-sm  text-gray-900">{{ selectedInquiry.name }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[9px]  uppercase tracking-widest text-gray-300 ml-1">Email</p>
              <p class="text-sm font-bold text-primary">{{ selectedInquiry.email }}</p>
            </div>
          </div>

          <div class="space-y-1">
            <p class="text-[9px]  uppercase tracking-widest text-gray-300 ml-1">Subject</p>
            <p class="text-base  text-gray-900">{{ selectedInquiry.subject }}</p>
          </div>

          <div class="space-y-1">
            <p class="text-[9px]  uppercase tracking-widest text-gray-300 ml-1">Message</p>
            <div class="p-6 rounded-3xl bg-gray-50 text-sm text-gray-600 leading-relaxed font-medium">
              {{ selectedInquiry.message }}
            </div>
          </div>
        </div>

        <div class="p-8 lg:p-10 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div class="flex items-center gap-3">
             <span class="text-[10px]  uppercase tracking-widest text-gray-400">Update Status</span>
             <select 
               class="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 outline-none focus:border-primary transition-all"
               :value="selectedInquiry.status"
               @change="(e: any) => updateStatus(selectedInquiry._id, e.target.value)"
             >
               <option value="new">New</option>
               <option value="read">Read</option>
               <option value="replied">Replied</option>
               <option value="archived">Archived</option>
             </select>
           </div>
           
           <div class="flex items-center gap-4 w-full sm:w-auto">
             <a :href="`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`" class="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl  text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                <Mail class="h-4 w-4" /> Reply via Email
             </a>
           </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RefreshCcw, Eye, CheckCircle2, MessageSquare, X, Mail } from 'lucide-vue-next'
import { useManageSupport } from '@/composables/modules/support/useManageSupport'

const activeTab = ref('inquiries')
const selectedInquiry = ref<any>(null)
const tabs = [
  { id: 'inquiries', label: 'Inquiries' },
  { id: 'newsletter', label: 'Subscriptions' }
]

const { loading, subscriptions, inquiries, fetchSubscriptions, fetchInquiries, updateStatus } = useManageSupport()

const getStatusClass = (status: string) => {
  switch (status) {
    case 'new': return 'bg-blue-50 text-blue-600'
    case 'read': return 'bg-gray-50 text-gray-600'
    case 'replied': return 'bg-emerald-50 text-emerald-600'
    case 'archived': return 'bg-neutral-100 text-neutral-400'
    default: return 'bg-gray-50 text-gray-400'
  }
}

onMounted(() => {
  fetchInquiries()
  fetchSubscriptions()
})

definePageMeta({
  layout: 'admin',
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
