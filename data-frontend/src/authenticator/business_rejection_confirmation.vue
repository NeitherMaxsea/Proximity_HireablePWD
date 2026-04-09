<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import mathLogo from '@/assets/math.png'
import { confirmBusinessRejection } from '@/lib/auth'

const route = useRoute()

const employerId = computed(() => String(route.query.employerId || '').trim())
const token = computed(() => String(route.query.token || '').trim())
const confirmState = ref('idle')
const confirmMessage = ref('')

const hasConfirmationQuery = computed(() => Boolean(employerId.value && token.value))
const isSubmitting = computed(() => confirmState.value === 'submitting')
const isSuccess = computed(() => confirmState.value === 'success')

const handleConfirm = async () => {
  if (!hasConfirmationQuery.value || isSubmitting.value || isSuccess.value) return

  confirmState.value = 'submitting'
  confirmMessage.value = ''

  try {
    const response = await confirmBusinessRejection({
      employerId: employerId.value,
      token: token.value,
    })

    confirmState.value = 'success'
    confirmMessage.value = response?.businessName
      ? `${response.businessName} has been marked as rejected successfully.`
      : 'This business rejection has been confirmed successfully.'
  } catch (error) {
    confirmState.value = 'error'
    confirmMessage.value = error instanceof Error
      ? error.message
      : 'Unable to confirm this business rejection right now.'
  }
}
</script>

<template>
  <div class="business-rejection-confirmation">
    <main class="business-rejection-confirmation__shell">
      <section class="business-rejection-confirmation__card">
        <img :src="mathLogo" alt="PWD Platform logo" class="business-rejection-confirmation__logo" />

        <p class="business-rejection-confirmation__eyebrow">Business Review</p>
        <div
          class="business-rejection-confirmation__icon"
          :class="{
            'is-success': isSuccess,
            'is-error': confirmState === 'error',
          }"
          aria-hidden="true"
        >
          <i
            class="bi"
            :class="isSuccess ? 'bi-check2-circle' : confirmState === 'error' ? 'bi-exclamation-triangle' : 'bi-envelope-exclamation'"
          />
        </div>

        <h1 class="business-rejection-confirmation__title">
          {{ isSuccess ? 'Rejection Confirmed' : 'Confirm Rejection Notice' }}
        </h1>

        <p class="business-rejection-confirmation__copy">
          <template v-if="isSuccess">
            The admin rejection notice for this business account has now been finalized.
          </template>
          <template v-else>
            Review the admin decision and confirm this rejection to finalize the business account review.
          </template>
        </p>

        <div
          class="business-rejection-confirmation__notice"
          :class="{
            'is-error': confirmState === 'error',
            'is-success': isSuccess,
          }"
        >
          <span v-if="confirmMessage">{{ confirmMessage }}</span>
          <span v-else-if="!hasConfirmationQuery">This confirmation link is incomplete or invalid.</span>
          <span v-else>Click confirm below to finish the rejection review for this business account.</span>
        </div>

        <div class="business-rejection-confirmation__actions">
          <button
            type="button"
            class="business-rejection-confirmation__action business-rejection-confirmation__action--primary"
            :disabled="!hasConfirmationQuery || isSubmitting || isSuccess"
            @click="handleConfirm"
          >
            <i class="bi" :class="isSuccess ? 'bi-check2-circle' : 'bi-send-check'" aria-hidden="true" />
            {{ isSubmitting ? 'Confirming...' : isSuccess ? 'Confirmed' : 'Confirm Rejection' }}
          </button>

          <RouterLink
            class="business-rejection-confirmation__action business-rejection-confirmation__action--secondary"
            to="/login"
          >
            Go To Login
          </RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.business-rejection-confirmation {
  min-height: 100vh;
  padding: 1.5rem;
  background:
    radial-gradient(circle at top, rgba(226, 240, 232, 0.96), transparent 42%),
    linear-gradient(180deg, #f5faf6 0%, #edf5ef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.business-rejection-confirmation__shell {
  width: min(100%, 38rem);
}

.business-rejection-confirmation__card {
  border-radius: 2rem;
  border: 1px solid #d9e6de;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.12);
  padding: 2rem;
  display: grid;
  gap: 1rem;
  text-align: center;
}

.business-rejection-confirmation__logo {
  width: 5rem;
  height: 5rem;
  object-fit: contain;
  margin: 0 auto;
}

.business-rejection-confirmation__eyebrow {
  margin: 0;
  color: #7c8f84;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.business-rejection-confirmation__icon {
  width: 5rem;
  height: 5rem;
  margin: 0 auto;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #fff3df 0%, #ffe7c2 100%);
  color: #9a6815;
  font-size: 1.8rem;
}

.business-rejection-confirmation__icon.is-success {
  background: linear-gradient(180deg, #eef8f2 0%, #dff0e6 100%);
  color: #1f7a4e;
}

.business-rejection-confirmation__icon.is-error {
  background: linear-gradient(180deg, #fff1f1 0%, #ffe3e3 100%);
  color: #a54545;
}

.business-rejection-confirmation__title {
  margin: 0;
  color: #17324d;
  font-size: clamp(1.6rem, 3vw, 2.15rem);
  font-weight: 800;
  line-height: 1.15;
}

.business-rejection-confirmation__copy {
  margin: 0;
  color: #5f6f67;
  font-size: 0.96rem;
  line-height: 1.7;
}

.business-rejection-confirmation__notice {
  border-radius: 1.2rem;
  border: 1px solid #dce7df;
  background: #f8fbf9;
  padding: 1rem 1.1rem;
  color: #476357;
  font-size: 0.92rem;
  line-height: 1.6;
}

.business-rejection-confirmation__notice.is-success {
  border-color: #cfe6d7;
  background: #f2f9f4;
  color: #246443;
}

.business-rejection-confirmation__notice.is-error {
  border-color: #ebd1d1;
  background: #fff5f5;
  color: #9c4545;
}

.business-rejection-confirmation__actions {
  display: flex;
  gap: 0.85rem;
  justify-content: center;
  flex-wrap: wrap;
}

.business-rejection-confirmation__action {
  min-height: 2.8rem;
  min-width: 12rem;
  padding: 0.7rem 1.15rem;
  border-radius: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 1px solid #d9e2db;
  text-decoration: none;
  font-size: 0.86rem;
  font-weight: 800;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.business-rejection-confirmation__action--primary {
  background: linear-gradient(180deg, #ffffff 0%, #fff5e8 100%);
  border-color: #efdfbf;
  color: #9a6815;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
}

.business-rejection-confirmation__action--secondary {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbf9 100%);
  color: #406452;
}

.business-rejection-confirmation__action:hover {
  transform: translateY(-1px);
}

.business-rejection-confirmation__action:disabled {
  opacity: 0.7;
  cursor: wait;
  transform: none;
}

@media (max-width: 640px) {
  .business-rejection-confirmation {
    padding: 1rem;
  }

  .business-rejection-confirmation__card {
    padding: 1.4rem;
    border-radius: 1.5rem;
  }

  .business-rejection-confirmation__actions {
    flex-direction: column;
  }

  .business-rejection-confirmation__action {
    width: 100%;
  }
}
</style>
