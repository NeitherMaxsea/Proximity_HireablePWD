<script setup>
import { computed, toRefs } from 'vue'

const props = defineProps([
  'businessCategory',
  'businessName',
  'currentSection',
  'hasUnlockedBusinessWorkspace',
  'dashboardSyncOverview',
  'dashboardApplicantFeed',
  'summaryCards',
  'businessTrendChart',
  'dashboardProgressCards',
  'dashboardBarSeries',
  'dashboardDonutLegend',
  'dashboardDonutStyle',
  'dashboardDonutTotal',
])

const {
  businessCategory,
  businessName,
  dashboardSyncOverview,
  dashboardApplicantFeed,
  summaryCards,
  businessTrendChart,
  dashboardBarSeries,
  dashboardDonutLegend,
  dashboardDonutStyle,
  dashboardDonutTotal,
} = toRefs(props)

const dashboardWorkspaceName = computed(() =>
  String(businessName.value || '').trim() || 'Business workspace',
)

const dashboardWorkspaceCategory = computed(() =>
  String(businessCategory.value || '').trim() || 'business',
)

const dashboardApplicantItems = computed(() =>
  (Array.isArray(dashboardApplicantFeed.value) ? dashboardApplicantFeed.value : []),
)

const dashboardApplicantFeedCount = computed(() => dashboardApplicantItems.value.length)

const dashboardApplicantNewCount = computed(() =>
  dashboardApplicantItems.value.filter((item) => item?.isNew).length,
)

const dashboardApplicantBadge = computed(() => {
  if (!dashboardApplicantFeedCount.value) return 'Waiting for applicants'
  if (dashboardApplicantNewCount.value) return `${dashboardApplicantNewCount.value} new applicants`
  return `${dashboardApplicantFeedCount.value} active applicants`
})

const dashboardRateListCount = computed(() =>
  Array.isArray(dashboardBarSeries.value) ? dashboardBarSeries.value.length : 0,
)

const resolveSummaryTrend = (card = {}) => {
  const rawValue = String(card?.value || '').trim().toLowerCase()
  if (!rawValue || rawValue === '0' || rawValue === '0%' || rawValue === 'inactive') return 'neutral'
  return 'up'
}
</script>

