<script setup>
import BusinessDashboardContent from '@/modules/Employer/Business/business_Dashboard.vue'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <BusinessDashboardContent v-bind="$attrs" />
</template>
