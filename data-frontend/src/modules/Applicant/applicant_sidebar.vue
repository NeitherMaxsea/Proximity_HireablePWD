<script setup>
import mathLogo from '@/assets/math.png'

const props = defineProps({
  activeSection: {
    type: String,
    required: true,
  },
  applicantName: {
    type: String,
    default: 'Applicant',
  },
  applicantEmail: {
    type: String,
    default: 'No email available',
  },
  applicantAvatarUrl: {
    type: String,
    default: '',
  },
  
  applicantInitials: {
    type: String,
    default: 'AP',
  },
  sidebarItems: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['select-section'])

const selectSection = (sectionId) => {
  emit('select-section', sectionId)
}

const getSidebarDescription = (item) =>
  String(item?.description || '').trim() || 'Open this applicant workspace section.'
</script>

<template>
  <aside class="applicant-sidebar">
    <div class="applicant-sidebar__ambient applicant-sidebar__ambient--top" aria-hidden="true" />
    <div class="applicant-sidebar__ambient applicant-sidebar__ambient--bottom" aria-hidden="true" />

    <div class="applicant-sidebar__main">
      <div class="applicant-sidebar__brand">
        <div class="applicant-sidebar__brand-mark">
          <img :src="mathLogo" alt="Applicant sidebar logo" class="applicant-sidebar__brand-logo" />
        </div>
        <div class="applicant-sidebar__brand-copy">
          <span>PWD Platform</span>
          <strong>Applicant Workspace</strong>
        </div>
      </div>

      <div class="applicant-sidebar__nav-head" aria-hidden="true">
        <span>Workspace Menu</span>
      </div>

      <nav class="applicant-sidebar__nav">
        <button
          v-for="item in sidebarItems"
          :key="item.id"
          type="button"
          class="applicant-sidebar__link"
          :class="{ 'is-active': activeSection === item.id }"
          :aria-current="activeSection === item.id ? 'page' : undefined"
          @click="selectSection(item.id)"
        >
          <span class="applicant-sidebar__link-glow" aria-hidden="true" />
          <span class="applicant-sidebar__link-icon" aria-hidden="true">
            <i :class="item.icon" />
          </span>
          <span class="applicant-sidebar__link-copy">
            <span class="applicant-sidebar__link-label">{{ item.label }}</span>
            <small class="applicant-sidebar__link-meta">{{ getSidebarDescription(item) }}</small>
          </span>
        </button>
      </nav>
    </div>

    <section class="applicant-sidebar__profile" aria-label="Applicant profile summary">
      <div class="applicant-sidebar__profile-avatar">
        <img
          v-if="applicantAvatarUrl"
          :src="applicantAvatarUrl"
          :alt="`${applicantName} avatar`"
          class="applicant-sidebar__profile-image"
        />
        <template v-else>{{ applicantInitials }}</template>
      </div>
      <div class="applicant-sidebar__profile-copy">
        <strong :title="applicantName">{{ applicantName }}</strong>
        <span :title="applicantEmail">{{ applicantEmail }}</span>
      </div>
    </section>
  </aside>
</template>

<style scoped src="@/components/applicant_sidebar.css"></style>
