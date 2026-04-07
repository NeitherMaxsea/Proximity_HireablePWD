<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  applicantName: {
    type: String,
    default: 'Applicant',
  },
  applicantEmail: {
    type: String,
    default: 'No email available',
  },
  applicantInitials: {
    type: String,
    default: 'AP',
  },
  applicantJoined: {
    type: String,
    default: 'Recently',
  },
  applicantDisability: {
    type: String,
    default: 'Not set',
  },
})

const emit = defineEmits([
  'close',
  'open-profile',
  'open-help-center',
  'open-terms',
  'logout',
])

const APPLICANT_SETTINGS_STORAGE_KEY = 'applicantWorkspaceSettingsModalPreferences'
const createDefaultPreferences = () => ({
  inboxUpdates: true,
  interviewReminders: true,
  jobMatchAlerts: true,
  accountTips: false,
})

const preferences = ref(createDefaultPreferences())

const normalizePreferences = (value = {}) => {
  const source = value && typeof value === 'object' ? value : {}
  return {
    inboxUpdates: source.inboxUpdates !== false,
    interviewReminders: source.interviewReminders !== false,
    jobMatchAlerts: source.jobMatchAlerts !== false,
    accountTips: Boolean(source.accountTips),
  }
}

const loadStoredPreferences = () => {
  if (typeof window === 'undefined') return

  try {
    const raw = window.localStorage.getItem(APPLICANT_SETTINGS_STORAGE_KEY)
    if (!raw) {
      preferences.value = createDefaultPreferences()
      return
    }

    preferences.value = normalizePreferences(JSON.parse(raw))
  } catch {
    preferences.value = createDefaultPreferences()
  }
}

const persistStoredPreferences = (value) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(APPLICANT_SETTINGS_STORAGE_KEY, JSON.stringify(normalizePreferences(value)))
  } catch {
    // Ignore storage write issues and keep the modal usable.
  }
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

const setModalListeners = (isOpen) => {
  if (typeof document === 'undefined') return

  document.removeEventListener('keydown', handleKeydown)
  if (isOpen) {
    document.addEventListener('keydown', handleKeydown)
  }
}

const togglePreference = (key) => {
  preferences.value = {
    ...preferences.value,
    [key]: !preferences.value[key],
  }
}

const runAction = (actionName) => {
  emit('close')
  emit(actionName)
}

watch(preferences, (value) => {
  persistStoredPreferences(value)
}, { deep: true })

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      loadStoredPreferences()
    }
    setModalListeners(isOpen)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  setModalListeners(false)
})
</script>

