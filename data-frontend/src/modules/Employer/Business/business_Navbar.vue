<script setup>
import { toRefs } from 'vue'
import AdminNavbar from '@/modules/Admin/adminnavbar.vue'
const props = defineProps([
  'currentSection',
  'breadcrumbParent',
  'businessName',
  'businessEmail',
  'businessInitials',
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
  breadcrumbParent,
  businessName,
  businessEmail,
  businessInitials,
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
</script>

<template>
<AdminNavbar
        :title="currentSection.title"
        :breadcrumb-parent="breadcrumbParent || 'Business Workspace'"
        :breadcrumb-current="currentSection.title"
        :subtitle="currentSection.description"
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
</template>

