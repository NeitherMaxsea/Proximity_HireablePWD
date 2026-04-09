<script setup>
import { defineAsyncComponent, defineComponent, h } from 'vue'

const createBusinessSectionLoader = (label) => defineComponent({
  name: 'BusinessSectionLoader',
  setup() {
    return () => h(
      'div',
      {
        class: 'business-section-loader',
        role: 'status',
        'aria-live': 'polite',
        'aria-label': `Loading ${label}`,
      },
      [
        h(
          'span',
          { class: 'business-loading-dots', 'aria-hidden': 'true' },
          [h('span'), h('span'), h('span')],
        ),
      ],
    )
  },
})

const BusinessDashboardContent = defineAsyncComponent({
  loader: () => import('@/modules/Employer/Business/business_Dashboard.vue'),
  delay: 120,
  loadingComponent: createBusinessSectionLoader('business dashboard'),
})

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <BusinessDashboardContent v-bind="$attrs" />
</template>

<style scoped>
.business-section-loader {
  min-height: min(24rem, 52vh);
  display: grid;
  place-content: center;
  justify-items: center;
  padding: 1.6rem;
}

.business-loading-dots {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  color: #2f6a49;
}

.business-loading-dots span {
  width: 0.32rem;
  height: 0.32rem;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.35;
  animation: business-loading-dot-pulse 0.9s ease-in-out infinite;
}

.business-loading-dots span:nth-child(2) {
  animation-delay: 0.12s;
}

.business-loading-dots span:nth-child(3) {
  animation-delay: 0.24s;
}

@keyframes business-loading-dot-pulse {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.35;
  }

  50% {
    transform: translateY(-0.14rem);
    opacity: 1;
  }
}
</style>
