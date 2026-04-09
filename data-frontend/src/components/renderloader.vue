<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  success: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '',
  },
  successMessage: {
    type: String,
    default: 'Successfully saved.',
  },
  autoHideMs: {
    type: Number,
    default: 900,
  },
  toastVisible: {
    type: Boolean,
    default: false,
  },
  toastTitle: {
    type: String,
    default: '',
  },
  toastMessage: {
    type: String,
    default: '',
  },
  toastKind: {
    type: String,
    default: 'success',
  },
})

const emit = defineEmits(['hidden'])

const shouldRender = ref(props.visible || props.success)
let hideTimer = 0

const loaderCopy = computed(() =>
  props.success ? props.successMessage : props.message,
)

const clearHideTimer = () => {
  if (hideTimer) {
    window.clearTimeout(hideTimer)
    hideTimer = 0
  }
}

watch(
  () => [props.visible, props.success, props.autoHideMs],
  ([visible, success, autoHideMs]) => {
    clearHideTimer()

    if (visible) {
      shouldRender.value = true
      return
    }

    if (success) {
      shouldRender.value = true
      hideTimer = window.setTimeout(() => {
        shouldRender.value = false
      }, Math.max(200, Number(autoHideMs) || 900))
      return
    }

    shouldRender.value = false
  },
  { immediate: true },
)

const handleAfterLeave = () => {
  emit('hidden')
}

onBeforeUnmount(() => {
  clearHideTimer()
})
</script>

<template>
  <Transition name="render-loader" @after-leave="handleAfterLeave">
    <div v-if="shouldRender" class="render-loader" role="status" aria-live="polite">
      <Transition name="render-loader-toast">
        <div v-if="toastVisible && (toastTitle || toastMessage)" class="render-loader__toast" :class="`is-${toastKind}`">
          <div class="render-loader__toast-icon" aria-hidden="true">
            <i :class="toastKind === 'error' ? 'bi bi-x-circle-fill' : 'bi bi-check-circle-fill'" />
          </div>
          <div class="render-loader__toast-copy">
            <strong>{{ toastTitle || (toastKind === 'error' ? 'Action failed' : 'Success') }}</strong>
            <span>{{ toastMessage }}</span>
          </div>
        </div>
      </Transition>

      <div class="render-loader__surface" :class="{ 'is-success': success }">
        <span v-if="!success" class="render-loader__spinner" aria-hidden="true" />
        <span v-else class="render-loader__check" aria-hidden="true">
          <i class="bi bi-check-lg" />
        </span>
        <span class="render-loader__copy">{{ loaderCopy }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.render-loader {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: grid;
  place-items: center;
  padding: 2rem;
  background:
    radial-gradient(circle at top, rgba(148, 163, 184, 0.14), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.985) 0%, rgba(247, 250, 252, 0.99) 100%);
  backdrop-filter: blur(4px);
}

.render-loader__surface {
  width: min(100%, 32rem);
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 1rem;
  text-align: center;
  color: #0f172a;
}

.render-loader__toast {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 1;
  width: min(100%, 28rem);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.9rem;
  align-items: start;
  padding: 1rem 1.1rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(16px);
}

.render-loader__toast.is-success {
  border-color: rgba(34, 197, 94, 0.24);
}

.render-loader__toast.is-error {
  border-color: rgba(239, 68, 68, 0.24);
}

.render-loader__toast-icon {
  width: 2.45rem;
  height: 2.45rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.14);
  color: #16a34a;
  font-size: 1.05rem;
}

.render-loader__toast.is-error .render-loader__toast-icon {
  background: rgba(239, 68, 68, 0.14);
  color: #dc2626;
}

.render-loader__toast-copy {
  min-width: 0;
  display: grid;
  gap: 0.18rem;
}

.render-loader__toast-copy strong,
.render-loader__toast-copy span {
  display: block;
}

.render-loader__toast-copy strong {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.render-loader__toast-copy span {
  font-size: 0.88rem;
  line-height: 1.45;
  color: #334155;
}

.render-loader__surface.is-success {
  color: #166534;
}

.render-loader__spinner,
.render-loader__check {
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  display: grid;
  align-items: center;
  justify-content: center;
}

.render-loader__spinner {
  border-radius: 999px;
  border: 3px solid rgba(148, 163, 184, 0.3);
  border-top-color: currentColor;
  animation: render-loader-spin 0.8s linear infinite;
}

.render-loader__check {
  color: #22c55e;
  font-size: 2.2rem;
}

.render-loader__copy {
  min-width: 0;
  max-width: 24rem;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.5;
}

.render-loader-enter-active,
.render-loader-leave-active {
  transition: opacity 0.26s ease, transform 0.26s ease;
}

.render-loader-enter-from,
.render-loader-leave-to {
  opacity: 0;
  transform: scale(1.01);
}

.render-loader-toast-enter-active,
.render-loader-toast-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.render-loader-toast-enter-from,
.render-loader-toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.admin-shell[data-color-mode='dark'] .render-loader,
body[data-admin-color-mode='dark'] .render-loader {
  background:
    radial-gradient(circle at top, rgba(59, 130, 246, 0.14), transparent 28%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.96) 0%, rgba(8, 15, 28, 0.98) 100%);
}

.admin-shell[data-color-mode='dark'] .render-loader__surface,
body[data-admin-color-mode='dark'] .render-loader__surface {
  color: #f8fafc;
}

.admin-shell[data-color-mode='dark'] .render-loader__surface.is-success,
body[data-admin-color-mode='dark'] .render-loader__surface.is-success {
  color: #86efac;
}

.admin-shell[data-color-mode='dark'] .render-loader__toast,
body[data-admin-color-mode='dark'] .render-loader__toast {
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(9, 15, 28, 0.9);
  box-shadow: 0 24px 60px rgba(2, 6, 23, 0.4);
}

.admin-shell[data-color-mode='dark'] .render-loader__toast-copy strong,
body[data-admin-color-mode='dark'] .render-loader__toast-copy strong {
  color: #f8fafc;
}

.admin-shell[data-color-mode='dark'] .render-loader__toast-copy span,
body[data-admin-color-mode='dark'] .render-loader__toast-copy span {
  color: #cbd5e1;
}

.admin-shell[data-color-mode='dark'] .render-loader__spinner,
body[data-admin-color-mode='dark'] .render-loader__spinner {
  border-color: rgba(255, 255, 255, 0.16);
  border-top-color: currentColor;
}

@media (max-width: 640px) {
  .render-loader__toast {
    right: 1rem;
    left: 1rem;
    bottom: 1rem;
    width: auto;
  }
}

@keyframes render-loader-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
