<script setup>
import { toRefs } from 'vue'
import BusinessSubscirptionPayment from '@/modules/Employer/Business/business_SubscirptionPayment.vue'

const props = defineProps([
  'currentCheckoutFlow',
  'isAdvancingPaymentStep',
  'paymentLoadingMessage',
  'paymentStepRows',
  'paymentStep',
  'paymentForm',
  'handlePaymentFullNameInput',
  'isPaymentContactCountryDropdownOpen',
  'setPaymentContactCountryDropdownElement',
  'togglePaymentContactCountryDropdown',
  'getCountryFlagClass',
  'paymentContactCountryCode',
  'selectedPaymentPhoneCountry',
  'PHONE_COUNTRIES',
  'selectPaymentContactCountryOption',
  'formatContactNumberDisplay',
  'getPaymentLocalContactDigits',
  'handlePaymentContactNumberChange',
  'openCancelPaymentModal',
  'validatePaymentStepOne',
  'goToPaymentStepWithLoading',
  'paymentMethodOptions',
  'selectedPaymentMethod',
  'selectPaymentMethod',
  'goToPaymentStep',
  'goToPaymentConfirmationStep',
  'isProcessingTestModePayment',
  'isFreeTrialCheckout',
  'isAwaitingExternalPayment',
  'openMockPaymentTab',
  'markPaymentConfirmed',
  'paymentSuccessRedirectSeconds',
  'orderReceiptCode',
  'orderReceiptDate',
  'goBackToPlans',
])

const {
  currentCheckoutFlow,
  isAdvancingPaymentStep,
  paymentLoadingMessage,
  paymentStepRows,
  paymentStep,
  paymentForm,
  handlePaymentFullNameInput,
  isPaymentContactCountryDropdownOpen,
  setPaymentContactCountryDropdownElement,
  togglePaymentContactCountryDropdown,
  getCountryFlagClass,
  paymentContactCountryCode,
  selectedPaymentPhoneCountry,
  PHONE_COUNTRIES,
  selectPaymentContactCountryOption,
  formatContactNumberDisplay,
  getPaymentLocalContactDigits,
  handlePaymentContactNumberChange,
  openCancelPaymentModal,
  validatePaymentStepOne,
  goToPaymentStepWithLoading,
  paymentMethodOptions,
  selectedPaymentMethod,
  selectPaymentMethod,
  goToPaymentStep,
  goToPaymentConfirmationStep,
  isProcessingTestModePayment,
  isFreeTrialCheckout,
  isAwaitingExternalPayment,
  openMockPaymentTab,
  markPaymentConfirmed,
  paymentSuccessRedirectSeconds,
  orderReceiptCode,
  orderReceiptDate,
  goBackToPlans,
} = toRefs(props)
</script>

