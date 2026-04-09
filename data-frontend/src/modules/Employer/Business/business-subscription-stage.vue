<script setup>
import { computed, ref } from 'vue'
import BusinessSubscriptionContent from '@/modules/Employer/Business/business_Subscription.vue'
import '@/components/businesss.css'

const props = defineProps({
  businessName: {
    type: String,
    default: '',
  },
  businessEmail: {
    type: String,
    default: '',
  },
})

const text = (value = '') => String(value ?? '').trim()
const selectedPlanId = ref('starter')

const subscriptionPlanCatalog = [
  {
    id: 'starter',
    title: 'Starter',
    subtitle: 'Core workspace access for small teams.',
    badge: 'Active',
    tone: 'muted',
    cta: 'Current Plan',
    isDisabled: true,
    amount: 'Free',
    label: 'Monthly billing',
    copy: 'Best for initial setup and workspace testing.',
    features: [
      'Business dashboard access',
      'Job posting workspace',
      'Basic team member navigation',
    ],
    trialNote: 'You can upgrade anytime when premium tools are ready.',
  },
  {
    id: 'growth',
    title: 'Growth',
    subtitle: 'Unlock hiring workflow tools for active recruitment.',
    badge: 'Recommended',
    tone: 'primary',
    cta: 'Choose Growth',
    isDisabled: false,
    amount: 'PHP 499 / month',
    label: 'Monthly billing',
    copy: 'Designed for businesses actively posting and reviewing applicants.',
    features: [
      'Expanded recruitment controls',
      'Priority support for workspace issues',
      'Faster access to premium releases',
    ],
    trialNote: 'Includes a guided onboarding walkthrough for business owners.',
  },
  {
    id: 'scale',
    title: 'Scale',
    subtitle: 'For teams managing higher-volume hiring and assessments.',
    badge: 'Premium',
    tone: 'accent',
    cta: 'Choose Scale',
    isDisabled: false,
    amount: 'PHP 899 / month',
    label: 'Monthly billing',
    copy: 'Ideal for businesses coordinating hiring across more users.',
    features: [
      'Advanced team collaboration',
      'Priority subscription support',
      'Flexible workspace scaling',
    ],
    trialNote: 'Best when you are preparing full premium rollout for your workspace.',
  },
]

const activeSubscriptionOverview = computed(() => {
  const selectedPlan = subscriptionPlanCatalog.find((plan) => plan.id === selectedPlanId.value) || subscriptionPlanCatalog[0]
  return {
    plan: selectedPlan.title,
    label: selectedPlan.label,
    value: selectedPlan.amount,
    copy: selectedPlan.copy,
  }
})

const subscriptionPlans = computed(() =>
  subscriptionPlanCatalog.map((plan) => ({
    ...plan,
    badge: plan.id === selectedPlanId.value ? 'Active' : plan.badge,
    cta: plan.id === selectedPlanId.value ? 'Current Plan' : plan.cta,
    isDisabled: plan.id === selectedPlanId.value,
  })),
)

const handleSubscriptionPlanClick = (plan) => {
  const normalizedPlanId = text(plan?.id)
  if (!normalizedPlanId || normalizedPlanId === selectedPlanId.value) return

  selectedPlanId.value = normalizedPlanId
}
</script>

<template>
  <section class="business-subscription-stage">
    <BusinessSubscriptionContent
      :active-subscription-overview="activeSubscriptionOverview"
      :subscription-plans="subscriptionPlans"
      :handle-subscription-plan-click="handleSubscriptionPlanClick"
    />
  </section>
</template>

<style scoped>
.business-subscription-stage {
  width: 100%;
  min-width: 0;
  overflow: visible;
}

.business-subscription-stage :deep(.business-pricing) {
  grid-template-columns: repeat(auto-fit, minmax(17.5rem, 1fr));
  align-items: stretch;
  width: 100%;
  overflow: visible;
}

.business-subscription-stage :deep(.business-pricing__card) {
  min-width: 0;
  min-height: 28rem;
}

.business-subscription-stage :deep(.business-pricing-header) {
  flex-wrap: wrap;
}

.business-subscription-stage :deep(.business-pricing-header__action) {
  display: none;
}
</style>