<template>
  <Teleport to="body">
    <transition name="applicant-settings-modal">
      <div
        v-if="open"
        class="applicant-settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="applicant-settings-title"
      >
        <button
          type="button"
          class="applicant-settings-modal__backdrop"
          aria-label="Close settings modal"
          @click="$emit('close')"
        />

        <div class="applicant-settings-modal__dialog">
          <header class="applicant-settings-modal__header">
            <div class="applicant-settings-modal__header-copy">
              <span class="applicant-settings-modal__eyebrow">Applicant Settings</span>
              <h2 id="applicant-settings-title">Workspace preferences</h2>
              <p>Manage your applicant tools, alerts, and quick actions in one modal.</p>
            </div>

            <button
              type="button"
              class="applicant-settings-modal__close"
              aria-label="Close settings modal"
              @click="$emit('close')"
            >
              <i class="bi bi-x-lg" />
            </button>
          </header>

          <section class="applicant-settings-modal__account">
            <div class="applicant-settings-modal__avatar" aria-hidden="true">{{ applicantInitials }}</div>
            <div class="applicant-settings-modal__account-copy">
              <strong>{{ applicantName }}</strong>
              <span>{{ applicantEmail }}</span>
            </div>
            <div class="applicant-settings-modal__account-meta">
              <span>Joined {{ applicantJoined }}</span>
              <span>{{ applicantDisability }}</span>
            </div>
          </section>

          <div class="applicant-settings-modal__grid">
            <section class="applicant-settings-modal__panel">
              <div class="applicant-settings-modal__panel-head">
                <h3>Notifications</h3>
                <p>Choose which applicant updates should stay visible on this device.</p>
              </div>

              <div class="applicant-settings-modal__switch-list">
                <button
                  type="button"
                  class="applicant-settings-modal__switch-row"
                  role="switch"
                  :aria-checked="preferences.inboxUpdates ? 'true' : 'false'"
                  @click="togglePreference('inboxUpdates')"
                >
                  <span class="applicant-settings-modal__switch-copy">
                    <strong>Inbox updates</strong>
                    <small>Keep employer inbox changes easy to catch when you return.</small>
                  </span>
                  <span
                    class="applicant-settings-modal__switch"
                    :class="{ 'is-active': preferences.inboxUpdates }"
                  >
                    <span />
                  </span>
                </button>

                <button
                  type="button"
                  class="applicant-settings-modal__switch-row"
                  role="switch"
                  :aria-checked="preferences.interviewReminders ? 'true' : 'false'"
                  @click="togglePreference('interviewReminders')"
                >
                  <span class="applicant-settings-modal__switch-copy">
                    <strong>Interview reminders</strong>
                    <small>Prioritize interview activity and follow-up reminders in your workspace.</small>
                  </span>
                  <span
                    class="applicant-settings-modal__switch"
                    :class="{ 'is-active': preferences.interviewReminders }"
                  >
                    <span />
                  </span>
                </button>
              </div>
            </section>

            <section class="applicant-settings-modal__panel">
              <div class="applicant-settings-modal__panel-head">
                <h3>Job discovery</h3>
                <p>Fine-tune how the applicant workspace highlights hiring opportunities.</p>
              </div>

              <div class="applicant-settings-modal__switch-list">
                <button
                  type="button"
                  class="applicant-settings-modal__switch-row"
                  role="switch"
                  :aria-checked="preferences.jobMatchAlerts ? 'true' : 'false'"
                  @click="togglePreference('jobMatchAlerts')"
                >
                  <span class="applicant-settings-modal__switch-copy">
                    <strong>Job match alerts</strong>
                    <small>Keep new matching jobs emphasized inside your find-jobs flow.</small>
                  </span>
                  <span
                    class="applicant-settings-modal__switch"
                    :class="{ 'is-active': preferences.jobMatchAlerts }"
                  >
                    <span />
                  </span>
                </button>

                <button
                  type="button"
                  class="applicant-settings-modal__switch-row"
                  role="switch"
                  :aria-checked="preferences.accountTips ? 'true' : 'false'"
                  @click="togglePreference('accountTips')"
                >
                  <span class="applicant-settings-modal__switch-copy">
                    <strong>Account tips</strong>
                    <small>Show extra prompts for profile completion and applicant readiness.</small>
                  </span>
                  <span
                    class="applicant-settings-modal__switch"
                    :class="{ 'is-active': preferences.accountTips }"
                  >
                    <span />
                  </span>
                </button>
              </div>
            </section>

            <section class="applicant-settings-modal__panel applicant-settings-modal__panel--actions">
              <div class="applicant-settings-modal__panel-head">
                <h3>Quick actions</h3>
                <p>Jump to the next applicant task without leaving this modal confused.</p>
              </div>

              <div class="applicant-settings-modal__action-grid">
                <button type="button" class="applicant-settings-modal__action" @click="runAction('open-profile')">
                  <i class="bi bi-person-circle" aria-hidden="true" />
                  <span>Open Profile</span>
                </button>

                <button type="button" class="applicant-settings-modal__action" @click="runAction('open-help-center')">
                  <i class="bi bi-life-preserver" aria-hidden="true" />
                  <span>Help Center</span>
                </button>

                <button type="button" class="applicant-settings-modal__action" @click="runAction('open-terms')">
                  <i class="bi bi-shield-check" aria-hidden="true" />
                  <span>Terms & Policies</span>
                </button>

                <button type="button" class="applicant-settings-modal__action applicant-settings-modal__action--danger" @click="runAction('logout')">
                  <i class="bi bi-box-arrow-right" aria-hidden="true" />
                  <span>Log Out</span>
                </button>
              </div>
            </section>

            <section class="applicant-settings-modal__panel applicant-settings-modal__panel--note">
              <div class="applicant-settings-modal__panel-head">
                <h3>Saved automatically</h3>
                <p>Your choices in this modal are stored on this browser so you do not need to set them every time.</p>
              </div>
            </section>
          </div>

          <footer class="applicant-settings-modal__footer">
            <button type="button" class="applicant-settings-modal__done" @click="$emit('close')">
              Done
            </button>
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.applicant-settings-modal {
  position: fixed;
  inset: 0;
  z-index: 240;
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

.applicant-settings-modal__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(12, 24, 18, 0.46);
  backdrop-filter: blur(8px);
  cursor: pointer;
}

