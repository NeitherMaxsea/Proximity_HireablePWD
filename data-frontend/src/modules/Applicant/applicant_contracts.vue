<script setup>
import { computed } from 'vue'
import DigitalSignaturePad from '@/components/DigitalSignaturePad.vue'

const props = defineProps({
  contracts: {
    type: Array,
    default: () => [],
  },
  activeContractId: {
    type: String,
    default: '',
  },
  applicantSignatureName: {
    type: String,
    default: '',
  },
  applicantConsentChecked: {
    type: Boolean,
    default: false,
  },
  activeSubmittingContractId: {
    type: String,
    default: '',
  },
  activeProviderContractId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'select-contract',
  'update:applicant-signature-name',
  'update:applicant-consent-checked',
  'sign-contract',
  'open-provider-sign',
  'refresh-provider-status',
])

const activeContract = computed(() =>
  props.contracts.find((record) => String(record?.id || '').trim() === String(props.activeContractId || '').trim())
  || props.contracts[0]
  || null,
)
const canApplicantSign = computed(() => {
  const status = String(activeContract.value?.status || '').trim().toLowerCase()
  return ['sent'].includes(status)
})
const activeSubmitState = computed(() =>
  String(props.activeSubmittingContractId || '').trim()
  && String(activeContract.value?.id || '').trim() === String(props.activeSubmittingContractId || '').trim(),
)
const activeProviderState = computed(() =>
  String(props.activeProviderContractId || '').trim()
  && String(activeContract.value?.id || '').trim() === String(props.activeProviderContractId || '').trim(),
)
const emptyStateHighlights = [
  {
    id: 'wait',
    icon: 'bi bi-envelope-paper',
    label: 'Wait for a contract',
    copy: 'A contract appears here after the business approves your application and sends the agreement.',
  },
  {
    id: 'review',
    icon: 'bi bi-file-earmark-text',
    label: 'Review the details',
    copy: 'Read the job title, salary offer, start date, and notes before you add your signature.',
  },
  {
    id: 'sign',
    icon: 'bi bi-pencil-square',
    label: 'Sign digitally',
    copy: 'Draw your signature electronically, confirm consent, and return the document to the business.',
  },
]

const selectContract = (contractId) => {
  emit('select-contract', contractId)
}

const submitSignature = (payload = {}) => {
  if (!activeContract.value) return

  emit('sign-contract', {
    contractId: activeContract.value.id,
    signatureDataUrl: payload.signatureDataUrl,
  })
}
</script>

