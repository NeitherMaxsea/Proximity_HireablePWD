<script setup>
import { toRefs } from 'vue'
const props = defineProps([
  'showBusinessSidebar',
  'pwdLogo',
  'businessName',
  'businessBrandSubtitle',
  'profileName',
  'profileAvatar',
  'profileInitials',
  'profileEmail',
  'profileRoleLabel',
  'secondarySectionLabel',
  'showSubscriptionOnlySidebar',
  'showBusinessSubscriptionShortcut',
  'showBusinessProfileShortcut',
  'sidebarRenderGroups',
  'hasDashboardSidebarLink',
  'activeSection',
  'openSidebarGroup',
  'handleSidebarSectionClick',
  'getSidebarItemIcon',
  'isPremiumGuideTarget',
  'isLogoutSubmitting',
  'openLogoutConfirm',
  'openBusinessSubscriptionSection',
  'openBusinessProfileSection',
])
const {
  showBusinessSidebar,
  pwdLogo,
  businessName,
  businessBrandSubtitle,
  profileName,
  profileAvatar,
  profileInitials,
  profileEmail,
  profileRoleLabel,
  secondarySectionLabel,
  showSubscriptionOnlySidebar,
  showBusinessSubscriptionShortcut,
  showBusinessProfileShortcut,
  sidebarRenderGroups,
  hasDashboardSidebarLink,
  activeSection,
  openSidebarGroup,
  handleSidebarSectionClick,
  getSidebarItemIcon,
  isPremiumGuideTarget,
  isLogoutSubmitting,
  openLogoutConfirm,
  openBusinessSubscriptionSection,
  openBusinessProfileSection,
} = toRefs(props)

const onSidebarCollapseBeforeEnter = (element) => {
  element.style.height = '0px'
  element.style.opacity = '0'
}

const onSidebarCollapseEnter = (element) => {
  element.style.height = `${element.scrollHeight}px`
  element.style.opacity = '1'
}

const onSidebarCollapseAfterEnter = (element) => {
  element.style.height = 'auto'
}

const onSidebarCollapseBeforeLeave = (element) => {
  element.style.height = `${element.scrollHeight}px`
  element.style.opacity = '1'
}

const onSidebarCollapseLeave = (element) => {
  void element.offsetHeight
  element.style.height = '0px'
  element.style.opacity = '0'
}

const onSidebarCollapseAfterLeave = (element) => {
  element.style.height = ''
  element.style.opacity = ''
}
</script>