.applicant-settings-modal__dialog {
  position: relative;
  z-index: 1;
  width: min(68rem, 100%);
  max-height: min(92vh, 58rem);
  overflow: auto;
  padding: 1.35rem;
  border: 1px solid rgba(116, 154, 130, 0.24);
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at top right, rgba(226, 244, 233, 0.82), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 250, 247, 0.98));
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.18);
}

.applicant-settings-modal__header,
.applicant-settings-modal__account,
.applicant-settings-modal__panel,
.applicant-settings-modal__footer {
  border: 1px solid rgba(175, 197, 184, 0.28);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.applicant-settings-modal__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding: 1.2rem 1.25rem;
  border-radius: 1.2rem;
}

.applicant-settings-modal__header-copy,
.applicant-settings-modal__header-copy h2,
.applicant-settings-modal__header-copy p {
  margin: 0;
}

.applicant-settings-modal__header-copy {
  display: grid;
  gap: 0.32rem;
}

.applicant-settings-modal__eyebrow {
  color: #4a705b;
  font-size: 0.73rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.applicant-settings-modal__header-copy h2 {
  color: #173927;
  font-size: clamp(1.4rem, 2vw, 1.8rem);
  line-height: 1.1;
}

.applicant-settings-modal__header-copy p {
  color: #5f776a;
  font-size: 0.92rem;
  line-height: 1.6;
  max-width: 38rem;
}

.applicant-settings-modal__close {
  width: 2.7rem;
  height: 2.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(196, 210, 201, 0.84);
  border-radius: 0.95rem;
  background: #ffffff;
  color: #214133;
  cursor: pointer;
}

.applicant-settings-modal__account {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.15rem;
  border-radius: 1.15rem;
}

.applicant-settings-modal__avatar {
  width: 3.25rem;
  height: 3.25rem;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(226, 244, 233, 0.98), rgba(247, 251, 248, 0.98));
  border: 1px solid rgba(169, 212, 185, 0.84);
  color: #1f6a44;
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.applicant-settings-modal__account-copy {
  display: grid;
  gap: 0.18rem;
  min-width: 0;
}

.applicant-settings-modal__account-copy strong,
.applicant-settings-modal__account-copy span {
  overflow-wrap: anywhere;
}

.applicant-settings-modal__account-copy strong {
  color: #183927;
  font-size: 1rem;
}

.applicant-settings-modal__account-copy span,
.applicant-settings-modal__account-meta span {
  color: #6a8175;
  font-size: 0.84rem;
}

.applicant-settings-modal__account-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.applicant-settings-modal__account-meta span {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding: 0.32rem 0.7rem;
  border: 1px solid rgba(214, 225, 218, 0.95);
  border-radius: 999px;
  background: rgba(245, 249, 246, 0.96);
}

.applicant-settings-modal__grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.applicant-settings-modal__panel {
  display: grid;
  gap: 1rem;
  align-content: start;
  padding: 1.1rem 1.15rem;
  border-radius: 1.15rem;
}

.applicant-settings-modal__panel-head,
.applicant-settings-modal__panel-head h3,
.applicant-settings-modal__panel-head p {
  margin: 0;
}

.applicant-settings-modal__panel-head {
  display: grid;
  gap: 0.24rem;
}

.applicant-settings-modal__panel-head h3 {
  color: #173927;
  font-size: 1rem;
}

.applicant-settings-modal__panel-head p {
  color: #657d71;
  font-size: 0.84rem;
  line-height: 1.55;
}

.applicant-settings-modal__switch-list {
  display: grid;
  gap: 0.72rem;
}

.applicant-settings-modal__switch-row {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: center;
  padding: 0.9rem 0.95rem;
  border: 1px solid rgba(212, 223, 216, 0.95);
  border-radius: 1rem;
  background: linear-gradient(180deg, rgba(252, 253, 252, 0.98), rgba(246, 250, 247, 0.98));
  text-align: left;
  cursor: pointer;
}

.applicant-settings-modal__switch-copy {
  display: grid;
  gap: 0.18rem;
}

.applicant-settings-modal__switch-copy strong {
  color: #1a3528;
  font-size: 0.92rem;
}

.applicant-settings-modal__switch-copy small {
  color: #6d8277;
  font-size: 0.79rem;
  line-height: 1.5;
}

.applicant-settings-modal__switch {
  width: 3.2rem;
  height: 1.9rem;
  padding: 0.18rem;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #dce7df;
  transition: background-color 0.18s ease;
}

.applicant-settings-modal__switch span {
  width: 1.52rem;
  height: 1.52rem;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.14);
  transition: transform 0.18s ease;
}