<template>
  <section class="applicant-contracts">
    <section class="applicant-contracts__grid">
      <aside class="applicant-contracts__rail">
        <article class="applicant-contracts__summary-card">
          <div class="applicant-contracts__summary-head">
            <span class="applicant-contracts__summary-badge">Applicant</span>
            <span class="applicant-contracts__summary-status">Contracts</span>
          </div>

          <div class="applicant-contracts__identity">
            <p class="applicant-contracts__eyebrow">Digital Signing</p>
            <h2>Contract Review</h2>
            <p>Open the contract sent by the business, review the agreement, and sign it electronically.</p>
          </div>

          <div class="applicant-contracts__mini-list">
            <div class="applicant-contracts__mini-item">
              <span><i class="bi bi-inbox" aria-hidden="true" /> Total Contracts</span>
              <strong>{{ contracts.length }}</strong>
            </div>
            <div class="applicant-contracts__mini-item">
              <span><i class="bi bi-hourglass-split" aria-hidden="true" /> Waiting for My Signature</span>
              <strong>{{ contracts.filter((item) => item.status === 'sent').length }}</strong>
            </div>
            <div class="applicant-contracts__mini-item">
              <span><i class="bi bi-send-check" aria-hidden="true" /> Sent Back to Business</span>
              <strong>{{ contracts.filter((item) => item.status === 'applicant_signed').length }}</strong>
            </div>
            <div class="applicant-contracts__mini-item">
              <span><i class="bi bi-patch-check" aria-hidden="true" /> Fully Completed</span>
              <strong>{{ contracts.filter((item) => item.status === 'completed').length }}</strong>
            </div>
          </div>
        </article>
      </aside>

      <article class="applicant-contracts__panel">
        <div class="applicant-contracts__head">
          <div>
            <h3>My Contracts</h3>
            <span>Review, sign, and send contracts back to the business.</span>
          </div>
          <span class="applicant-contracts__head-count">
            {{ contracts.length }} contract<span v-if="contracts.length !== 1">s</span>
          </span>
        </div>

        <div v-if="contracts.length" class="applicant-contracts__layout">
          <section class="applicant-contracts__list">
            <button
              v-for="contract in contracts"
              :key="contract.id"
              type="button"
              class="applicant-contracts__list-item"
              :class="{ 'is-active': activeContract && activeContract.id === contract.id }"
              @click="selectContract(contract.id)"
            >
              <div class="applicant-contracts__list-top">
                <strong>{{ contract.contractTitle }}</strong>
                <span class="applicant-status-pill" :class="`applicant-status-pill--${contract.statusTone}`">
                  {{ contract.statusLabel }}
                </span>
              </div>
              <p>{{ contract.jobTitle }}</p>
              <small>{{ contract.companyName }}</small>
            </button>
          </section>

          <section v-if="activeContract" class="applicant-contracts__detail">
            <article class="applicant-contracts__document">
              <div class="applicant-contracts__document-head">
                <div>
                  <p class="applicant-contracts__document-eyebrow">Contract Details</p>
                  <h4>{{ activeContract.contractTitle }}</h4>
                </div>
                <span class="applicant-status-pill" :class="`applicant-status-pill--${activeContract.statusTone}`">
                  {{ activeContract.statusLabel }}
                </span>
              </div>

              <div class="applicant-contracts__meta">
                <span class="applicant-contracts__pill">
                  <i class="bi bi-briefcase" />
                  {{ activeContract.jobTitle }}
                </span>
                <span class="applicant-contracts__pill">
                  <i class="bi bi-cash-stack" />
                  {{ activeContract.salaryOffer || 'Salary not set' }}
                </span>
                <span class="applicant-contracts__pill">
                  <i class="bi bi-calendar-event" />
                  Start {{ activeContract.startDate || 'Not set' }}
                </span>
                <span class="applicant-contracts__pill">
                  <i class="bi bi-person-badge" />
                  {{ activeContract.employmentType || 'Employment type not set' }}
                </span>
              </div>

              <div class="applicant-contracts__copy">
                <section class="applicant-contracts__section">
                  <h5>Agreement</h5>
                  <p>{{ activeContract.contractBody || 'No contract body was added yet.' }}</p>
                </section>

                <section v-if="activeContract.notes" class="applicant-contracts__section">
                  <h5>Notes</h5>
                  <p>{{ activeContract.notes }}</p>
                </section>

                <section class="applicant-contracts__section">
                  <h5>Signing Status</h5>
                  <div class="applicant-contracts__status-list">
                    <div class="applicant-contracts__status-row">
                      <span>Business sent</span>
                      <strong>{{ activeContract.sentAtLabel || 'Not set' }}</strong>
                    </div>
                    <div class="applicant-contracts__status-row">
                      <span>Applicant signed</span>
                      <strong>{{ activeContract.applicantSignedAtLabel || 'Pending' }}</strong>
                    </div>
                    <div class="applicant-contracts__status-row">
                      <span>Business countersigned</span>
                      <strong>{{ activeContract.businessSignedAtLabel || 'Pending' }}</strong>
                    </div>
                  </div>
                </section>
              </div>
            </article>

            <DigitalSignaturePad
              v-if="canApplicantSign"
              :signer-name="applicantSignatureName"
              :consent-checked="applicantConsentChecked"
              :is-submitting="activeSubmitState"
              title="Applicant Signature"
              description="After you sign, the contract is returned to the business so they can countersign it."
              signer-name-label="Applicant Full Name"
              submit-label="Sign and Send Back"
              @update:signer-name="emit('update:applicant-signature-name', $event)"
              @update:consent-checked="emit('update:applicant-consent-checked', $event)"
              @submit="submitSignature"
            />

            <div v-if="activeContract" class="applicant-contracts__provider-actions">
              <button
                v-if="canApplicantSign"
                type="button"
                class="applicant-contracts__provider-button applicant-contracts__provider-button--primary"
                :disabled="activeProviderState"
                @click="emit('open-provider-sign', activeContract.id)"
              >
                <i class="bi bi-box-arrow-up-right" aria-hidden="true" />
                <span>{{ activeProviderState ? 'Opening Digital API...' : 'Open Digital API Sign' }}</span>
              </button>
              <button
                v-if="activeContract.providerEnvelopeId"
                type="button"
                class="applicant-contracts__provider-button applicant-contracts__provider-button--ghost"
                :disabled="activeProviderState"
                @click="emit('refresh-provider-status', activeContract.id)"
              >
                <i class="bi bi-arrow-clockwise" aria-hidden="true" />
                <span>Refresh API Status</span>
              </button>
            </div>

            <article v-else class="applicant-contracts__notice-card">
              <h5>Contract progress</h5>
              <p v-if="activeContract.status === 'applicant_signed'">
                Your signature was already submitted. The business can now countersign the contract.
              </p>
              <p v-else-if="activeContract.status === 'completed'">
                This contract is fully signed by both sides.
              </p>
              <p v-else>
                This contract is not ready for applicant signing right now.
              </p>
            </article>
          </section>
        </div>

        <div v-else class="applicant-contracts__empty">
          <section class="applicant-contracts__empty-hero">
            <span class="applicant-contracts__empty-icon" aria-hidden="true">
              <i class="bi bi-file-earmark-lock" />
            </span>
            <p class="applicant-contracts__empty-overline">Contract Signing</p>
            <h3>No contracts yet</h3>
            <p>Contracts sent by businesses will appear here once your application moves into the hiring offer stage.</p>
          </section>

          <section class="applicant-contracts__empty-highlights">
            <article
              v-for="item in emptyStateHighlights"
              :key="item.id"
              class="applicant-contracts__empty-highlight"
            >
              <span class="applicant-contracts__empty-highlight-icon" aria-hidden="true">
                <i :class="item.icon" />
              </span>
              <div class="applicant-contracts__empty-highlight-copy">
                <strong>{{ item.label }}</strong>
                <p>{{ item.copy }}</p>
              </div>
            </article>
          </section>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.applicant-contracts {
  display: grid;
  gap: 1.25rem;
  padding: 0 1.5rem;
  align-content: start;
  width: 100%;
  min-height: calc(100vh - 8rem);
}

