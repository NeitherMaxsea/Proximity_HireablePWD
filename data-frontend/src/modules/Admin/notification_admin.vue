<script setup>
const emit = defineEmits(['toggle-notifications', 'open-notification'])

const props = defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
  notificationCount: {
    type: Number,
    default: 0,
  },
  notificationMenuOpen: {
    type: Boolean,
    default: false,
  },
})

const formatNotificationBadge = (value) => {
  const count = Number(value) || 0
  return count > 99 ? '99+' : String(count)
}

const formatNotificationTime = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Just now'

  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="admin-notification admin-navbar__notification-wrap">
    <button
      class="admin-notification__trigger admin-navbar__tool admin-navbar__tool--notification"
      type="button"
      aria-label="Notifications"
      :aria-expanded="notificationMenuOpen ? 'true' : 'false'"
      aria-haspopup="menu"
      @click.stop="emit('toggle-notifications')"
    >
      <i class="bi bi-bell" aria-hidden="true" />
      <Transition name="admin-notification-badge">
        <span v-if="notificationCount > 0" class="admin-notification__badge admin-navbar__icon-badge">
          {{ formatNotificationBadge(notificationCount) }}
        </span>
      </Transition>
    </button>

    <Transition name="admin-notification-panel">
      <div
        v-if="notificationMenuOpen"
        class="admin-notification__panel admin-navbar__notification-panel"
        role="menu"
        aria-label="Admin notifications"
      >
        <div class="admin-notification__head admin-navbar__notification-head">
          <div>
            <strong>Notifications</strong>
            <span>Live applicant activity</span>
          </div>

          <span v-if="notificationCount > 0" class="admin-notification__pill admin-navbar__notification-pill">
            {{ formatNotificationBadge(notificationCount) }} new
          </span>
        </div>

        <div v-if="props.notifications.length" class="admin-notification__list admin-navbar__notification-list">
          <button
            v-for="notification in props.notifications"
            :key="notification.id"
            class="admin-notification__item admin-navbar__notification-item"
            :class="{ 'is-unread': !notification.read }"
            type="button"
            role="menuitem"
            @click.stop="emit('open-notification', notification.id)"
          >
            <span class="admin-notification__dot admin-navbar__notification-dot" :class="{ 'is-unread': !notification.read }" aria-hidden="true" />

            <div class="admin-notification__copy admin-navbar__notification-copy">
              <strong>{{ notification.title }}</strong>
              <span>{{ notification.message }}</span>
              <small>{{ formatNotificationTime(notification.createdAt) }}</small>
            </div>
          </button>
        </div>

        <div v-else class="admin-notification__empty admin-navbar__notification-empty">
          Waiting for new applicant accounts.
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.admin-notification {
  position: relative;
  z-index: 110;
  isolation: isolate;
}

.admin-notification__trigger {
  position: relative;
  width: 2.1rem;
  height: 2.1rem;
  border: 0;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: transparent;
  color: var(--admin-text-secondary);
  cursor: pointer;
  transition:
    transform 0.22s ease,
    background-color 0.22s ease,
    box-shadow 0.22s ease,
    color 0.22s ease;
}

.admin-notification__trigger:hover {
  color: var(--admin-text-primary);
  background: var(--admin-bg-hover-strong);
  box-shadow: inset 0 0 0 1px var(--admin-theme-accent-border);
}

.admin-notification__trigger i {
  font-size: 0.95rem;
  line-height: 1;
}

.admin-notification__badge {
  position: absolute;
  top: -0.08rem;
  right: -0.08rem;
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.28rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #d95b5b;
  color: #fff;
  font-size: 0.58rem;
  font-weight: 700;
  box-shadow: 0 8px 14px rgba(217, 91, 91, 0.22);
  animation: admin-notification-badge-pulse 1.9s ease-in-out infinite;
}

.admin-notification__panel {
  position: absolute;
  top: calc(100% + 0.65rem);
  right: 0;
  width: min(24rem, calc(100vw - 2rem));
  padding: 0.55rem;
  border: 1px solid var(--admin-border-color);
  border-radius: 1rem;
  background: var(--admin-bg-surface-elevated);
  box-shadow: var(--admin-shadow-soft);
  backdrop-filter: blur(12px);
  z-index: 115;
}

.admin-notification__head {
  padding: 0.45rem 0.55rem 0.7rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.admin-notification__head strong {
  display: block;
  color: var(--admin-text-primary);
  font-size: 0.92rem;
  font-weight: 700;
}

.admin-notification__head span {
  color: var(--admin-text-muted);
  font-size: 0.75rem;
}

.admin-notification__pill {
  flex-shrink: 0;
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  background: rgba(217, 91, 91, 0.1);
  color: #b24949;
  font-size: 0.7rem;
  font-weight: 700;
}

.admin-notification__list {
  display: grid;
  gap: 0.28rem;
}

.admin-notification__item {
  width: 100%;
  border: 0;
  border-radius: 0.8rem;
  padding: 0.72rem 0.75rem;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: flex-start;
  gap: 0.7rem;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.admin-notification__item:hover {
  transform: translateY(-1px);
  background: var(--admin-bg-hover);
}

.admin-notification__item.is-unread {
  background: var(--admin-theme-accent-soft);
}

.admin-notification__dot {
  width: 0.55rem;
  height: 0.55rem;
  margin-top: 0.4rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.48);
}

.admin-notification__dot.is-unread {
  background: #2c8a62;
  box-shadow: 0 0 0 5px rgba(44, 138, 98, 0.12);
}

.admin-notification__copy {
  display: grid;
  gap: 0.18rem;
}

.admin-notification__copy strong {
  color: var(--admin-text-primary);
  font-size: 0.84rem;
  font-weight: 700;
}

.admin-notification__copy span {
  color: var(--admin-text-secondary);
  font-size: 0.78rem;
  line-height: 1.45;
}

.admin-notification__copy small {
  color: var(--admin-text-muted);
  font-size: 0.7rem;
}

.admin-notification__empty {
  padding: 1rem 0.8rem;
  border-radius: 0.8rem;
  color: var(--admin-text-secondary);
  font-size: 0.8rem;
  background: var(--admin-bg-surface-muted);
  text-align: center;
}

.admin-notification-badge-enter-active,
.admin-notification-badge-leave-active,
.admin-notification-panel-enter-active,
.admin-notification-panel-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.admin-notification-badge-enter-from,
.admin-notification-badge-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.admin-notification-panel-enter-from,
.admin-notification-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@keyframes admin-notification-badge-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 8px 14px rgba(217, 91, 91, 0.22);
  }

  50% {
    transform: scale(1.06);
    box-shadow: 0 10px 18px rgba(217, 91, 91, 0.32);
  }
}
</style>