<template>
  <aside v-if="showBusinessSidebar" class="business-sidebar" aria-label="Business sidebar">
    <div class="business-sidebar__brand-row">
      <div class="business-sidebar__brand">
        <span class="business-sidebar__brand-mark">
          <img :src="pwdLogo" alt="PWD logo" class="business-sidebar__logo" />
        </span>
        <span class="business-sidebar__brand-copy">
          <strong>{{ businessName }}</strong>
          <small>{{ businessBrandSubtitle || 'Business Workspace' }}</small>
        </span>
      </div>
    </div>

    <div class="business-sidebar__section-label business-sidebar__section-label--headline">Workspace</div>

    <nav class="business-sidebar__nav" aria-label="Business navigation">
      <button
        v-if="showSubscriptionOnlySidebar"
        key="subscriptions-link"
        type="button"
        class="business-sidebar__link business-sidebar__link--group"
        :class="{ 'is-active': activeSection === 'subscriptions' }"
        @click="openBusinessSubscriptionSection"
      >
        <span class="business-sidebar__link-main">
          <i class="bi bi-stars" aria-hidden="true" />
          <span class="business-sidebar__link-copy">Subscriptions</span>
        </span>
      </button>

      <button
        v-else-if="hasDashboardSidebarLink"
        key="dashboard-link"
        type="button"
        class="business-sidebar__link business-sidebar__link--group"
        :class="{ 'is-active': activeSection === 'dashboard' }"
        @click="handleSidebarSectionClick({ id: 'dashboard' })"
      >
        <span class="business-sidebar__link-main">
          <i class="bi bi-grid-1x2-fill" aria-hidden="true" />
          <span class="business-sidebar__link-copy">Dashboard</span>
        </span>
      </button>

      <div
        v-for="group in !showSubscriptionOnlySidebar ? sidebarRenderGroups : []"
        :key="group.id"
        class="business-sidebar__dropdown-group"
      >
        <button
          type="button"
          class="business-sidebar__link business-sidebar__link--group"
          :class="{ 'is-active-soft': group.isActive }"
          :aria-expanded="group.isExpanded ? 'true' : 'false'"
          @click="openSidebarGroup(group)"
        >
          <span class="business-sidebar__link-main">
            <i :class="group.icon" aria-hidden="true" />
            <span class="business-sidebar__link-copy">{{ group.label }}</span>
          </span>
          <span class="business-sidebar__link-right">
            <span class="business-sidebar__chevron" :class="{ 'is-open': group.isExpanded }">
              <i class="bi bi-chevron-down" aria-hidden="true" />
            </span>
          </span>
        </button>

        <Transition
          name="business-sidebar-collapse"
          @before-enter="onSidebarCollapseBeforeEnter"
          @enter="onSidebarCollapseEnter"
          @after-enter="onSidebarCollapseAfterEnter"
          @before-leave="onSidebarCollapseBeforeLeave"
          @leave="onSidebarCollapseLeave"
          @after-leave="onSidebarCollapseAfterLeave"
        >
          <div
            v-if="group.isExpanded"
            class="business-sidebar__submenu"
            :aria-label="`${group.label} submenu`"
          >
            <button
              v-for="item in group.items"
              :key="item.id"
              type="button"
              class="business-sidebar__submenu-item"
              :class="{
                'is-active': activeSection === item.id,
                'business-guide-target': isPremiumGuideTarget('sidebar-new', item.id),
              }"
              @click="handleSidebarSectionClick(item)"
            >
              <span class="business-sidebar__link-main">
                <i :class="getSidebarItemIcon(item.id)" aria-hidden="true" />
                <span class="business-sidebar__link-copy">{{ item.label }}</span>
              </span>
            </button>
          </div>
        </Transition>
      </div>
    </nav>

    <div class="business-sidebar__spacer" />

    <div class="business-sidebar__secondary">
      <div class="business-sidebar__section-label">{{ secondarySectionLabel || 'Quick Access' }}</div>
      <div class="business-sidebar__secondary-links">
        <button
          v-if="showBusinessSubscriptionShortcut"
          type="button"
          class="business-sidebar__footer-link"
          :class="{ 'is-active': activeSection === 'subscriptions' }"
          @click="openBusinessSubscriptionSection"
        >
          <span class="business-sidebar__link-main">
            <i class="bi bi-stars" aria-hidden="true" />
            <span class="business-sidebar__link-copy">Subscriptions</span>
          </span>
        </button>
        <button
          v-if="showBusinessProfileShortcut"
          type="button"
          class="business-sidebar__footer-link"
          :class="{ 'is-active': activeSection === 'profile' }"
          @click="openBusinessProfileSection"
        >
          <span class="business-sidebar__link-main">
            <i class="bi bi-person-circle" aria-hidden="true" />
            <span class="business-sidebar__link-copy">Edit Profile</span>
          </span>
        </button>
        <button type="button" class="business-sidebar__footer-link" :disabled="isLogoutSubmitting" @click="openLogoutConfirm">
          <span class="business-sidebar__link-main">
            <i class="bi bi-box-arrow-right" aria-hidden="true" />
            <span class="business-sidebar__link-copy">{{ isLogoutSubmitting ? 'Logging Out...' : 'Log Out' }}</span>
          </span>
        </button>
      </div>
    </div>

    <section class="business-sidebar__profile" aria-label="Business profile">
      <div class="business-sidebar__profile-avatar">
        <img v-if="profileAvatar" :src="profileAvatar" alt="Workspace user avatar" class="business-sidebar__profile-image" />
        <template v-else>{{ profileInitials }}</template>
      </div>
      <div class="business-sidebar__profile-meta">
        <div class="business-sidebar__profile-name-row">
          <strong>{{ profileName }}</strong>
          <span v-if="profileRoleLabel" class="business-sidebar__profile-role">{{ profileRoleLabel }}</span>
        </div>
        <span class="business-sidebar__profile-email">{{ profileEmail }}</span>
      </div>
    </section>
  </aside>
</template>