.applicant-contracts__grid {
  display: grid;
  grid-template-columns: minmax(17rem, 19rem) minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}

.applicant-contracts__rail {
  display: grid;
  position: sticky;
  top: 6rem;
}

.applicant-contracts__summary-card,
.applicant-contracts__panel,
.applicant-contracts__document,
.applicant-contracts__notice-card,
.applicant-contracts__provider-actions {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid rgba(129, 169, 143, 0.18);
  border-radius: 1.35rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(244, 251, 247, 0.95) 100%);
  box-shadow:
    0 20px 40px rgba(79, 129, 102, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.applicant-contracts__provider-actions {
  grid-template-columns: repeat(auto-fit, minmax(12rem, max-content));
  align-items: center;
  justify-content: start;
}

.applicant-contracts__provider-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 2.8rem;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.applicant-contracts__provider-button:disabled {
  cursor: wait;
  opacity: 0.75;
}

.applicant-contracts__provider-button--primary {
  background: linear-gradient(135deg, #2f8f5b 0%, #256a44 100%);
  color: #fff;
  box-shadow: 0 14px 30px rgba(47, 143, 91, 0.18);
}

.applicant-contracts__provider-button--ghost {
  border-color: rgba(129, 169, 143, 0.28);
  background: #fff;
  color: #274333;
}

.applicant-contracts__summary-card {
  background:
    radial-gradient(circle at top right, rgba(208, 241, 221, 0.62), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(245, 251, 247, 0.98) 100%);
}

.applicant-contracts__summary-head,
.applicant-contracts__head,
.applicant-contracts__document-head,
.applicant-contracts__list-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.applicant-contracts__summary-badge,
.applicant-contracts__summary-status,
.applicant-contracts__head-count,
.applicant-contracts__pill {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  border: 1px solid rgba(190, 206, 197, 0.95);
  border-radius: 999px;
  padding: 0 0.82rem;
  font-size: 0.72rem;
  font-weight: 800;
}

.applicant-contracts__summary-badge {
  color: #45574f;
  background: #f8fbf8;
}

.applicant-contracts__summary-status {
  color: #1d6b3a;
  background: #eef8f1;
}

.applicant-contracts__identity,
.applicant-contracts__identity h2,
.applicant-contracts__identity p,
.applicant-contracts__eyebrow,
.applicant-contracts__head h3,
.applicant-contracts__document h4,
.applicant-contracts__document p,
.applicant-contracts__empty h3,
.applicant-contracts__empty p {
  margin: 0;
}

.applicant-contracts__eyebrow,
.applicant-contracts__document-eyebrow,
.applicant-contracts__empty-overline {
  color: #6c8376;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.applicant-contracts__identity h2 {
  color: #16271f;
  font-size: clamp(1.45rem, 2vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.applicant-contracts__identity p:last-child {
  color: #5f7268;
  font-size: 0.86rem;
  line-height: 1.65;
}

.applicant-contracts__mini-list,
.applicant-contracts__meta,
.applicant-contracts__status-list,
.applicant-contracts__empty-highlights {
  display: grid;
  gap: 0.85rem;
}

.applicant-contracts__mini-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.applicant-contracts__mini-item,
.applicant-contracts__list-item,
.applicant-contracts__empty-highlight {
  display: grid;
  gap: 0.45rem;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(193, 206, 214, 0.92);
  border-radius: 1.05rem;
  background: rgba(255, 255, 255, 0.94);
}

.applicant-contracts__mini-item span,
.applicant-contracts__head span,
.applicant-contracts__list-item p,
.applicant-contracts__list-item small,
.applicant-contracts__copy p,
.applicant-contracts__status-row span,
.applicant-contracts__notice-card p,
.applicant-contracts__empty-highlight-copy p {
  color: #5f7268;
}

.applicant-contracts__mini-item strong,
.applicant-contracts__head h3,
.applicant-contracts__document h4,
.applicant-contracts__copy h5,
.applicant-contracts__status-row strong,
.applicant-contracts__notice-card h5,
.applicant-contracts__empty-highlight-copy strong,
.applicant-contracts__list-item strong {
  color: #183126;
}

.applicant-contracts__panel {
  min-height: clamp(34rem, calc(100vh - 10rem), 46rem);
  grid-template-rows: auto minmax(0, 1fr);
}

.applicant-contracts__layout {
  display: grid;
  grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr);
  gap: 1rem;
  min-height: 0;
}

.applicant-contracts__list {
  display: grid;
  gap: 0.8rem;
  align-content: start;
}

.applicant-contracts__list-item {
  text-align: left;
  cursor: pointer;
}

.applicant-contracts__list-item.is-active {
  border-color: rgba(27, 138, 84, 0.42);
  box-shadow: 0 18px 30px rgba(27, 138, 84, 0.12);
}

.applicant-contracts__detail {
  display: grid;
  gap: 1rem;
  align-content: start;
}

.applicant-contracts__meta {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.applicant-contracts__pill {
  gap: 0.45rem;
  justify-content: flex-start;
  min-height: 2.3rem;
  background: #f9fbfa;
  color: #355646;
}

.applicant-contracts__copy {
  display: grid;
  gap: 1rem;
}

.applicant-contracts__section {
  display: grid;
  gap: 0.35rem;
}

.applicant-contracts__section h5 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 800;
}

.applicant-contracts__copy p,
.applicant-contracts__notice-card p,
.applicant-contracts__empty > .applicant-contracts__empty-hero > p:last-of-type {
  font-size: 0.84rem;
  line-height: 1.65;
}

.applicant-contracts__status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 2.7rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid rgba(213, 221, 216, 0.95);
  border-radius: 0.95rem;
  background: #f9fbfa;
}

.applicant-contracts__empty {
  min-height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(17rem, 21rem);
  gap: 1rem;
  align-items: stretch;
  padding: 1.2rem;
  border: 1px dashed rgba(179, 203, 188, 0.98);
  border-radius: 1.3rem;
  background:
    radial-gradient(circle at top left, rgba(233, 247, 238, 0.92), transparent 32%),
    linear-gradient(180deg, rgba(253, 255, 253, 0.98) 0%, rgba(244, 250, 246, 0.96) 100%);
}

.applicant-contracts__empty-hero,
.applicant-contracts__empty-highlights {
  display: grid;
  align-content: center;
}

.applicant-contracts__empty-hero {
  gap: 0.8rem;
}

.applicant-contracts__empty-icon,
.applicant-contracts__empty-highlight-icon {
  display: inline-grid;
  place-items: center;
}

.applicant-contracts__empty-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1.2rem;
  background: linear-gradient(135deg, rgba(28, 138, 84, 0.15), rgba(95, 186, 128, 0.08));
  color: #1b8a54;
}

.applicant-contracts__empty-highlight {
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  align-items: start;
}

.applicant-contracts__empty-highlight-icon {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 0.9rem;
  background: rgba(29, 107, 58, 0.1);
  color: #1d6b3a;
}

.applicant-contracts__empty-highlight-copy {
  display: grid;
  gap: 0.3rem;
}

@media (max-width: 1080px) {
  .applicant-contracts__grid,
  .applicant-contracts__layout,
  .applicant-contracts__empty {
    grid-template-columns: 1fr;
  }

  .applicant-contracts__rail {
    position: static;
    top: auto;
  }

  .applicant-contracts__panel {
    min-height: auto;
  }
}

@media (max-width: 720px) {
  .applicant-contracts {
    padding: 0 0.9rem;
    min-height: auto;
  }

  .applicant-contracts__summary-head,
  .applicant-contracts__head,
  .applicant-contracts__document-head,
  .applicant-contracts__list-top,
  .applicant-contracts__status-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .applicant-contracts__mini-list,
  .applicant-contracts__meta {
    grid-template-columns: 1fr;
  }
}
</style>