<template>
  <div>
    <section class="business-pricing-header">
      <div>
        <h2>{{ currentCheckoutFlow.headerTitle }}</h2>
        <p>{{ currentCheckoutFlow.headerDescription }}</p>
      </div>
    </section>

    <BusinessSubscirptionPayment>
      <template #main>
        <div class="business-payment__main">
          <div v-if="isAdvancingPaymentStep" class="business-payment__loading">
            <div class="business-payment__loading-inner">
              <div class="business-payment__loading-dots">
                <span />
                <span />
                <span />
              </div>
              <p class="business-payment__loading-text">{{ paymentLoadingMessage }}</p>
            </div>
          </div>

          <div class="business-payment__steps">
            <div
              v-for="(row, index) in paymentStepRows"
              :key="row.step"
              class="business-payment__step"
              :class="{
                'is-current': paymentStep === index + 1,
                'is-done': paymentStep > index + 1,
              }"
            >
              <div class="business-payment__step-marker">
                <i :class="row.icon" aria-hidden="true" />
              </div>
              <div class="business-payment__step-line" aria-hidden="true" />
              <p>{{ row.title }}</p>
            </div>
          </div>

          <div v-if="paymentStep === 1" class="business-payment__panel">
            <h3>{{ currentCheckoutFlow.stepOneTitle }}</h3>
            <p>{{ currentCheckoutFlow.stepOneDescription }}</p>
            <div class="business-payment__form">
              <label class="business-payment__field">
                <span>Full Name</span>
                <input v-model="paymentForm.fullName" type="text" placeholder="Enter full name" @input="handlePaymentFullNameInput" />
              </label>
              <label class="business-payment__field">
                <span>Business Email</span>
                <input v-model="paymentForm.businessEmail" type="email" placeholder="Enter business email" readonly />
              </label>
              <label class="business-payment__field">
                <span>Contact Number</span>
                <div class="business-payment__phone-wrap">
                  <div
                    :ref="setPaymentContactCountryDropdownElement"
                    class="business-payment__phone-country"
                    :class="{ 'is-open': isPaymentContactCountryDropdownOpen }"
                  >
                    <button
                      type="button"
                      class="business-payment__phone-country-trigger"
                      aria-haspopup="listbox"
                      :aria-expanded="isPaymentContactCountryDropdownOpen ? 'true' : 'false'"
                      @click="togglePaymentContactCountryDropdown"
                    >
                      <span class="business-payment__phone-country-value">
                        <span :class="getCountryFlagClass(paymentContactCountryCode)" class="business-payment__country-flag" aria-hidden="true" />
                        <span>{{ selectedPaymentPhoneCountry.code }} {{ selectedPaymentPhoneCountry.dial }}</span>
                      </span>
                      <i class="bi bi-chevron-down" aria-hidden="true" />
                    </button>

                    <Transition name="business-payment-country">
                      <div
                        v-if="isPaymentContactCountryDropdownOpen"
                        class="business-payment__phone-country-menu"
                        role="listbox"
                        aria-label="Payment contact country"
                      >
                        <button
                          v-for="country in PHONE_COUNTRIES"
                          :key="country.code"
                          type="button"
                          class="business-payment__phone-country-option"
                          :class="{ 'is-active': paymentContactCountryCode === country.code }"
                          role="option"
                          :aria-selected="paymentContactCountryCode === country.code ? 'true' : 'false'"
                          @click="selectPaymentContactCountryOption(country.code)"
                        >
                          <span class="business-payment__phone-country-value">
                            <span :class="getCountryFlagClass(country.code)" class="business-payment__country-flag" aria-hidden="true" />
                            <span>{{ country.code }} {{ country.dial }}</span>
                          </span>
                        </button>
                      </div>
                    </Transition>
                  </div>

                  <input
                    type="text"
                    :value="formatContactNumberDisplay(getPaymentLocalContactDigits())"
                    placeholder="Enter contact number"
                    inputmode="tel"
                    maxlength="12"
                    @input="handlePaymentContactNumberChange"
                  />
                </div>
              </label>
            </div>
            <div class="business-payment__actions">
              <button type="button" class="business-payment__secondary" @click="openCancelPaymentModal">Cancel</button>
              <button
                type="button"
                class="business-payment__primary"
                @click="validatePaymentStepOne() && goToPaymentStepWithLoading(2)"
              >
                Next Step
              </button>
            </div>
          </div>

          <div v-else-if="paymentStep === 2" class="business-payment__panel">
            <h3>{{ currentCheckoutFlow.stepTwoTitle }}</h3>
            <p>{{ currentCheckoutFlow.stepTwoDescription }}</p>
            <div class="business-payment__methods">
              <article
                v-for="method in paymentMethodOptions"
                :key="method.id"
                class="business-payment__method"
                :class="[
                  `business-payment__method--${method.accent}`,
                  {
                    'is-selected': selectedPaymentMethod === method.id,
                    'is-disabled': method.disabled,
                  },
                ]"
                @click="!method.disabled && selectPaymentMethod(method.id)"
              >
                <div class="business-payment__method-icon" aria-hidden="true">
                  <img :src="method.image" :alt="`${method.title} logo`" class="business-payment__method-image" />
                </div>
                <div class="business-payment__method-copy">
                  <span class="business-payment__method-badge">{{ method.badge }}</span>
                  <strong>{{ method.title }}</strong>
                  <p>{{ method.copy }}</p>
                  <small>{{ method.meta }}</small>
                </div>
                <span class="business-payment__radio" aria-hidden="true" />
              </article>
            </div>
            <div class="business-payment__actions">
              <button type="button" class="business-payment__secondary" @click="goToPaymentStep(1)">Previous</button>
              <button type="button" class="business-payment__primary" @click="goToPaymentConfirmationStep">Next Step</button>
            </div>
          </div>

          <div v-else-if="paymentStep === 3" class="business-payment__panel">
            <div v-if="isProcessingTestModePayment" class="business-payment__test-mode">
              <div class="business-payment__test-mode-spinner" aria-hidden="true" />
              <strong>{{ selectedPaymentMethod === 'gcash' ? 'Redirecting to PayMongo' : isFreeTrialCheckout ? 'Billing setup in progress' : 'Payment in progress' }}</strong>
              <p>{{ selectedPaymentMethod === 'gcash' ? 'Please wait while we continue your GCash checkout securely through PayMongo.' : currentCheckoutFlow.processingText }}</p>
            </div>
            <template v-else-if="selectedPaymentMethod === 'gcash'">
              <h3>{{ currentCheckoutFlow.gcashTitle }}</h3>
              <p>{{ currentCheckoutFlow.gcashDescription }}</p>
              <div class="business-payment__status-box">
                <strong>{{ currentCheckoutFlow.gcashStatusTitle }}</strong>
                <span>{{ isAwaitingExternalPayment ? currentCheckoutFlow.gcashStatusOpened : currentCheckoutFlow.gcashStatusWaiting }}</span>
                <small>{{ currentCheckoutFlow.gcashStatusHelp }}</small>
              </div>
            </template>
            <template v-else>
              <h3>{{ currentCheckoutFlow.cardTitle }}</h3>
              <p>{{ currentCheckoutFlow.cardDescription }}</p>
              <div class="business-payment__status-box">
                <strong>{{ currentCheckoutFlow.cardStatusTitle }}</strong>
                <span>{{ selectedPaymentMethod === 'gcash' ? 'GCash' : 'Credit Card' }}</span>
                <small>{{ currentCheckoutFlow.cardStatusHelp }}</small>
              </div>
            </template>
            <div class="business-payment__actions">
              <button
                type="button"
                class="business-payment__secondary"
                :disabled="isProcessingTestModePayment || isAwaitingExternalPayment"
                @click="goToPaymentStep(2)"
              >
                Previous
              </button>
              <button
                v-if="selectedPaymentMethod === 'gcash'"
                type="button"
                class="business-payment__primary"
                :disabled="isProcessingTestModePayment"
                @click="openMockPaymentTab"
              >
                {{ currentCheckoutFlow.reopenAction }}
              </button>
              <button
                v-else
                type="button"
                class="business-payment__primary"
                :disabled="isProcessingTestModePayment"
                @click="markPaymentConfirmed"
              >
                {{ isProcessingTestModePayment ? 'Processing...' : currentCheckoutFlow.confirmAction }}
              </button>
            </div>
          </div>

          <div v-else class="business-payment__panel business-payment__panel--success">
            <div class="business-payment__success-icon" aria-hidden="true">
              <i class="bi bi-check-circle-fill" />
            </div>
            <h3>{{ currentCheckoutFlow.successTitle }}</h3>
            <p>{{ currentCheckoutFlow.successDescription }}</p>
            <div class="business-payment__status-box business-payment__status-box--success">
              <strong>{{ currentCheckoutFlow.successStatusTitle }}</strong>
              <span>{{ currentCheckoutFlow.successStatusDescription }}</span>
              <small>Redirecting to subscriptions in {{ paymentSuccessRedirectSeconds }} seconds.</small>
            </div>
            <div class="business-payment__success-meta">
              <div class="business-payment__success-meta-item">
                <span>Reference Number</span>
                <strong>{{ orderReceiptCode }}</strong>
              </div>
              <div class="business-payment__success-meta-item">
                <span>Date</span>
                <strong>{{ orderReceiptDate }}</strong>
              </div>
            </div>
            <div class="business-payment__actions business-payment__actions--center">
              <button type="button" class="business-payment__primary" @click="goBackToPlans">Go to Subscriptions</button>
            </div>
          </div>
        </div>
      </template>

      <template #summary>
        <aside class="business-payment__summary">
          <h3>Order Summary</h3>
          <p class="business-payment__summary-note">
            {{ paymentStep >= 4 ? currentCheckoutFlow.summaryNoteSuccess : currentCheckoutFlow.summaryNotePending }}
          </p>
          <div class="business-payment__receipt">
            <div class="business-payment__receipt-row">
              <span>Receipt</span>
              <strong>{{ orderReceiptCode }}</strong>
            </div>
            <div class="business-payment__receipt-row">
              <span>Date</span>
              <strong>{{ orderReceiptDate }}</strong>
            </div>
          </div>
          <div class="business-payment__item">
            <div class="business-payment__item-thumb">P</div>
            <div class="business-payment__item-copy">
              <strong>{{ currentCheckoutFlow.summaryItemTitle }}</strong>
              <span>{{ currentCheckoutFlow.summaryItemDescription }}</span>
              <small>Qty: 1</small>
            </div>
          </div>
          <div class="business-payment__summary-row">
            <span>Recipient</span>
            <strong>PWD Employment Platform</strong>
          </div>
          <div class="business-payment__summary-row">
            <span>Subtotal</span>
            <strong>{{ currentCheckoutFlow.subtotal }}</strong>
          </div>
          <div v-if="currentCheckoutFlow.discount" class="business-payment__summary-row">
            <span>New User Discount</span>
            <strong>{{ currentCheckoutFlow.discount }}</strong>
          </div>
          <div class="business-payment__summary-row">
            <span>VAT</span>
            <strong>{{ currentCheckoutFlow.vat }}</strong>
          </div>
          <div class="business-payment__summary-row">
            <span>{{ currentCheckoutFlow.summaryMetaLabel }}</span>
            <strong>{{ currentCheckoutFlow.summaryMetaValue }}</strong>
          </div>
          <div class="business-payment__summary-row business-payment__summary-row--total">
            <span>Total</span>
            <strong>{{ currentCheckoutFlow.total }}</strong>
          </div>
        </aside>
      </template>
    </BusinessSubscirptionPayment>
  </div>
</template>