<template>
  <section class="business-dashboard-analytics">
    <section class="business-dashboard-analytics__summary-grid" aria-label="Business dashboard summary">
      <article
        v-for="(item, index) in summaryCards"
        :key="item.label"
        class="business-dashboard-analytics__summary-card business-dashboard-analytics__motion"
        :class="`business-dashboard-analytics__summary-card--${item.tone}`"
        :style="{ '--dashboard-enter-delay': `${120 + (index * 90)}ms` }"
      >
        <div class="business-dashboard-analytics__summary-card-top">
          <span class="business-dashboard-analytics__summary-card-label">{{ item.label }}</span>
          <span
            class="business-dashboard-analytics__summary-card-icon"
            :class="`is-${resolveSummaryTrend(item)}`"
            aria-hidden="true"
          >
            <i :class="item.icon" />
          </span>
        </div>

        <div class="business-dashboard-analytics__summary-card-body">
          <strong class="business-dashboard-analytics__summary-card-value">{{ item.value }}</strong>
          <span class="business-dashboard-analytics__summary-card-subtitle">{{ item.subtitle }}</span>
        </div>
      </article>
    </section>

    <section class="business-dashboard-analytics__grid">
      <article
        class="business-dashboard-analytics__panel business-dashboard-analytics__panel--trend business-dashboard-analytics__motion"
        style="--dashboard-enter-delay: 270ms"
      >
        <div class="business-dashboard-analytics__panel-head">
          <div>
            <h2>Business Trends</h2>
            <p class="business-dashboard-analytics__panel-subcopy">
              Monthly hiring activity for {{ dashboardWorkspaceName }}
            </p>
          </div>
          <span class="business-dashboard-analytics__pill">12 months</span>
        </div>

        <div class="business-dashboard-analytics__trend-metrics">
          <article
            v-for="card in businessTrendChart.highlightCards"
            :key="card.label"
            class="business-dashboard-analytics__trend-metric"
            :class="[`is-${card.trend}`, `is-${card.tone}`]"
          >
            <span class="business-dashboard-analytics__trend-metric-label">{{ card.label }}</span>
            <strong class="business-dashboard-analytics__trend-metric-value">{{ card.value }}</strong>
            <span class="business-dashboard-analytics__trend-metric-detail">{{ card.detail }}</span>
          </article>
        </div>

        <div class="business-dashboard-analytics__trend-chart">
          <div class="business-dashboard-analytics__trend-grid" />
          <svg
            class="business-dashboard-analytics__trend-svg"
            :viewBox="`0 0 ${businessTrendChart.chartWidth} ${businessTrendChart.chartHeight}`"
            aria-hidden="true"
          >
            <path class="business-dashboard-analytics__trend-area" :d="businessTrendChart.jobAreaPath" />
            <path class="business-dashboard-analytics__trend-line business-dashboard-analytics__trend-line--jobs" :d="businessTrendChart.jobPath" />
            <path class="business-dashboard-analytics__trend-line business-dashboard-analytics__trend-line--applicants" :d="businessTrendChart.applicantPath" />
            <circle
              v-for="point in businessTrendChart.jobPoints"
              :key="`job-${point.label}`"
              class="business-dashboard-analytics__trend-point business-dashboard-analytics__trend-point--jobs"
              :class="{ 'is-current': point.isCurrent }"
              :cx="point.x"
              :cy="point.y"
              :r="point.isCurrent ? 5.2 : 3.8"
            />
            <circle
              v-for="point in businessTrendChart.applicantPoints"
              :key="`applicant-${point.label}`"
              class="business-dashboard-analytics__trend-point business-dashboard-analytics__trend-point--applicants"
              :class="{ 'is-current': point.isCurrent }"
              :cx="point.x"
              :cy="point.y"
              :r="point.isCurrent ? 4.8 : 3.4"
            />
          </svg>

          <div class="business-dashboard-analytics__trend-summary">
            <span class="business-dashboard-analytics__trend-legend">
              <i class="bi bi-dash-lg" />
              {{ businessTrendChart.totalJobs }} job posts
            </span>
            <span class="business-dashboard-analytics__trend-legend is-applicants">
              <i class="bi bi-dash-lg" />
              {{ businessTrendChart.totalApplicants }} applicants
            </span>
          </div>

          <div class="business-dashboard-analytics__trend-labels">
            <span v-for="month in businessTrendChart.months" :key="month.key">{{ month.label }}</span>
          </div>
        </div>
      </article>

      <article
        class="business-dashboard-analytics__panel business-dashboard-analytics__panel--donut business-dashboard-analytics__motion"
        style="--dashboard-enter-delay: 360ms"
      >
        <div class="business-dashboard-analytics__panel-head">
          <div>
            <h2>Workspace Distribution</h2>
            <p class="business-dashboard-analytics__panel-subcopy">
              Current mix of jobs, applicants, and members in this {{ dashboardWorkspaceCategory }} workspace.
            </p>
          </div>
          <span class="business-dashboard-analytics__pill">{{ dashboardSyncOverview.badge }}</span>
        </div>

        <div class="business-dashboard-analytics__donut-wrap">
          <div class="business-dashboard-analytics__donut" :style="dashboardDonutStyle">
            <div class="business-dashboard-analytics__donut-center">
              <span>Total</span>
              <strong>{{ dashboardDonutTotal }}</strong>
            </div>
          </div>

          <div class="business-dashboard-analytics__legend">
            <div
              v-for="item in dashboardDonutLegend"
              :key="item.label"
              class="business-dashboard-analytics__legend-item"
            >
              <span class="business-dashboard-analytics__legend-dot" :style="{ background: item.color }" />
              <div class="business-dashboard-analytics__legend-copy">
                <span>{{ item.label }}</span>
                <small>{{ item.countLabel }}</small>
              </div>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="business-dashboard-analytics__stack">
      <article
        class="business-dashboard-analytics__panel business-dashboard-analytics__panel--workspace business-dashboard-analytics__motion"
        style="--dashboard-enter-delay: 450ms"
      >
        <div class="business-dashboard-analytics__panel-head">
          <div>
            <h2>Applicant Activity</h2>
            <p class="business-dashboard-analytics__panel-subcopy">
              Pending and fresh applications appear here automatically, while the right side keeps your hiring rates in one clean list.
            </p>
          </div>
          <span class="business-dashboard-analytics__pill">{{ dashboardApplicantBadge }}</span>
        </div>

        <div class="business-dashboard-analytics__workspace-grid business-dashboard-analytics__workspace-grid--lists">
          <section class="business-dashboard-analytics__workspace-sheet business-dashboard-analytics__workspace-sheet--feed">
            <div class="business-dashboard-analytics__workspace-section-head">
              <div>
                <span class="business-dashboard-analytics__workspace-section-kicker">Applicant list</span>
                <h3>Pending and New Applications</h3>
              </div>
              <span class="business-dashboard-analytics__workspace-section-badge">
                {{ dashboardApplicantFeedCount }} in queue
              </span>
            </div>

            <div v-if="dashboardApplicantItems.length" class="business-dashboard-analytics__applicant-list">
              <article
                v-for="item in dashboardApplicantItems"
                :key="item.id"
                class="business-dashboard-analytics__applicant-row"
                :class="`is-${item.statusTone}`"
              >
                <div class="business-dashboard-analytics__applicant-avatar" :class="`is-${item.statusTone}`">
                  <img v-if="item.avatarUrl" :src="item.avatarUrl" :alt="`${item.name} avatar`">
                  <span v-else>{{ item.initials }}</span>
                </div>

                <div class="business-dashboard-analytics__applicant-copy">
                  <strong>{{ item.name }}</strong>
                  <span>{{ item.role }}</span>
                  <small>Applied {{ item.appliedAtLabel }}</small>
                </div>

                <div class="business-dashboard-analytics__applicant-meta">
                  <span v-if="item.isNew" class="business-dashboard-analytics__applicant-chip is-new">New</span>
                  <span
                    class="business-dashboard-analytics__applicant-chip"
                    :class="`is-${item.statusTone}`"
                  >
                    {{ item.statusLabel }}
                  </span>
                </div>
              </article>
            </div>

            <div v-else class="business-dashboard-analytics__workspace-empty">
              <span class="business-dashboard-analytics__workspace-empty-icon" aria-hidden="true">
                <i class="bi bi-inbox" />
              </span>
              <div>
                <strong>No applicants yet</strong>
                <p>New submissions will show up here automatically as soon as someone applies.</p>
              </div>
            </div>
          </section>

          <section class="business-dashboard-analytics__workspace-sheet business-dashboard-analytics__workspace-sheet--operations">
            <div class="business-dashboard-analytics__workspace-section-head">
              <div>
                <span class="business-dashboard-analytics__workspace-section-kicker">Rate list</span>
                <h3>Hiring Rates</h3>
              </div>
              <span class="business-dashboard-analytics__workspace-section-badge">
                {{ dashboardRateListCount }} tracked rates
              </span>
            </div>

            <div class="business-dashboard-analytics__system-list">
              <article
                v-for="item in dashboardBarSeries"
                :key="item.label"
                class="business-dashboard-analytics__system-row"
                :class="`is-${item.tone}`"
              >
                <div class="business-dashboard-analytics__system-head">
                  <div class="business-dashboard-analytics__system-copy">
                    <strong>{{ item.label }}</strong>
                    <span>{{ item.detail }}</span>
                  </div>
                  <span class="business-dashboard-analytics__system-value">{{ item.value }}</span>
                </div>

                <div class="business-dashboard-analytics__bar-track">
                  <div class="business-dashboard-analytics__bar-fill" :style="{ width: item.width }" />
                </div>
              </article>
            </div>
          </section>
        </div>
      </article>
    </section>
  </section>
</template>