.applicant-settings-modal__switch.is-active {
  background: #2f8f5b;
}

.applicant-settings-modal__switch.is-active span {
  transform: translateX(1.28rem);
}

.applicant-settings-modal__action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.applicant-settings-modal__action {
  min-height: 5.2rem;
  display: grid;
  justify-items: start;
  align-content: center;
  gap: 0.45rem;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(209, 220, 213, 0.96);
  border-radius: 1rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 250, 247, 0.98));
  color: #1f4735;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.applicant-settings-modal__action i {
  font-size: 1rem;
}

.applicant-settings-modal__action--danger {
  color: #9d2f2f;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(254, 244, 244, 0.98));
  border-color: rgba(239, 184, 184, 0.92);
}

.applicant-settings-modal__panel--note {
  align-items: center;
}

.applicant-settings-modal__footer {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  padding: 0.9rem 1rem;
  border-radius: 1.1rem;
}

.applicant-settings-modal__done {
  min-height: 2.7rem;
  padding: 0.55rem 1.15rem;
  border: 1px solid #2f8f5b;
  border-radius: 0.95rem;
  background: #2f8f5b;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.applicant-settings-modal-enter-active,
.applicant-settings-modal-leave-active {
  transition: opacity 0.2s ease;
}

.applicant-settings-modal-enter-from,
.applicant-settings-modal-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .applicant-settings-modal {
    padding: 1rem;
  }

  .applicant-settings-modal__dialog {
    padding: 1rem;
  }

  .applicant-settings-modal__account,
  .applicant-settings-modal__grid {
    grid-template-columns: 1fr;
  }

  .applicant-settings-modal__account-meta {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .applicant-settings-modal__header {
    grid-template-columns: 1fr;
  }

  .applicant-settings-modal__close {
    justify-self: end;
  }

  .applicant-settings-modal__action-grid {
    grid-template-columns: 1fr;
  }

  .applicant-settings-modal__switch-row {
    grid-template-columns: 1fr;
  }
}
</style>
