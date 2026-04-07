<script setup>
import { toRefs } from 'vue'

const props = defineProps([
  'activeSubscriptionOverview',
  'openPaymentHistory',
  'subscriptionPlans',
  'handleSubscriptionPlanClick',
])

const {
  activeSubscriptionOverview,
  openPaymentHistory,
  subscriptionPlans,
  handleSubscriptionPlanClick,
} = toRefs(props)
</script>

<template>
  <div>
    <section class="business-subscription-overview">
      <div class="business-subscription-overview__copy">
        <strong>Active Subscription</strong>
        <span>Current Plan: {{ activeSubscriptionOverview.plan }}</span>
      </div>
      <div class="business-subscription-overview__billing">
        <small>{{ activeSubscriptionOverview.label }}</small>
        <strong>{{ activeSubscriptionOverview.value }}</strong>
        <span>{{ activeSubscriptionOverview.copy }}</span>
      </div>
    </section>

    <section class="business-pricing-header">
      <div>
        <h2>Business Subscription</h2>
        <p>Activate premium to unlock the full employer workspace and tools.</p>
      </div>
      <button
        type="button"
        class="business-pricing-header__action"
        @click="openPaymentHistory()"
      >
        Payment history
      </button>
    </section>

    <section class="business-pricing">
      <article
        v-for="plan in subscriptionPlans"
        :key="plan.id"
        class="business-pricing__card"
        :class="`business-pricing__card--${plan.tone}`"
      >
        <div class="business-pricing__top">
          <div>
            <h3>{{ plan.title }}</h3>
            <p class="business-pricing__subtitle">{{ plan.subtitle }}</p>
          </div>
          <div v-if="plan.badge" class="business-pricing__pill">{{ plan.badge }}</div>
        </div>

        <ul class="business-pricing__features">
          <li v-for="feature in plan.features" :key="feature">
            <i class="bi bi-check2-circle" aria-hidden="true" />
            <span>{{ feature }}</span>
          </li>
        </ul>

        <div class="business-pricing__footer">
          <button
            type="button"
            class="business-pricing__cta"
            :disabled="plan.isDisabled"
            @click="handleSubscriptionPlanClick(plan)"
          >
            {{ plan.cta }}
          </button>
          <p v-if="plan.trialNote" class="business-pricing__trial-note">{{ plan.trialNote }}</p>
        </div>
      </article>
    </section>
  </div>
</template>
