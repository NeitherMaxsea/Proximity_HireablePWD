<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  canEditBusinessModule: {
    type: Function,
    default: () => false,
  },
  openIssueOfferModal: {
    type: Function,
    default: () => {},
  },
})

const issueOfferRows = computed(() => (Array.isArray(props.rows) ? props.rows : []))
const canEditIssueOffers = computed(() =>
  props.canEditBusinessModule('issue-offer') === true || props.canEditBusinessModule('applicant-management') === true,
)

const summaryCards = computed(() => {
  const rows = issueOfferRows.value

  return [
    {
      id: 'total',
      label: 'Offer Queue',
      value: String(rows.length),
      tone: 'mint',
      copy: 'Applicants currently visible for offer drafting or follow-up.',
    },
    {
      id: 'ready',
      label: 'Ready To Send',
      value: String(rows.filter((row) => String(row.offerStatus || '').trim() === 'not_sent').length),
      tone: 'amber',
      copy: 'Applicants who can receive a first offer right now.',
    },
    {
      id: 'sent',
      label: 'Offer Sent',
      value: String(rows.filter((row) => String(row.offerStatus || '').trim() === 'sent').length),
      tone: 'sky',
      copy: 'Offers already sent and waiting for the applicant response.',
    },
    {
      id: 'accepted',
      label: 'Accepted',
      value: String(rows.filter((row) => String(row.offerStatus || '').trim() === 'accepted').length),
      tone: 'rose',
      copy: 'Accepted offers that can move to Contract Signing.',
    },
  ]
})

const formatDateLabel = (value, options = {}) => {
  const parsedValue = new Date(String(value || '').trim())
  if (Number.isNaN(parsedValue.getTime())) return 'Not set'

  return parsedValue.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    ...options,
  })
}

const openRowOfferModal = (rowId) => {
  props.openIssueOfferModal(String(rowId || '').trim())
}
</script>

<template>
  <section class="business-issue-offer-page">
    <header class="business-issue-offer-page__hero">
      <div class="business-issue-offer-page__hero-copy">
        <span class="business-issue-offer-page__eyebrow">Recruitment Follow-up</span>
        <h2>Issue Offer</h2>
        <p>
          Restore the offer queue directly in the sidebar so approved applicants and interview passers can receive
          their job offer without leaving the business workspace flow.
        </p>
      </div>

      <div class="business-issue-offer-page__hero-panel">
        <strong>{{ issueOfferRows.length }} candidate{{ issueOfferRows.length === 1 ? '' : 's' }}</strong>
        <p>
          {{ canEditIssueOffers
            ? 'Open any row to draft, edit, or resend the offer letter in the modal.'
            : 'You currently have view-only access for Issue Offer.' }}
        </p>
      </div>
    </header>

    <section class="business-issue-offer-page__summary-grid">
      <article
        v-for="card in summaryCards"
        :key="card.id"
        class="business-issue-offer-page__summary-card"
        :class="`business-issue-offer-page__summary-card--${card.tone}`"
      >
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
        <p>{{ card.copy }}</p>
      </article>
    </section>

    <article class="business-issue-offer-page__panel">
      <div class="business-issue-offer-page__panel-head">
        <div>
          <h3>Offer-ready applicants</h3>
          <p>Applicants stay in this queue after approval or completed interview stages so the offer flow is easy to reopen.</p>
        </div>
        <span class="business-issue-offer-page__count">{{ issueOfferRows.length }} visible</span>
      </div>

      <div v-if="issueOfferRows.length" class="business-issue-offer-page__table-shell">
        <table class="business-issue-offer-page__table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Applied Job</th>
              <th>Passed Stage</th>
              <th>Offer Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in issueOfferRows" :key="row.id">
              <td>
                <div class="business-issue-offer-page__identity">
                  <span class="business-issue-offer-page__avatar">
                    <img
                      v-if="row.applicantAvatar"
                      :src="row.applicantAvatar"
                      :alt="`${row.applicantName} avatar`"
                    >
                    <template v-else>{{ row.applicantInitials }}</template>
                  </span>
                  <div>
                    <strong>{{ row.applicantName }}</strong>
                    <small>{{ row.applicantEmail }}</small>
                  </div>
                </div>
              </td>
              <td>
                <strong>{{ row.jobTitle }}</strong>
                <small>{{ row.offerTitle || 'Ready for offer drafting' }}</small>
              </td>
              <td>
                <strong>{{ row.passedStageLabel }}</strong>
                <small>
                  {{ row.completedAt ? `Completed ${formatDateLabel(row.completedAt, { hour: 'numeric', minute: '2-digit' })}` : 'Waiting for completion date' }}
                </small>
              </td>
              <td>
                <span
                  class="business-issue-offer-page__status"
                  :class="`is-${row.offerTone}`"
                >
                  {{ row.offerStatusLabel }}
                </span>
                <small>{{ row.offerMeta }}</small>
              </td>
              <td>
                <button
                  type="button"
                  class="business-issue-offer-page__action"
                  :disabled="!canEditIssueOffers"
                  @click="openRowOfferModal(row.id)"
                >
                  {{ row.actionLabel }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="business-issue-offer-page__empty">
        <i class="bi bi-envelope-paper" aria-hidden="true" />
        <h3>No offer-ready applicants yet</h3>
        <p>Applicants will appear here after approval or once their latest interview is completed.</p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.business-issue-offer-page {
  display: grid;
  gap: 1.5rem;
}

.business-issue-offer-page__hero,
.business-issue-offer-page__hero-panel,
.business-issue-offer-page__summary-card,
.business-issue-offer-page__panel {
  border-radius: 1.5rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.business-issue-offer-page__hero {
  display: grid;
  gap: 1rem;
  padding: 1.6rem;
  grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.85fr);
}

.business-issue-offer-page__hero-copy,
.business-issue-offer-page__hero-panel,
.business-issue-offer-page__summary-card,
.business-issue-offer-page__panel {
  padding: 1.5rem;
}

.business-issue-offer-page__eyebrow,
.business-issue-offer-page__summary-card span,
.business-issue-offer-page__identity small,
.business-issue-offer-page__table small,
.business-issue-offer-page__hero-panel p,
.business-issue-offer-page__panel-head p {
  color: #5b6b62;
  font-size: 0.9rem;
}

.business-issue-offer-page__hero-copy h2,
.business-issue-offer-page__hero-copy p,
.business-issue-offer-page__hero-panel strong,
.business-issue-offer-page__summary-card p,
.business-issue-offer-page__empty h3,
.business-issue-offer-page__empty p,
.business-issue-offer-page__panel-head h3,
.business-issue-offer-page__panel-head p {
  margin: 0;
}

.business-issue-offer-page__hero-copy {
  display: grid;
  gap: 0.75rem;
}

.business-issue-offer-page__hero-copy h2 {
  color: #153326;
  font-size: clamp(1.8rem, 2.6vw, 2.45rem);
}

.business-issue-offer-page__hero-copy p,
.business-issue-offer-page__hero-panel p,
.business-issue-offer-page__summary-card p,
.business-issue-offer-page__empty p,
.business-issue-offer-page__table small {
  line-height: 1.6;
}

.business-issue-offer-page__hero-panel {
  display: grid;
  gap: 0.65rem;
  align-content: start;
  background: linear-gradient(145deg, rgba(15, 118, 110, 0.08), rgba(14, 116, 144, 0.03));
}

.business-issue-offer-page__hero-panel strong,
.business-issue-offer-page__summary-card strong,
.business-issue-offer-page__table strong,
.business-issue-offer-page__panel-head h3 {
  color: #153326;
}

.business-issue-offer-page__summary-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
}

