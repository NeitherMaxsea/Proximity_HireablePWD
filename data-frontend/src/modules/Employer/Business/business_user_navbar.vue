<script setup>
import { computed, toRefs } from 'vue'
import AdminNavbar from '@/modules/Admin/adminnavbar.vue'

const props = defineProps([
  'currentSection',
  'businessName',
  'businessEmail',
  'businessInitials',
  'profileRoleLabel',
  'workspaceOwnerName',
  'isProfileMenuOpen',
  'businessNavbarSettingsItems',
  'businessNavbarNotifications',
  'unreadBusinessNotificationCount',
  'isNotificationMenuOpen',
  'toggleBusinessProfileMenu',
  'toggleNotificationMenu',
  'openBusinessNotification',
  'handleBusinessNavbarSetting',
  'openLogoutConfirm',
])

const {
  currentSection,
  businessName,
  businessEmail,
  businessInitials,
  profileRoleLabel,
  workspaceOwnerName,
  isProfileMenuOpen,
  businessNavbarSettingsItems,
  businessNavbarNotifications,
  unreadBusinessNotificationCount,
  isNotificationMenuOpen,
  toggleBusinessProfileMenu,
  toggleNotificationMenu,
  openBusinessNotification,
  handleBusinessNavbarSetting,
  openLogoutConfirm,
} = toRefs(props)

const employeeSubtitle = computed(() => {
  const base = String(currentSection.value?.description || '').trim()
  const role = String(profileRoleLabel.value || 'Workspace User').trim()
  const owner = String(workspaceOwnerName.value || 'Business Workspace').trim()
  return `${base}${base ? ' ' : ''}${role} under ${owner}.`
})
</script>

<template>
  <div class="business-owner-navbar">
    <AdminNavbar
      :title="currentSection.title"
      breadcrumb-parent="Employee Workspace"
      :breadcrumb-current="currentSection.title"
      :subtitle="employeeSubtitle"
      :profile-name="businessName"
      :profile-email="businessEmail"
      :profile-initials="businessInitials"
      :profile-menu-open="isProfileMenuOpen"
      :settings-items="businessNavbarSettingsItems"
      :notifications="businessNavbarNotifications"
      :notification-count="unreadBusinessNotificationCount"
      :notification-menu-open="isNotificationMenuOpen"
      @toggle-profile="toggleBusinessProfileMenu"
      @toggle-notifications="toggleNotificationMenu"
      @open-notification="openBusinessNotification"
      @open-setting="handleBusinessNavbarSetting"
      @logout="openLogoutConfirm"
    />
  </div>
</template>

<style scoped>
.business-owner-navbar {
  --admin-theme-accent-border: rgba(144, 156, 182, 0.24);
  --admin-bg-surface-elevated: rgba(255, 255, 255, 0.94);
  --admin-bg-surface-muted: rgba(245, 247, 251, 0.96);
  --admin-bg-hover: rgba(244, 247, 252, 0.98);
  --admin-bg-hover-strong: rgba(238, 242, 249, 1);
  --admin-text-primary: #172033;
  --admin-text-secondary: #5f6b85;
  --admin-text-muted: #8b97ad;
  --admin-border-color: rgba(223, 227, 234, 0.96);
  --admin-shadow-soft: 0 18px 34px rgba(17, 24, 39, 0.09);
  font-family: "Inter", "Segoe UI", sans-serif;
}

.business-owner-navbar :deep(.admin-navbar) {
  font-family: "Inter", "Segoe UI", sans-serif;
}

.business-owner-navbar :deep(.admin-navbar__actions) {
  background: rgba(255, 255, 255, 0.94);
}

.business-owner-navbar :deep(.admin-navbar__notification-panel),
.business-owner-navbar :deep(.admin-navbar__dropdown) {
  background: rgba(255, 255, 255, 0.96);
  border-color: rgba(223, 227, 234, 0.96);
  box-shadow: 0 18px 34px rgba(17, 24, 39, 0.09);
  backdrop-filter: none;
}

.business-owner-navbar :deep(.admin-navbar__notification-item:hover) {
  background: rgba(244, 247, 252, 0.98);
}

.business-owner-navbar :deep(.admin-navbar__notification-item.is-unread) {
  background: rgba(239, 244, 253, 0.92);
}

.business-owner-navbar :deep(.admin-navbar__notification-empty) {
  background: rgba(245, 247, 251, 0.98);
}

.business-owner-navbar :deep(.admin-navbar-breadcrumb-enter-active),
.business-owner-navbar :deep(.admin-navbar-breadcrumb-leave-active) {
  transition: none;
}
</style>
