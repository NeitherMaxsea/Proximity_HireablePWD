<script setup>
import { toRefs } from 'vue'

const props = defineProps([
  'goBackToPlans',
  'paymentHistoryFilters',
  'paymentHistoryStatusOptions',
  'filteredBusinessPaymentHistoryEntries',
  'paymentHistoryInitialsFromName',
  'businessName',
  'businessEmail',
  'normalizePaymentHistoryStatusClass',
  'openReceiptPreview',
])

const {
  goBackToPlans,
  paymentHistoryFilters,
  paymentHistoryStatusOptions,
  filteredBusinessPaymentHistoryEntries,
  paymentHistoryInitialsFromName,
  businessName,
  businessEmail,
  normalizePaymentHistoryStatusClass,
  openReceiptPreview,
} = toRefs(props)
</script>

<template>
  <div>
    <section class="business-pricing-header">
      <div>
        <h2>Payment History</h2>
        <p>Track your subscription transactions and review receipt details.</p>
      </div>
      <button
        type="button"
        class="business-pricing-header__action"
        @click="goBackToPlans()"
      >
        Back to Subscription
      </button>
    </section>

    <section class="business-history">
      <div class="business-history__panel-head">
        <div>
          <h3>Payment History</h3>
          <p>Latest subscription activity for this business account only.</p>
        </div>
        <span class="business-history__pill">{{ filteredBusinessPaymentHistoryEntries.length }} records</span>
      </div>

      <div class="business-history__search-card">
        <div class="business-history__toolbar">
          <label class="business-history__filter business-history__filter--search">
            <span>Search</span>
            <div class="business-history__search">
              <i class="bi bi-search" aria-hidden="true" />
              <input
                v-model.trim="paymentHistoryFilters.search"
                type="text"
                placeholder="Search payment history..."
              />
            </div>
          </label>

          <label class="business-history__filter business-history__filter--status">
            <span>Status</span>
            <div class="business-history__select-wrap">
              <i class="bi bi-funnel" aria-hidden="true" />
              <select v-model="paymentHistoryFilters.statusFilter" class="business-history__select">
                <option
                  v-for="option in paymentHistoryStatusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </label>
        </div>
      </div>

      <div v-if="filteredBusinessPaymentHistoryEntries.length" class="business-history__table-shell">
        <div class="business-history__table">
          <div class="business-history__head">
            <span>Receipt</span>
            <span>Business</span>
            <span>Plan</span>
            <span>Method</span>
            <span>Amount</span>
            <span>Date</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          <article
            v-for="entry in filteredBusinessPaymentHistoryEntries"
            :key="entry.id"
            class="business-history__row"
          >
            <div class="business-history__id">{{ entry.receiptCode || entry.id }}</div>

            <div class="business-history__account">
              <div class="business-history__avatar">
                {{ paymentHistoryInitialsFromName(entry.ownerName, 'BA') }}
              </div>
              <div class="business-history__meta">
                <strong>{{ entry.ownerName || businessName }}</strong>
                <span>{{ entry.ownerEmail || businessEmail }}</span>
              </div>
            </div>

            <div class="business-history__plan">{{ entry.plan }}</div>
            <div class="business-history__method">{{ entry.method }}</div>
            <div class="business-history__amount">{{ entry.amount }}</div>
            <div class="business-history__date">{{ entry.date }} {{ entry.time }}</div>
            <div class="business-history__status-wrap">
              <span class="business-history__status-pill" :class="`is-${normalizePaymentHistoryStatusClass(entry.status)}`">
                {{ entry.status }}
              </span>
            </div>
            <div class="business-history__actions">
              <button
                type="button"
                class="business-history__action-btn"
                title="Open receipt"
                aria-label="Open receipt"
                @click="openReceiptPreview(entry)"
              >
                <i class="bi bi-printer" aria-hidden="true" />
              </button>
            </div>
          </article>
        </div>
      </div>
      <div v-else class="business-history__empty">
        <i class="bi bi-receipt-cutoff" aria-hidden="true" />
        <strong>No payment history records match the current filter.</strong>
        <p>Your completed premium or trial transactions for this account will appear here once they are synced.</p>
      </div>
    </section>
  </div>
</template>
