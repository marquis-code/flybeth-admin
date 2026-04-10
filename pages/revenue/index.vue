<template>
  <div class="space-y-10 pb-12 text-brand-gray">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
       <div class="space-y-1">
         <h1 class="text-3xl font-bold text-brand-blue tracking-tight">Financial performance</h1>
         <p class="text-brand-gray/60 font-medium text-sm">Settle transactions and monitor global revenue streams</p>
       </div>
       <div class="flex gap-3">
         <UiBaseButton variant="outline" size="md">
           Download ledger
         </UiBaseButton>
         <UiBaseButton variant="primary" size="lg">
           Initiate global settlement
         </UiBaseButton>
       </div>
    </div>

    <!-- Revenue Highlights -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <UiBaseCard padding class="!bg-brand-blue text-white overflow-hidden relative group">
        <div class="absolute -right-12 -bottom-12 h-40 w-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-premium" />
        <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 leading-none">Gross settled revenue</p>
        <h4 class="text-4xl font-bold leading-none">$2,405,820</h4>
        <div class="mt-8 flex items-center justify-between">
           <div class="flex flex-col">
              <span class="text-[10px] font-bold text-white/30 uppercase tracking-widest">Commission earned</span>
              <span class="text-lg font-bold text-brand-green tracking-tight">$360,873</span>
           </div>
           <div class="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center font-bold text-brand-green border border-white/5">+15%</div>
        </div>
      </UiBaseCard>

      <UiBaseCard padding class="flex flex-col justify-between">
        <div>
          <p class="text-[10px] font-bold text-brand-gray/40 uppercase tracking-widest mb-2 leading-none">Pending disbursements</p>
          <h4 class="text-4xl font-bold text-brand-blue leading-none">$142,400</h4>
        </div>
        <div class="mt-8">
           <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div class="bg-brand-blue h-full" style="width: 65%"></div>
           </div>
           <p class="text-[10px] font-bold text-brand-gray/40 uppercase tracking-widest mt-2">65% of monthly cycle completed</p>
        </div>
      </UiBaseCard>

      <UiBaseCard padding class="flex flex-col justify-between">
        <div>
          <p class="text-[10px] font-bold text-brand-gray/40 uppercase tracking-widest mb-2 leading-none">Average take-rate</p>
          <h4 class="text-4xl font-bold text-brand-blue leading-none">14.2%</h4>
        </div>
        <div class="mt-8 flex items-center space-x-2">
           <div v-for="i in 5" :key="i" class="flex-1 h-1 rounded-full" :class="i < 4 ? 'bg-brand-green' : 'bg-gray-100'"></div>
           <span class="text-[10px] font-bold text-brand-green uppercase tracking-widest ml-2">Above target</span>
        </div>
      </UiBaseCard>
    </div>

    <!-- Settlements Table -->
    <UiBaseCard>
      <div class="px-8 py-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 class="text-xl font-bold text-brand-blue">Global settlement ledger</h3>
        <div class="flex items-center space-x-4">
           <UiDatePicker v-model="filterDate" />
           <UiBaseButton variant="ghost" size="sm" class="!px-4 !py-2 border border-gray-100 font-bold text-xs uppercase tracking-widest hover:bg-gray-50">Filter</UiBaseButton>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50">
              <th class="px-8 py-5 text-[10px] font-bold text-brand-gray/50 uppercase tracking-widest">Transaction ID</th>
              <th class="px-8 py-5 text-[10px] font-bold text-brand-gray/50 uppercase tracking-widest">Agency source</th>
              <th class="px-8 py-5 text-[10px] font-bold text-brand-gray/50 uppercase tracking-widest">Total amount</th>
              <th class="px-8 py-5 text-[10px] font-bold text-brand-gray/50 uppercase tracking-widest">Comm. rate</th>
              <th class="px-8 py-5 text-[10px] font-bold text-brand-gray/50 uppercase tracking-widest">Net payout</th>
              <th class="px-8 py-5 text-[10px] font-bold text-brand-gray/50 uppercase tracking-widest">Settlement</th>
              <th class="px-8 py-5 text-right text-[10px] font-bold text-brand-gray/50 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-brand-blue/[0.01] transition-all duration-300 group">
              <td class="px-8 py-6 font-bold text-brand-blue/50 text-[11px]">{{ tx.id }}</td>
              <td class="px-8 py-6">
                <div class="text-sm font-bold text-brand-blue tracking-tight">{{ tx.agency }}</div>
                <div class="text-[10px] font-bold text-brand-gray/30 uppercase tracking-widest mt-0.5">{{ tx.date }}</div>
              </td>
              <td class="px-8 py-6 font-bold text-brand-blue text-sm tracking-tight">${{ tx.amount }}</td>
              <td class="px-8 py-6 text-xs font-bold text-brand-gray/60">{{ tx.rate }}%</td>
              <td class="px-8 py-6 font-bold text-brand-green text-sm tracking-tight">${{ tx.payout }}</td>
              <td class="px-8 py-6">
                <span class="px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest inline-block border bg-white" :class="tx.settled ? 'border-brand-green/20 text-brand-green bg-brand-green/5' : 'border-yellow-200 text-yellow-600 bg-yellow-50/50'">
                  {{ tx.settled ? 'Settled' : 'In transit' }}
                </span>
              </td>
              <td class="px-8 py-6 text-right">
                 <button class="bg-gray-50 text-brand-gray/40 hover:bg-brand-blue/5 hover:text-brand-blue h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-300">
                   <ArrowTopRightOnSquareIcon class="h-4 w-4" />
                 </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiBaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin'
})

const filterDate = ref('')

const transactions = [
  { id: 'TX-29381', agency: 'Elite Travel Group', amount: '12,405', rate: '15', payout: '1,860.75', settled: true, date: '14 Feb 2025' },
  { id: 'TX-29382', agency: 'Global Voyages', amount: '4,820', rate: '12', payout: '578.40', settled: true, date: '14 Feb 2025' },
  { id: 'TX-29383', agency: 'SkyHigh Agency', amount: '12,500', rate: '14.5', payout: '1,812.50', settled: false, date: '13 Feb 2025' },
  { id: 'TX-29384', agency: 'Budget Holidays', amount: '2,100', rate: '10', payout: '210.00', settled: true, date: '12 Feb 2025' },
  { id: 'TX-29385', agency: 'Luxe Escapes', amount: '35,000', rate: '18', payout: '6,300.00', settled: false, date: '12 Feb 2025' },
]
</script>