.business-issue-offer-page__summary-card {
  display: grid;
  gap: 0.45rem;
}

.business-issue-offer-page__summary-card strong {
  font-size: 1.8rem;
}

.business-issue-offer-page__summary-card--mint {
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.12), rgba(255, 255, 255, 0.98));
}

.business-issue-offer-page__summary-card--amber {
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.12), rgba(255, 255, 255, 0.98));
}

.business-issue-offer-page__summary-card--sky {
  background: linear-gradient(180deg, rgba(14, 165, 233, 0.12), rgba(255, 255, 255, 0.98));
}

.business-issue-offer-page__summary-card--rose {
  background: linear-gradient(180deg, rgba(244, 63, 94, 0.1), rgba(255, 255, 255, 0.98));
}

.business-issue-offer-page__panel {
  display: grid;
  gap: 1rem;
}

.business-issue-offer-page__panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.business-issue-offer-page__count,
.business-issue-offer-page__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 0.38rem 0.8rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.business-issue-offer-page__count {
  color: #155e75;
  background: rgba(14, 165, 233, 0.1);
}

.business-issue-offer-page__status.is-success {
  color: #166534;
  background: rgba(34, 197, 94, 0.12);
}

.business-issue-offer-page__status.is-danger {
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.12);
}

.business-issue-offer-page__status.is-warning {
  color: #b45309;
  background: rgba(245, 158, 11, 0.14);
}

.business-issue-offer-page__status.is-muted {
  color: #475569;
  background: rgba(148, 163, 184, 0.14);
}

.business-issue-offer-page__table-shell {
  overflow-x: auto;
}

.business-issue-offer-page__table {
  width: 100%;
  border-collapse: collapse;
}

.business-issue-offer-page__table th,
.business-issue-offer-page__table td {
  padding: 1rem 0.8rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  text-align: left;
  vertical-align: top;
}

.business-issue-offer-page__table th {
  border-top: 0;
  color: #5b6b62;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.business-issue-offer-page__identity {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

.business-issue-offer-page__avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #d9f99d, #a7f3d0);
  color: #166534;
  font-weight: 800;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.business-issue-offer-page__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.business-issue-offer-page__identity strong,
.business-issue-offer-page__table strong {
  display: block;
}

.business-issue-offer-page__action {
  border: 0;
  border-radius: 999px;
  padding: 0.72rem 1rem;
  font: inherit;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #0f766e, #0284c7);
  cursor: pointer;
}

.business-issue-offer-page__action:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.business-issue-offer-page__empty {
  display: grid;
  gap: 0.55rem;
  place-items: center;
  padding: 2rem 1rem;
  text-align: center;
}

.business-issue-offer-page__empty i {
  color: #0f766e;
  font-size: 2rem;
}

@media (max-width: 900px) {
  .business-issue-offer-page__hero {
    grid-template-columns: 1fr;
  }

  .business-issue-offer-page__panel-head {
    flex-direction: column;
  }
}
</style>
