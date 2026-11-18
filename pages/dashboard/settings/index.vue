<template>
  <div class="container mx-auto space-y-12 pb-24 text-brand-gray">
    <div class="flex flex-col sm:flex-row justify-between sm:items-end gap-6 bg-white border border-gray-200 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-none transition-premium">
      <div class="space-y-2">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p class="text-gray-500 font-medium text-xs sm:text-sm">Manage commissions, regional access, and infrastructure connectors.</p>
      </div>
      <div class="flex flex-wrap gap-3 w-full sm:w-auto">
        <UiBaseButton variant="outline" @click="fetchConfig" :loading="loading" class="flex-1 sm:flex-none">
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          Refresh
        </UiBaseButton>
        <UiBaseButton variant="primary" class="bg-gray-900 text-white flex-1 sm:flex-none sm:min-w-[160px] shadow-none" @click="saveConfig" :loading="saving">
          <SaveIcon class="h-4 w-4 mr-2" />
          Save Changes
        </UiBaseButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div class="lg:col-span-2 space-y-12">
        <!-- Commission & Service Fees -->
        <UiBaseCard padding>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
                <PercentIcon class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">Commission & Service Fees</h3>
                <p class="text-xs text-gray-500 font-medium">Configure flexible pricing rules: percentage (%) or fixed amounts for local vs foreign flights.</p>
              </div>
            </div>

            <!-- Segmented Route Switcher -->
            <div class="inline-flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
              <button 
                type="button"
                @click="activeFeeTab = 'domestic'"
                :class="activeFeeTab === 'domestic' ? 'bg-white text-gray-900 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900 font-medium'"
                class="px-4 py-2 text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <PlaneIcon class="h-3.5 w-3.5" />
                <span>Local Flights</span>
              </button>
              <button 
                type="button"
                @click="activeFeeTab = 'international'"
                :class="activeFeeTab === 'international' ? 'bg-white text-gray-900 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900 font-medium'"
                class="px-4 py-2 text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <GlobeIcon class="h-3.5 w-3.5" />
                <span>Foreign Flights</span>
              </button>
              <button 
                type="button"
                @click="activeFeeTab = 'global'"
                :class="activeFeeTab === 'global' ? 'bg-white text-gray-900 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900 font-medium'"
                class="px-4 py-2 text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <BriefcaseIcon class="h-3.5 w-3.5" />
                <span>Non-Flight Baseline</span>
              </button>
            </div>
          </div>

          <!-- LOCAL / DOMESTIC FLIGHTS -->
          <div v-if="activeFeeTab === 'domestic' && config.flightFees?.domestic" class="space-y-6">
            <div class="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl text-xs text-blue-900 flex items-center justify-between">
              <span class="font-medium">Rules below apply to <strong>domestic Nigerian flights</strong> (e.g. Lagos, Abuja, Port Harcourt, Kano).</span>
              <span class="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">Domestic Engine</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- B2B Fee -->
              <div class="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-gray-700 uppercase tracking-wider">Agency Fee (B2B)</label>
                  <div class="inline-flex bg-gray-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                    <button 
                      type="button"
                      @click="config.flightFees.domestic.b2bType = 'percentage'"
                      :class="config.flightFees.domestic.b2bType === 'percentage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
                      class="px-2 py-1 rounded-md transition-all"
                    >
                      %
                    </button>
                    <button 
                      type="button"
                      @click="config.flightFees.domestic.b2bType = 'fixed'"
                      :class="config.flightFees.domestic.b2bType === 'fixed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
                      class="px-2 py-1 rounded-md transition-all"
                    >
                      Fixed
                    </button>
                  </div>
                </div>
                <div class="relative group">
                  <input 
                    v-model.number="config.flightFees.domestic.b2bValue"
                    type="number" 
                    step="any"
                    class="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none"
                  />
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">
                    {{ config.flightFees.domestic.b2bType === 'percentage' ? '%' : 'Fixed' }}
                  </div>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">Applied to local bookings made by travel sub-agents.</p>
              </div>

              <!-- B2C Fee -->
              <div class="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-gray-700 uppercase tracking-wider">Platform Fee (B2C)</label>
                  <div class="inline-flex bg-gray-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                    <button 
                      type="button"
                      @click="config.flightFees.domestic.b2cType = 'percentage'"
                      :class="config.flightFees.domestic.b2cType === 'percentage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
                      class="px-2 py-1 rounded-md transition-all"
                    >
                      %
                    </button>
                    <button 
                      type="button"
                      @click="config.flightFees.domestic.b2cType = 'fixed'"
                      :class="config.flightFees.domestic.b2cType === 'fixed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
                      class="px-2 py-1 rounded-md transition-all"
                    >
                      Fixed
                    </button>
                  </div>
                </div>
                <div class="relative group">
                  <input 
                    v-model.number="config.flightFees.domestic.b2cValue"
                    type="number" 
                    step="any"
                    class="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none"
                  />
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">
                    {{ config.flightFees.domestic.b2cType === 'percentage' ? '%' : 'Fixed' }}
                  </div>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">Applied to direct customer local bookings.</p>
              </div>

              <!-- General Extra Margin -->
              <div class="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-gray-700 uppercase tracking-wider">Extra Margin</label>
                  <div class="inline-flex bg-gray-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                    <button 
                      type="button"
                      @click="config.flightFees.domestic.marginType = 'percentage'"
                      :class="config.flightFees.domestic.marginType === 'percentage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
                      class="px-2 py-1 rounded-md transition-all"
                    >
                      %
                    </button>
                    <button 
                      type="button"
                      @click="config.flightFees.domestic.marginType = 'fixed'"
                      :class="config.flightFees.domestic.marginType === 'fixed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
                      class="px-2 py-1 rounded-md transition-all"
                    >
                      Fixed
                    </button>
                  </div>
                </div>
                <div class="relative group">
                  <input 
                    v-model.number="config.flightFees.domestic.marginValue"
                    type="number" 
                    step="any"
                    class="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none"
                  />
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">
                    {{ config.flightFees.domestic.marginType === 'percentage' ? '%' : 'Fixed' }}
                  </div>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">Platform markup over local airline net fares.</p>
              </div>
            </div>
          </div>

          <!-- FOREIGN / INTERNATIONAL FLIGHTS -->
          <div v-else-if="activeFeeTab === 'international' && config.flightFees?.international" class="space-y-6">
            <div class="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-xs text-emerald-900 flex items-center justify-between">
              <span class="font-medium">Rules below apply to <strong>cross-border and foreign flights</strong> (e.g. London, New York, Dubai, Paris).</span>
              <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">International Engine</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- B2B Fee -->
              <div class="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-gray-700 uppercase tracking-wider">Agency Fee (B2B)</label>
                  <div class="inline-flex bg-gray-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                    <button 
                      type="button"
                      @click="config.flightFees.international.b2bType = 'percentage'"
                      :class="config.flightFees.international.b2bType === 'percentage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
                      class="px-2 py-1 rounded-md transition-all"
                    >
                      %
                    </button>
                    <button 
                      type="button"
                      @click="config.flightFees.international.b2bType = 'fixed'"
                      :class="config.flightFees.international.b2bType === 'fixed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
                      class="px-2 py-1 rounded-md transition-all"
                    >
                      Fixed
                    </button>
                  </div>
                </div>
                <div class="relative group">
                  <input 
                    v-model.number="config.flightFees.international.b2bValue"
                    type="number" 
                    step="any"
                    class="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none"
                  />
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">
                    {{ config.flightFees.international.b2bType === 'percentage' ? '%' : 'Fixed' }}
                  </div>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">Applied to foreign bookings made by travel sub-agents.</p>
              </div>

              <!-- B2C Fee -->
              <div class="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-gray-700 uppercase tracking-wider">Platform Fee (B2C)</label>
                  <div class="inline-flex bg-gray-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                    <button 
                      type="button"
                      @click="config.flightFees.international.b2cType = 'percentage'"
                      :class="config.flightFees.international.b2cType === 'percentage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
                      class="px-2 py-1 rounded-md transition-all"
                    >
                      %
                    </button>
                    <button 
                      type="button"
                      @click="config.flightFees.international.b2cType = 'fixed'"
                      :class="config.flightFees.international.b2cType === 'fixed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
                      class="px-2 py-1 rounded-md transition-all"
                    >
                      Fixed
                    </button>
                  </div>
                </div>
                <div class="relative group">
                  <input 
                    v-model.number="config.flightFees.international.b2cValue"
                    type="number" 
                    step="any"
                    class="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none"
                  />
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">
                    {{ config.flightFees.international.b2cType === 'percentage' ? '%' : 'Fixed' }}
                  </div>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">Applied to direct customer foreign bookings.</p>
              </div>

              <!-- General Extra Margin -->
              <div class="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-gray-700 uppercase tracking-wider">Extra Margin</label>
                  <div class="inline-flex bg-gray-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                    <button 
                      type="button"
                      @click="config.flightFees.international.marginType = 'percentage'"
                      :class="config.flightFees.international.marginType === 'percentage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
                      class="px-2 py-1 rounded-md transition-all"
                    >
                      %
                    </button>
                    <button 
                      type="button"
                      @click="config.flightFees.international.marginType = 'fixed'"
                      :class="config.flightFees.international.marginType === 'fixed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
                      class="px-2 py-1 rounded-md transition-all"
                    >
                      Fixed
                    </button>
                  </div>
                </div>
                <div class="relative group">
                  <input 
                    v-model.number="config.flightFees.international.marginValue"
                    type="number" 
                    step="any"
                    class="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none"
                  />
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">
                    {{ config.flightFees.international.marginType === 'percentage' ? '%' : 'Fixed' }}
                  </div>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">Platform markup over international supplier fares.</p>
              </div>
            </div>
          </div>

          <!-- GLOBAL / NON-FLIGHT BASELINE -->
          <div v-else class="space-y-6">
            <div class="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-600 flex items-center justify-between">
              <span class="font-medium">Baseline rates for non-flight services (Hotels, Transfers, Activities, Car Rentals).</span>
              <span class="text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-200 px-2 py-0.5 rounded-md">Baseline Services</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200">
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block">Agency Fee (B2B)</label>
                <div class="relative group">
                  <input 
                    v-model.number="config.b2bCommission"
                    type="number" 
                    class="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none"
                  />
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</div>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">Applied to bookings made by sub-agents.</p>
              </div>

              <div class="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200">
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block">Platform Fee (B2C)</label>
                <div class="relative group">
                  <input 
                    v-model.number="config.b2cCommission"
                    type="number" 
                    class="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none"
                  />
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</div>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">Applied to direct consumer bookings.</p>
              </div>

              <div class="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200">
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block">General Extra Margin</label>
                <div class="relative group">
                  <input 
                    v-model.number="config.ancillaryMargin"
                    type="number" 
                    class="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none"
                  />
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</div>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">Service markup on top of provider costs.</p>
              </div>
            </div>
          </div>
        </UiBaseCard>

        <!-- Agency Fee Taxonomy & Legal Refund Protection -->
        <UiBaseCard padding>
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <ShieldCheckIcon class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">Agency Fee Taxonomy & Legal Refund Protection</h3>
                <p class="text-xs text-gray-500 font-medium">Protect Flybeth LLC against customer lawsuits, DOT disputes, and bank chargebacks upon flight cancellations.</p>
              </div>
            </div>
            <span class="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase rounded-lg">
              Legal Compliance
            </span>
          </div>

          <div class="space-y-6">
            <div class="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
              <p class="font-bold flex items-center gap-1.5">
                <AlertCircleIcon class="w-4 h-4 text-amber-700" />
                Why explicit fee naming is legally critical:
              </p>
              <p class="text-amber-800 leading-relaxed">
                When a passenger requests a flight refund, airlines only refund the carrier base fare and refundable taxes. If Flybeth's commission is hidden or unlabeled, passengers can dispute the deduction as unauthorized withholding. Naming our agency fee explicitly on checkout and receipts legally establishes it as a non-refundable service fee for booking and fulfillment.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Agency Fee Label -->
              <div class="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200">
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block">Customer-Facing Fee Label</label>
                <input 
                  v-model="config.agencyFeeLabel"
                  type="text" 
                  placeholder="e.g. Agency Booking & Service Fee"
                  class="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none"
                />
                <div class="flex flex-wrap gap-2 pt-1">
                  <span class="text-[10px] text-gray-400 font-bold self-center">Presets:</span>
                  <button 
                    type="button" 
                    @click="config.agencyFeeLabel = 'Agency Booking & Service Fee'"
                    class="text-[10px] bg-white border border-gray-200 hover:border-indigo-400 px-2 py-0.5 rounded-md font-semibold text-gray-600 transition-colors"
                  >
                    Agency Booking & Service Fee
                  </button>
                  <button 
                    type="button" 
                    @click="config.agencyFeeLabel = 'Flybeth Agency & Ticketing Fee'"
                    class="text-[10px] bg-white border border-gray-200 hover:border-indigo-400 px-2 py-0.5 rounded-md font-semibold text-gray-600 transition-colors"
                  >
                    Flybeth Agency & Ticketing Fee
                  </button>
                  <button 
                    type="button" 
                    @click="config.agencyFeeLabel = 'Technology & Reservation Fulfillment Fee'"
                    class="text-[10px] bg-white border border-gray-200 hover:border-indigo-400 px-2 py-0.5 rounded-md font-semibold text-gray-600 transition-colors"
                  >
                    Technology & Fulfillment Fee
                  </button>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">This exact label appears on checkout summaries, payment cards, and official receipts.</p>
              </div>

              <!-- Refund Status Summary -->
              <div class="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200 flex flex-col justify-between">
                <div>
                  <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Fare Components & Refund Status</label>
                  <ul class="text-xs space-y-2">
                    <li class="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200">
                      <span class="font-semibold text-gray-700">Airline Base Fare:</span>
                      <span class="text-blue-600 font-bold">Subject to Airline Rules</span>
                    </li>
                    <li class="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200">
                      <span class="font-semibold text-gray-700">Taxes & Mandatory Fees:</span>
                      <span class="text-blue-600 font-bold">Refundable if Flight Unused</span>
                    </li>
                    <li class="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span class="font-bold text-emerald-950">{{ config.agencyFeeLabel || 'Agency Fee' }}:</span>
                      <span class="text-amber-700 font-black uppercase text-[11px]">100% Non-Refundable</span>
                    </li>
                  </ul>
                </div>
                <p class="text-[11px] text-gray-500">Itemized separately on all electronic tickets and invoices.</p>
              </div>
            </div>

            <!-- Non-Refundable Legal Policy Textarea -->
            <div class="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200">
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block">Official Non-Refundable Disclosure Statement</label>
              <textarea 
                v-model="config.nonRefundableDisclaimer"
                rows="3"
                class="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium leading-relaxed"
                placeholder="Enter official non-refundable policy statement..."
              ></textarea>
              <p class="text-xs text-gray-500">This legal text is printed on official e-tickets, tax receipts, and booking confirmation pages.</p>
            </div>
          </div>
        </UiBaseCard>

        <!-- Extra Services Pricing -->
        <UiBaseCard padding>
          <div class="flex items-center space-x-3 mb-8">
            <div class="h-10 w-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
              <BriefcaseIcon class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">Extra Services Pricing</h3>
              <p class="text-xs text-gray-500 font-medium">Configure fixed dollar rates ($) or percentage (%) of base fare for trip add-ons.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Extra Baggage -->
            <div class="space-y-3 bg-gray-50/60 p-4 rounded-2xl border border-gray-200">
              <div class="flex items-center justify-between gap-2">
                <label class="text-xs font-bold text-gray-600 uppercase tracking-wider block">Extra Baggage</label>
                <div class="inline-flex bg-gray-200/80 p-0.5 rounded-lg text-[10px] font-bold shrink-0">
                  <button 
                    type="button"
                    @click="setAncillaryType('bags', 'fixed')"
                    :class="(config.ancillaryPricingTypes?.bags || 'fixed') === 'fixed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                    class="px-2 py-0.5 rounded-md transition-all">
                    Fixed ($)
                  </button>
                  <button 
                    type="button"
                    @click="setAncillaryType('bags', 'percentage')"
                    :class="config.ancillaryPricingTypes?.bags === 'percentage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                    class="px-2 py-0.5 rounded-md transition-all">
                    %
                  </button>
                </div>
              </div>
              <div class="relative group">
                <span v-if="(config.ancillaryPricingTypes?.bags || 'fixed') === 'fixed'" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input v-model.number="config.ancillaryPrices.bags" type="number" :step="config.ancillaryPricingTypes?.bags === 'percentage' ? '0.1' : '1'" min="0"
                  :class="(config.ancillaryPricingTypes?.bags || 'fixed') === 'fixed' ? 'pl-8 pr-4' : 'pl-4 pr-8'"
                  class="w-full bg-white border border-gray-200 rounded-xl py-3.5 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none" />
                <span v-if="config.ancillaryPricingTypes?.bags === 'percentage'" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
              <p class="text-[11px] text-gray-400 leading-tight">
                {{ config.ancillaryPricingTypes?.bags === 'percentage' ? 'Percentage of ticket base fare' : 'Fixed fee per additional checked bag' }}
              </p>
            </div>

            <!-- Seat Selection -->
            <div class="space-y-3 bg-gray-50/60 p-4 rounded-2xl border border-gray-200">
              <div class="flex items-center justify-between gap-2">
                <label class="text-xs font-bold text-gray-600 uppercase tracking-wider block">Seat Selection</label>
                <div class="inline-flex bg-gray-200/80 p-0.5 rounded-lg text-[10px] font-bold shrink-0">
                  <button 
                    type="button"
                    @click="setAncillaryType('seats', 'fixed')"
                    :class="(config.ancillaryPricingTypes?.seats || 'fixed') === 'fixed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                    class="px-2 py-0.5 rounded-md transition-all">
                    Fixed ($)
                  </button>
                  <button 
                    type="button"
                    @click="setAncillaryType('seats', 'percentage')"
                    :class="config.ancillaryPricingTypes?.seats === 'percentage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                    class="px-2 py-0.5 rounded-md transition-all">
                    %
                  </button>
                </div>
              </div>
              <div class="relative group">
                <span v-if="(config.ancillaryPricingTypes?.seats || 'fixed') === 'fixed'" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input v-model.number="config.ancillaryPrices.seats" type="number" :step="config.ancillaryPricingTypes?.seats === 'percentage' ? '0.1' : '1'" min="0"
                  :class="(config.ancillaryPricingTypes?.seats || 'fixed') === 'fixed' ? 'pl-8 pr-4' : 'pl-4 pr-8'"
                  class="w-full bg-white border border-gray-200 rounded-xl py-3.5 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none" />
                <span v-if="config.ancillaryPricingTypes?.seats === 'percentage'" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
              <p class="text-[11px] text-gray-400 leading-tight">
                {{ config.ancillaryPricingTypes?.seats === 'percentage' ? 'Percentage of ticket base fare' : 'Fixed baseline seat selection fee' }}
              </p>
            </div>

            <!-- Travel Insurance -->
            <div class="space-y-3 bg-gray-50/60 p-4 rounded-2xl border border-gray-200">
              <div class="flex items-center justify-between gap-2">
                <label class="text-xs font-bold text-gray-600 uppercase tracking-wider block">Travel Insurance</label>
                <div class="inline-flex bg-gray-200/80 p-0.5 rounded-lg text-[10px] font-bold shrink-0">
                  <button 
                    type="button"
                    @click="setAncillaryType('insurance', 'fixed')"
                    :class="(config.ancillaryPricingTypes?.insurance || 'fixed') === 'fixed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                    class="px-2 py-0.5 rounded-md transition-all">
                    Fixed ($)
                  </button>
                  <button 
                    type="button"
                    @click="setAncillaryType('insurance', 'percentage')"
                    :class="config.ancillaryPricingTypes?.insurance === 'percentage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                    class="px-2 py-0.5 rounded-md transition-all">
                    %
                  </button>
                </div>
              </div>
              <div class="relative group">
                <span v-if="(config.ancillaryPricingTypes?.insurance || 'fixed') === 'fixed'" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input v-model.number="config.ancillaryPrices.insurance" type="number" :step="config.ancillaryPricingTypes?.insurance === 'percentage' ? '0.1' : '1'" min="0"
                  :class="(config.ancillaryPricingTypes?.insurance || 'fixed') === 'fixed' ? 'pl-8 pr-4' : 'pl-4 pr-8'"
                  class="w-full bg-white border border-gray-200 rounded-xl py-3.5 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none" />
                <span v-if="config.ancillaryPricingTypes?.insurance === 'percentage'" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
              <p class="text-[11px] text-gray-400 leading-tight">
                {{ config.ancillaryPricingTypes?.insurance === 'percentage' ? 'Percentage of ticket base fare' : 'Fixed policy premium per passenger' }}
              </p>
            </div>

            <!-- VIP Support -->
            <div class="space-y-3 bg-gray-50/60 p-4 rounded-2xl border border-gray-200">
              <div class="flex items-center justify-between gap-2">
                <label class="text-xs font-bold text-gray-600 uppercase tracking-wider block">VIP Support</label>
                <div class="inline-flex bg-gray-200/80 p-0.5 rounded-lg text-[10px] font-bold shrink-0">
                  <button 
                    type="button"
                    @click="setAncillaryType('vipSupport', 'fixed')"
                    :class="(config.ancillaryPricingTypes?.vipSupport || 'fixed') === 'fixed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                    class="px-2 py-0.5 rounded-md transition-all">
                    Fixed ($)
                  </button>
                  <button 
                    type="button"
                    @click="setAncillaryType('vipSupport', 'percentage')"
                    :class="config.ancillaryPricingTypes?.vipSupport === 'percentage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                    class="px-2 py-0.5 rounded-md transition-all">
                    %
                  </button>
                </div>
              </div>
              <div class="relative group">
                <span v-if="(config.ancillaryPricingTypes?.vipSupport || 'fixed') === 'fixed'" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input v-model.number="config.ancillaryPrices.vipSupport" type="number" :step="config.ancillaryPricingTypes?.vipSupport === 'percentage' ? '0.1' : '1'" min="0"
                  :class="(config.ancillaryPricingTypes?.vipSupport || 'fixed') === 'fixed' ? 'pl-8 pr-4' : 'pl-4 pr-8'"
                  class="w-full bg-white border border-gray-200 rounded-xl py-3.5 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-none" />
                <span v-if="config.ancillaryPricingTypes?.vipSupport === 'percentage'" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
              <p class="text-[11px] text-gray-400 leading-tight">
                {{ config.ancillaryPricingTypes?.vipSupport === 'percentage' ? 'Percentage of ticket base fare' : 'Fixed concierge assistance fee' }}
              </p>
            </div>
          </div>
        </UiBaseCard>

        <!-- Corporate Profile & Registered Business Address -->
        <UiBaseCard padding>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <BuildingIcon class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">Corporate & Business Profile</h3>
                <p class="text-xs text-gray-500 font-medium">Registered corporate headquarters address & details used across checkout, invoices, and confirmation emails.</p>
              </div>
            </div>
            <button 
              type="button" 
              @click="saveConfig" 
              :disabled="saving"
              class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
            >
              <SaveIcon class="h-4 w-4" />
              <span>Save Profile</span>
            </button>
          </div>

          <div v-if="config.companyAddress" class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Business / Platform Name</label>
              <input 
                v-model="config.platformName" 
                type="text" 
                placeholder="Flybeth LLC"
                class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>

            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Support Hotline Phone</label>
              <input 
                v-model="config.companyAddress.phone" 
                type="text" 
                placeholder="+1 (844) FLYBETH"
                class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>

            <div class="md:col-span-2">
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Street Address</label>
              <input 
                v-model="config.companyAddress.street" 
                type="text" 
                placeholder="1500 S Dairy Ashford Road"
                class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>

            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Suite / Unit / Floor</label>
              <input 
                v-model="config.companyAddress.suite" 
                type="text" 
                placeholder="Suite 207 # 703"
                class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>

            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">City</label>
              <input 
                v-model="config.companyAddress.city" 
                type="text" 
                placeholder="Houston"
                class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>

            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">State / Region</label>
              <input 
                v-model="config.companyAddress.state" 
                type="text" 
                placeholder="TX"
                class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Postal / ZIP Code</label>
                <input 
                  v-model="config.companyAddress.postalCode" 
                  type="text" 
                  placeholder="77077"
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
                />
              </div>
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Country</label>
                <input 
                  v-model="config.companyAddress.country" 
                  type="text" 
                  placeholder="United States"
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
                />
              </div>
            </div>
          </div>
        </UiBaseCard>

        <!-- Bank Accounts & Settlement Instructions -->
        <UiBaseCard padding>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <LandmarkIcon class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">Bank & Settlement Accounts</h3>
                <p class="text-xs text-gray-500 font-medium">Configure account numbers, banks, and Zelle instructions for customer transfers & invoices.</p>
              </div>
            </div>
            <button 
              type="button"
              @click="openAddAccountModal"
              class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              <PlusIcon class="h-4 w-4" />
              <span>Add Account</span>
            </button>
          </div>

          <!-- Accounts List -->
          <div v-if="!config.bankAccounts || config.bankAccounts.length === 0" class="text-center py-10 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
            <LandmarkIcon class="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p class="text-sm font-bold text-gray-700">No settlement accounts configured</p>
            <p class="text-xs text-gray-400 mt-1 mb-4">Add a bank account to receive customer wire transfers and invoices.</p>
            <button 
              type="button" 
              @click="openAddAccountModal" 
              class="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              + Add First Account
            </button>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="(acc, idx) in config.bankAccounts" 
              :key="idx" 
              class="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 hover:border-gray-300 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span 
                      class="px-2.5 py-1 rounded-lg text-[11px] font-black tracking-wider uppercase"
                      :class="acc.currency === 'USD' ? 'bg-emerald-100 text-emerald-800' : acc.currency === 'NGN' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'"
                    >
                      {{ acc.currency || 'USD' }}
                    </span>
                    <span 
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                      :class="acc.isActive !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-400 border border-gray-200'"
                    >
                      {{ acc.isActive !== false ? 'Active' : 'Disabled' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button 
                      type="button" 
                      @click="editAccount(idx)" 
                      class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                      title="Edit Account"
                    >
                      <EditIcon class="h-4 w-4" />
                    </button>
                    <button 
                      type="button" 
                      @click="deleteAccount(idx)" 
                      class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Delete Account"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div class="space-y-1 mb-3">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h4 class="text-base font-bold text-gray-900 leading-snug">{{ acc.bankName || 'Bank Name' }}</h4>
                    <span 
                      v-if="acc.label"
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      {{ acc.label }}
                    </span>
                  </div>
                  <p class="text-xs font-medium text-gray-500">{{ acc.accountName || 'Beneficiary Name' }}</p>
                </div>

                <div class="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between mb-3">
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Account Number</span>
                    <span class="text-base font-mono font-black text-gray-900 tracking-wide">{{ acc.accountNumber || '—' }}</span>
                  </div>
                  <button 
                    type="button" 
                    @click="copyAccountNumber(acc.accountNumber)"
                    class="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                    title="Copy Account Number"
                  >
                    <CopyIcon class="h-3.5 w-3.5" />
                  </button>
                </div>

                <div v-if="acc.routingNumber || acc.swiftCode" class="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div v-if="acc.routingNumber" class="bg-gray-50/80 p-2 rounded-lg border border-gray-100">
                    <span class="text-[10px] font-bold uppercase text-gray-400 block">Routing / Sort</span>
                    <span class="font-mono font-bold text-gray-800">{{ acc.routingNumber }}</span>
                  </div>
                  <div v-if="acc.swiftCode" class="bg-gray-50/80 p-2 rounded-lg border border-gray-100">
                    <span class="text-[10px] font-bold uppercase text-gray-400 block">SWIFT / BIC</span>
                    <span class="font-mono font-bold text-gray-800">{{ acc.swiftCode }}</span>
                  </div>
                </div>

                <div v-if="acc.instructions" class="text-xs text-gray-500 bg-blue-50/40 border border-blue-100/70 rounded-xl p-2.5 leading-relaxed">
                  <span class="font-bold text-blue-900 block mb-0.5 text-[11px]">Instructions / Memo:</span>
                  {{ acc.instructions }}
                </div>
              </div>

              <!-- Quick Active Toggle -->
              <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-500">Live for Customers</span>
                <button 
                  type="button"
                  @click="toggleAccountActive(idx)"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
                  :class="acc.isActive !== false ? 'bg-emerald-500' : 'bg-gray-200'"
                >
                  <span 
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="acc.isActive !== false ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </div>
        </UiBaseCard>

        <!-- Geo-Fencing -->
        <UiBaseCard padding>
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green">
                <GlobeIcon class="h-5 w-5" />
              </div>
              <h3 class="text-xl font-bold text-gray-900">Regional Bypassing</h3>
            </div>
            <div @click="config.isWhitelistingEnabled = !config.isWhitelistingEnabled" class="flex items-center space-x-4 cursor-pointer group">
              <span class="text-sm font-bold uppercase  text-gray-400 group-hover:text-gray-900 transition-premium">
                {{ config.isWhitelistingEnabled ? 'Restrictive Mode' : 'Global Access' }}
              </span>
              <div class="w-12 h-6 rounded-full border border-gray-200 relative transition-premium p-1" :class="config.isWhitelistingEnabled ? 'bg-brand-green' : 'bg-gray-100'">
                <div class="h-4 w-4 bg-white rounded-full transition-premium shadow-none" :class="{ 'translate-x-6': config.isWhitelistingEnabled }"></div>
              </div>
            </div>
          </div>

          <div class="space-y-8" :class="{ 'opacity-40 grayscale pointer-events-none': !config.isWhitelistingEnabled }">
            <div class="space-y-5">
              <label class="text-sm font-bold text-gray-400 uppercase  block ml-1">Operational Whitelist (States/Regions)</label>
              <div class="flex flex-wrap gap-3">
                <div 
                  v-for="state in config.whitelistedStates" 
                  :key="state"
                  class="flex items-center px-5 py-3 bg-white border border-gray-200 rounded-2xl text-[11px] font-bold text-gray-900 shadow-none hover:border-brand-blue group transition-premium"
                >
                  <span class="mr-4">{{ state }}</span>
                  <button @click="removeState(state)" class="h-5 w-5 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-500 transition-premium">
                    <XIcon class="h-3 w-3" />
                  </button>
                </div>
                <div class="relative flex-1 min-w-[240px]">
                  <input 
                    v-model="newState"
                    @keyup.enter="addState"
                    type="text" 
                    placeholder="Search or add region..."
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/5 transition-premium"
                  />
                  <PlusIcon @click="addState" class="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 hover:text-brand-blue cursor-pointer transition-premium" />
                </div>
              </div>
            </div>
          </div>
        </UiBaseCard>

        <!-- Infrastructure Connectors -->
        <UiBaseCard padding>
          <div class="flex items-center space-x-3 mb-8">
            <div class="h-10 w-10 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
              <CloudIcon class="h-5 w-5" />
            </div>
            <h3 class="text-xl font-bold text-gray-900">Infrastructure Connectors</h3>
          </div>

          <div class="space-y-6">
            <div v-if="loading" class="space-y-4">
              <div v-for="i in 3" :key="i" class="h-20 bg-gray-50 animate-pulse rounded-[2rem]"></div>
            </div>
            <div v-else v-for="api in integrationsList" :key="api.name" class="flex items-center justify-between p-7 bg-gray-50/50 rounded-[2rem] border border-gray-200 hover:border-brand-blue/20 transition-premium group">
               <div class="flex items-center space-x-6">
                  <div class="h-14 w-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-brand-blue shadow-none group-hover:scale-110 transition-premium">
                     <CloudIcon class="h-6 w-6" />
                  </div>
                  <div>
                     <p class="text-base font-bold text-gray-900 ">{{ api.displayName || api.name }}</p>
                     <p class="text-sm font-bold text-gray-400 uppercase  mt-1">{{ api.name }} gateway</p>
                  </div>
               </div>
               <div class="flex items-center space-x-6">
                  <span :class="[api.enabled ? 'text-brand-green bg-brand-green/5 border-brand-green/10' : 'text-gray-400 bg-gray-100 border-gray-200']" class="text-xs font-bold px-4 py-2 rounded-xl  flex items-center border">
                     <div :class="[api.enabled ? 'bg-brand-green animate-pulse' : 'bg-gray-300']" class="h-1.5 w-1.5 rounded-full mr-2"></div>
                     {{ api.enabled ? 'Operational' : 'Secured' }}
                  </span>
                  <button 
                    @click="toggleProvider(api.name, !api.enabled)"
                    :class="[api.enabled ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border-gray-200 shadow-none']"
                    class="h-11 px-6 flex items-center justify-center rounded-xl border transition-premium text-xs font-bold  hover:scale-105 active:scale-95"
                  >
                     {{ api.enabled ? 'Deactivate' : 'Activate' }}
                  </button>
               </div>
            </div>
          </div>
        </UiBaseCard>

        <!-- Department Management -->
        <UiBaseCard padding>
          <div class="flex items-center space-x-3 mb-8">
            <div class="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
              <UsersIcon class="h-5 w-5" />
            </div>
            <h3 class="text-xl font-bold text-gray-900">Support Departments</h3>
          </div>
          
          <div class="flex items-center justify-between p-7 bg-gray-50/50 rounded-[2rem] border border-gray-200 hover:border-indigo-500/20 transition-premium group">
             <div class="flex items-center space-x-6">
                <div>
                   <p class="text-base font-bold text-gray-900">Manage Departments</p>
                   <p class="text-sm font-medium text-gray-400 mt-1">Add, edit, and assign agents to support routing departments.</p>
                </div>
             </div>
             <div>
                <NuxtLink to="/dashboard/settings/departments" class="h-11 px-6 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-900 shadow-none text-xs font-bold hover:bg-gray-50 transition-premium">
                   Manage
                </NuxtLink>
             </div>
          </div>
        </UiBaseCard>
      </div>

      <!-- Right Sidebar -->
      <div class="space-y-12">
        <div class="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-200 space-y-8">
           <h4 class="text-xs font-bold text-gray-400 uppercase ">System Status</h4>
           <div class="space-y-4">
              <div v-for="env in ['Flight Engine 4.0', 'Booking Gateway', 'Margin Resolver']" :key="env" class="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-2xl shadow-none hover:border-brand-blue/20 transition-premium">
                 <span class="text-xs font-bold text-gray-700 ">{{ env }}</span>
                 <div class="flex items-center">
                    <span class="text-[9px] font-bold text-emerald-500 uppercase mr-3 ">Active</span>
                    <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-none"></div>
                 </div>
              </div>
           </div>
           <p class="text-sm text-center text-gray-400 font-medium">Platform version: 2026.04.1</p>
        </div>
      </div>
    </div>

    <!-- Modal for Adding / Editing Bank Account -->
    <Teleport to="body">
      <div v-if="showAccountModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        <div class="bg-white rounded-[2rem] border border-gray-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6" @click.stop>
          <div class="flex items-center justify-between pb-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <LandmarkIcon class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900">{{ editingAccountIndex !== null ? 'Edit Settlement Account' : 'Add Settlement Account' }}</h3>
                <p class="text-xs text-gray-500">Configure bank transfer and Zelle destination details.</p>
              </div>
            </div>
            <button @click="showAccountModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50">
              <XIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <!-- Currency selection -->
            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Currency</label>
              <div class="flex flex-wrap gap-2 mb-2">
                <button 
                  v-for="curr in ['USD', 'NGN', 'GBP', 'EUR', 'CAD']" 
                  :key="curr"
                  type="button"
                  @click="accountForm.currency = curr"
                  class="px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all"
                  :class="accountForm.currency === curr ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'"
                >
                  {{ curr }}
                </button>
              </div>
              <input 
                v-model="accountForm.currency" 
                type="text" 
                placeholder="e.g. USD, NGN, GBP" 
                class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-bold text-gray-900 uppercase focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>

            <!-- Account Purpose / Label -->
            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Account Purpose / Label</label>
              <input 
                v-model="accountForm.label" 
                type="text" 
                placeholder="e.g. Business Account for International Payments" 
                class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>

            <!-- Bank Name -->
            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Bank Name *</label>
              <input 
                v-model="accountForm.bankName" 
                type="text" 
                placeholder="e.g. Wells Fargo, Wema Bank, Access Bank" 
                class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>

            <!-- Account Name -->
            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Account Holder Name *</label>
              <input 
                v-model="accountForm.accountName" 
                type="text" 
                placeholder="e.g. Flybeth Limited" 
                class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>

            <!-- Account Number -->
            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Account Number / IBAN *</label>
              <input 
                v-model="accountForm.accountNumber" 
                type="text" 
                placeholder="e.g. 0620862082 or IBAN" 
                class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-mono font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>

            <!-- Routing and SWIFT in 2 cols -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Routing / Sort Code</label>
                <input 
                  v-model="accountForm.routingNumber" 
                  type="text" 
                  placeholder="e.g. 021000021" 
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-mono font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
                />
              </div>
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">SWIFT / BIC</label>
                <input 
                  v-model="accountForm.swiftCode" 
                  type="text" 
                  placeholder="e.g. CHASUS33" 
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-mono font-medium text-gray-900 uppercase focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
                />
              </div>
            </div>

            <!-- Instructions / Zelle Memo -->
            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Instructions / Zelle Memo</label>
              <textarea 
                v-model="accountForm.instructions" 
                rows="2"
                placeholder="e.g. Zelle: payments@flybeth.com. Please include booking reference in memo." 
                class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none"
              ></textarea>
            </div>

            <!-- Active Toggle -->
            <div class="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <span class="text-xs font-bold text-gray-900 block">Enable for customer checkout</span>
                <span class="text-[11px] text-gray-500">Disabled accounts will not be shown to customers.</span>
              </div>
              <button 
                type="button"
                @click="accountForm.isActive = !accountForm.isActive"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
                :class="accountForm.isActive ? 'bg-emerald-500' : 'bg-gray-200'"
              >
                <span 
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="accountForm.isActive ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              @click="showAccountModal = false" 
              class="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="button" 
              @click="saveAccount" 
              :disabled="!accountForm.bankName || !accountForm.accountNumber || !accountForm.accountName"
              class="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-sm"
            >
              {{ editingAccountIndex !== null ? 'Update Account' : 'Save Account' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  RefreshCw as RefreshCwIcon,
  Save as SaveIcon,
  Percent as PercentIcon,
  Globe as GlobeIcon,
  Plane as PlaneIcon,
  X as XIcon,
  Plus as PlusIcon,
  Cloud as CloudIcon,
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  Landmark as LandmarkIcon,
  Building2 as BuildingIcon,
  Edit3 as EditIcon,
  Trash2 as TrashIcon,
  Copy as CopyIcon,
  ShieldCheck as ShieldCheckIcon,
  AlertCircle as AlertCircleIcon
} from 'lucide-vue-next'
import { useAdminSettings } from '@/composables/modules/admin/useAdminSettings'
import { useCustomToast } from '@/composables/core/useCustomToast'

const { showToast } = useCustomToast()

const { 
  loading, 
  saving, 
  config, 
  integrationsList, 
  fetchConfig, 
  saveConfig: apiSaveConfig, 
  fetchIntegrations, 
  toggleProvider 
} = useAdminSettings()

const activeFeeTab = ref<'domestic' | 'international' | 'global'>('domestic')
const newState = ref('')

const showAccountModal = ref(false)
const editingAccountIndex = ref<number | null>(null)
const accountForm = ref({
  currency: 'USD',
  label: '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  routingNumber: '',
  swiftCode: '',
  instructions: '',
  isActive: true
})

const openAddAccountModal = () => {
  editingAccountIndex.value = null
  accountForm.value = {
    currency: 'USD',
    label: 'Wells Fargo Corporate Account',
    bankName: 'Wells Fargo',
    accountName: 'FLYBETH LLC',
    accountNumber: '',
    routingNumber: '',
    swiftCode: '',
    instructions: 'Business account for International payments. Please include your Booking Reference in the transfer memo.',
    isActive: true
  }
  showAccountModal.value = true
}

const editAccount = (idx: number) => {
  editingAccountIndex.value = idx
  const item = config.value.bankAccounts[idx]
  accountForm.value = {
    currency: item.currency || 'USD',
    label: item.label || (item.currency === 'USD' ? 'Business Account for International Payments' : ''),
    bankName: item.bankName || '',
    accountName: item.accountName || '',
    accountNumber: item.accountNumber || '',
    routingNumber: item.routingNumber || '',
    swiftCode: item.swiftCode || '',
    instructions: item.instructions || '',
    isActive: item.isActive !== false
  }
  showAccountModal.value = true
}

const deleteAccount = async (idx: number) => {
  if (confirm('Are you sure you want to remove this settlement account?')) {
    config.value.bankAccounts.splice(idx, 1)
    await apiSaveConfig(config.value)
    showToast({ title: 'Account Removed', message: 'Bank account deleted successfully.', toastType: 'success' })
  }
}

const toggleAccountActive = async (idx: number) => {
  const acc = config.value.bankAccounts[idx]
  acc.isActive = acc.isActive === false ? true : false
  await apiSaveConfig(config.value)
  showToast({ 
    title: 'Status Updated', 
    message: `${acc.bankName} (${acc.currency}) is now ${acc.isActive ? 'Active' : 'Disabled'} for customers.`, 
    toastType: 'success' 
  })
}

const saveAccount = async () => {
  if (!accountForm.value.bankName || !accountForm.value.accountNumber || !accountForm.value.accountName) {
    showToast({ title: 'Validation Error', message: 'Bank name, account name, and account number are required.', toastType: 'error' })
    return
  }

  if (!config.value.bankAccounts) {
    config.value.bankAccounts = []
  }

  const payload = {
    ...accountForm.value,
    currency: (accountForm.value.currency || 'USD').toUpperCase().trim(),
    accountNumber: accountForm.value.accountNumber.trim(),
    bankName: accountForm.value.bankName.trim(),
    accountName: accountForm.value.accountName.trim()
  }

  if (editingAccountIndex.value !== null) {
    config.value.bankAccounts[editingAccountIndex.value] = payload
  } else {
    config.value.bankAccounts.push(payload)
  }

  showAccountModal.value = false
  await apiSaveConfig(config.value)
  showToast({ 
    title: 'Account Saved', 
    message: `Settlement account (${payload.bankName} - ${payload.currency}) updated and live!`, 
    toastType: 'success' 
  })
}

const setAncillaryType = (key: 'bags' | 'seats' | 'insurance' | 'vipSupport', type: 'fixed' | 'percentage') => {
  if (!config.value.ancillaryPricingTypes) {
    config.value.ancillaryPricingTypes = { bags: 'fixed', seats: 'fixed', insurance: 'fixed', vipSupport: 'fixed' }
  }
  config.value.ancillaryPricingTypes[key] = type
}

const copyAccountNumber = (accNum: string) => {
  if (!accNum) return
  navigator.clipboard?.writeText(accNum)
  showToast({ title: 'Copied', message: `Account number ${accNum} copied to clipboard!`, toastType: 'success' })
}

const saveConfig = async () => {
  if (config.value?.companyAddress) {
    const a = config.value.companyAddress
    const parts = [a.street, a.suite, a.city, a.state ? `${a.state} ${a.postalCode || ''}` : a.postalCode, a.country].filter(Boolean)
    config.value.companyAddress.fullAddress = parts.join(', ')
  }
  await apiSaveConfig(config.value)
  showToast({ title: 'Settings Saved', message: 'Corporate profile & platform parameters updated successfully.', toastType: 'success' })
}

const addState = () => {
  if (newState.value && !config.value.whitelistedStates.includes(newState.value)) {
    config.value.whitelistedStates.push(newState.value)
    newState.value = ''
  }
}

const removeState = (state: string) => {
  config.value.whitelistedStates = config.value.whitelistedStates.filter((s: any) => s !== state)
}

onMounted(() => {
  fetchConfig()
  fetchIntegrations()
})

definePageMeta({
  layout: 'admin'
})
</script>
