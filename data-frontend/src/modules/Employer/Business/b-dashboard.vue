<script setup>
import { toRefs } from 'vue'
const props = defineProps([
  'businessCategory',
  'businessName',
  'currentSection',
  'hasUnlockedBusinessWorkspace',
  'dashboardSyncOverview',
  'summaryCards',
  'businessTrendChart',
  'dashboardProgressCards',
  'dashboardBarSeries',
  'dashboardDonutLegend',
  'dashboardDonutStyle',
  'dashboardDonutTotal',
  'dashboardHighlights',
])
const {
  businessCategory,
  businessName,
  currentSection,
  hasUnlockedBusinessWorkspace,
  dashboardSyncOverview,
  summaryCards,
  businessTrendChart,
  dashboardProgressCards,
  dashboardBarSeries,
  dashboardDonutLegend,
  dashboardDonutStyle,
  dashboardDonutTotal,
  dashboardHighlights,
} = toRefs(props)
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
                    <span>{{ item.label }}</span>
                    <i :class="item.icon" aria-hidden="true" />
                  </div>
                  <strong>{{ item.value }}</strong>
                  <p>{{ item.subtitle }}</p>
                </article>
              </section>

              <div class="business-dashboard-analytics__grid">
                <article class="business-dashboard-analytics__panel business-dashboard-analytics__panel--trend business-dashboard-analytics__motion" style="--dashboard-enter-delay: 270ms">
                  <div class="business-dashboard-analytics__panel-head">
                    <div>
                      <span>Performance Trend</span>
                      <strong>Hiring activity overview</strong>
                    </div>
    
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

                <article class="business-dashboard-analytics__panel business-dashboard-analytics__panel--stack business-dashboard-analytics__motion" style="--dashboard-enter-delay: 360ms">
                  <div class="business-dashboard-analytics__panel-head">
                    <div>
                      <span>Workspace Focus</span>
                      <strong>Operations snapshot</strong>
                    </div>
                    <span class="business-dashboard-analytics__pill">{{ dashboardSyncOverview.badge }}</span>
                  </div>

                  <div class="business-dashboard-analytics__progress">
                    <article
                      v-for="item in dashboardProgressCards"
                      :key="item.label"
                      class="business-dashboard-analytics__progress-card"
                      :class="`business-dashboard-analytics__progress-card--${item.tone}`"
                    >
                      <div class="business-dashboard-analytics__progress-card-head">
                        <div class="business-dashboard-analytics__progress-card-copy">
                          <span class="business-dashboard-analytics__progress-card-kicker">{{ item.caption }}</span>
                          <strong>{{ item.label }}</strong>
                        </div>
                        <div class="business-dashboard-analytics__ring" :style="item.ringStyle">
                          <span>{{ item.value }}</span>
                        </div>
                      </div>
                      <div class="business-dashboard-analytics__progress-card-meta">
                        <span>{{ item.stat }}</span>
                        <strong>{{ item.value }}</strong>
                      </div>
                      <p>{{ item.copy }}</p>
                    </article>
                  </div>

                  <div class="business-dashboard-analytics__bars business-dashboard-analytics__bars--stages">
                    <div
                      v-for="item in dashboardBarSeries"
                      :key="item.label"
                      class="business-dashboard-analytics__bar-row"
                      :class="`is-${item.tone}`"
                    >
                      <div class="business-dashboard-analytics__bar-copy">
                        <span>{{ item.label }}</span>
                        <small>{{ item.detail }}</small>
                      </div>
                      <div class="business-dashboard-analytics__bar-track">
                        <div class="business-dashboard-analytics__bar-fill" :style="{ width: item.width }" />
                      </div>
                      <strong>{{ item.value }}</strong>
                    </div>
                  </div>
                </article>

                <article class="business-dashboard-analytics__panel business-dashboard-analytics__panel--donut business-dashboard-analytics__motion" style="--dashboard-enter-delay: 450ms">
                  <div class="business-dashboard-analytics__panel-head">
                    <div>
                      <span>Distribution</span>
                      <strong>Workspace mix</strong>
                    </div>
                    <span class="business-dashboard-analytics__pill">{{ dashboardDonutLegend.length }} live items</span>
                  </div>
                  <div class="business-dashboard-analytics__donut-wrap">
                    <div class="business-dashboard-analytics__donut" :style="dashboardDonutStyle">
                      <div class="business-dashboard-analytics__donut-center">
                        <span>Total</span>
                        <strong>{{ dashboardDonutTotal }}</strong>
                      </div>
                    </div>
                    <div class="business-dashboard-analytics__legend">
                      <div v-for="item in dashboardDonutLegend" :key="item.label" class="business-dashboard-analytics__legend-item">
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

                <article class="business-dashboard-analytics__panel business-dashboard-analytics__panel--activity business-dashboard-analytics__motion" style="--dashboard-enter-delay: 540ms">
                  <div class="business-dashboard-analytics__panel-head">
                    <div>
                      <span>Workspace Notes</span>
                      <strong>Firebase workspace highlights</strong>
                    </div>
                    <span class="business-dashboard-analytics__pill">Updated</span>
                  </div>

                  <div class="business-dashboard-analytics__activity-list">
                    <article
                      v-for="card in dashboardHighlights"
                      :key="card.title"
                      class="business-dashboard-analytics__activity-item"
                      :class="`is-${card.tone}`"
                    >
                      <div class="business-dashboard-analytics__activity-icon" :class="`is-${card.tone}`" aria-hidden="true">
                        <i :class="card.icon" />
                      </div>
                      <div class="business-dashboard-analytics__activity-copy">
                        <div class="business-dashboard-analytics__activity-top">
                          <strong>{{ card.title }}</strong>
                          <span class="business-dashboard-analytics__activity-badge" :class="`is-${card.tone}`">{{ card.badge }}</span>
                        </div>
                        <p>{{ card.copy }}</p>
                      </div>
                    </article>
                  </div>
                </article>
              </div>
            </section>
</template>

