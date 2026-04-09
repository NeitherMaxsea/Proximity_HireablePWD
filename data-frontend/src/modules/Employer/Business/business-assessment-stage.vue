<script setup>
import { computed, reactive, ref, watch } from 'vue'
import '@/components/businesss.css'

const props = defineProps({
  activeSection: { type: String, default: 'assessment-management' },
  businessJobApplications: { type: Array, default: () => [] },
})

const text = (value = '') => String(value ?? '').trim()
const normalizeValue = (value = '') => text(value).toLowerCase()
const buildInitials = (value = '') =>
  text(value).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'AP'

const activeTab = ref(props.activeSection === 'applicant-score' ? 'score' : 'builder')
watch(() => props.activeSection, (value) => { activeTab.value = value === 'applicant-score' ? 'score' : 'builder' }, { immediate: true })

const assessmentTemplates = ref([
  {
    id: 'assessment-template-1',
    title: 'Customer Support Screening',
    description: 'Measure communication, empathy, and problem-solving for support-facing roles.',
    category: 'Customer Service',
    passingScore: 75,
    questions: [
      { id: 'question-1', question: 'How would you calm an upset customer on chat support?', type: 'Short Answer' },
      { id: 'question-2', question: 'Choose the best response for an escalation request.', type: 'Multiple Choice' },
    ],
  },
  {
    id: 'assessment-template-2',
    title: 'Retail Readiness Check',
    description: 'Covers product knowledge, customer handling, and shift responsibility.',
    category: 'Retail',
    passingScore: 70,
    questions: [{ id: 'question-3', question: 'What would you do if a customer changes their order at the register?', type: 'Short Answer' }],
  },
])

const selectedTemplateId = ref(assessmentTemplates.value[0]?.id || '')
const assessmentDraft = reactive({
  title: assessmentTemplates.value[0]?.title || '',
  description: assessmentTemplates.value[0]?.description || '',
  category: assessmentTemplates.value[0]?.category || '',
  passingScore: assessmentTemplates.value[0]?.passingScore || 70,
  questions: assessmentTemplates.value[0]?.questions?.map((item) => ({ ...item })) || [],
})

const syncAssessmentDraft = (templateId = '') => {
  const template = assessmentTemplates.value.find((item) => item.id === templateId) || assessmentTemplates.value[0]
  if (!template) return
  selectedTemplateId.value = template.id
  assessmentDraft.title = template.title
  assessmentDraft.description = template.description
  assessmentDraft.category = template.category
  assessmentDraft.passingScore = template.passingScore
  assessmentDraft.questions = template.questions.map((item) => ({ ...item }))
}

const startNewAssessmentTemplate = () => {
  selectedTemplateId.value = ''
  assessmentDraft.title = ''
  assessmentDraft.description = ''
  assessmentDraft.category = ''
  assessmentDraft.passingScore = 70
  assessmentDraft.questions = [{ id: `question-${Date.now()}`, question: '', type: 'Short Answer' }]
}

const saveAssessmentTemplate = () => {
  const payload = {
    id: selectedTemplateId.value || `assessment-template-${Date.now()}`,
    title: text(assessmentDraft.title) || 'Untitled Assessment',
    description: text(assessmentDraft.description) || 'Assessment description',
    category: text(assessmentDraft.category) || 'General',
    passingScore: Number(assessmentDraft.passingScore) || 70,
    questions: assessmentDraft.questions.map((item, index) => ({
      id: text(item.id) || `question-${index + 1}`,
      question: text(item.question) || `Question ${index + 1}`,
      type: text(item.type) || 'Short Answer',
    })),
  }
  const existingIndex = assessmentTemplates.value.findIndex((item) => item.id === payload.id)
  if (existingIndex >= 0) assessmentTemplates.value.splice(existingIndex, 1, payload)
  else assessmentTemplates.value.unshift(payload)
  syncAssessmentDraft(payload.id)
}

const deleteAssessmentTemplate = () => {
  if (!selectedTemplateId.value) return
  assessmentTemplates.value = assessmentTemplates.value.filter((item) => item.id !== selectedTemplateId.value)
  syncAssessmentDraft(assessmentTemplates.value[0]?.id || '')
}

const addAssessmentTemplateQuestion = () => {
  assessmentDraft.questions.push({ id: `question-${Date.now()}`, question: '', type: 'Short Answer' })
}

const removeAssessmentTemplateQuestion = (questionId = '') => {
  assessmentDraft.questions = assessmentDraft.questions.filter((item) => item.id !== questionId)
}

const applicantScoreRows = computed(() => {
  const source = Array.isArray(props.businessJobApplications) && props.businessJobApplications.length
    ? props.businessJobApplications
    : [
      { id: 'score-row-1', applicantName: 'Maria Santos', applicantEmail: 'maria.santos@example.com', jobTitle: 'Cashier', technicalAssessmentResult: 'Passed', technicalAssessmentStatus: 'submitted', technicalAssessmentScoreValue: 91 },
      { id: 'score-row-2', applicantName: 'John Dela Cruz', applicantEmail: 'john.delacruz@example.com', jobTitle: 'Sales Associate', technicalAssessmentResult: 'Needs Review', technicalAssessmentStatus: 'assigned', technicalAssessmentScoreValue: 68 },
    ]

  return source.map((item, index) => {
    const scoreValue = Number(item?.technicalAssessmentScoreValue ?? 0) || 0
    const scoreTone = scoreValue >= 85 ? 'top-score' : scoreValue >= 70 ? 'qualified' : scoreValue > 0 ? 'needs-review' : 'pending'
    const status = normalizeValue(item?.technicalAssessmentStatus || 'pending')
    return {
      id: text(item?.id || `score-${index + 1}`),
      applicantName: text(item?.applicantName || item?.applicant_name || item?.name) || `Applicant ${index + 1}`,
      applicantEmail: text(item?.applicantEmail || item?.applicant_email || item?.email) || 'No email',
      applicantInitials: buildInitials(item?.applicantName || item?.applicant_name || item?.name),
      applicantAvatar: text(item?.applicantAvatar || item?.avatar || item?.avatarUrl),
      jobTitle: text(item?.jobTitle || item?.job_title || item?.role) || 'Applicant',
      templateName: text(item?.assessmentTemplateTitle || assessmentTemplates.value[0]?.title || 'Assessment Template'),
      scoreValue: scoreValue ? `${scoreValue}%` : text(item?.technicalAssessmentScoreLabel) || 'Pending',
      scoreTone,
      statusLabel: status ? status.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'Pending',
      statusClass: status || 'pending',
      resultLabel: text(item?.technicalAssessmentResult) || 'Waiting for submission',
    }
  })
})

const applicantScoreFilters = reactive({ search: '', roleFilter: 'all' })
const applicantScoreRoleOptions = computed(() => {
  const seen = new Set()
  return [{ value: 'all', label: 'All Roles' }].concat(
    applicantScoreRows.value.filter((row) => {
      const key = normalizeValue(row.jobTitle)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    }).map((row) => ({ value: row.jobTitle, label: row.jobTitle })),
  )
})

const filteredApplicantScoreRows = computed(() =>
  applicantScoreRows.value.filter((row) => {
    const query = normalizeValue(applicantScoreFilters.search)
    const roleFilter = normalizeValue(applicantScoreFilters.roleFilter)
    const matchesQuery = !query || [row.applicantName, row.applicantEmail, row.jobTitle, row.templateName].some((value) => normalizeValue(value).includes(query))
    const matchesRole = roleFilter === 'all' || normalizeValue(row.jobTitle) === roleFilter
    return matchesQuery && matchesRole
  }),
)

const applicantScoreSummary = computed(() => `${filteredApplicantScoreRows.value.length} applicant${filteredApplicantScoreRows.value.length === 1 ? '' : 's'} visible`)
</script>

<template>
  <section class="business-assessment-management">
    <div class="business-assessment-management__tabs">
      <button type="button" class="business-assessment-management__tab" :class="{ 'is-active': activeTab === 'builder' }" @click="activeTab = 'builder'">Create Assessment</button>
      <button type="button" class="business-assessment-management__tab" :class="{ 'is-active': activeTab === 'score' }" @click="activeTab = 'score'">Applicant Score</button>
    </div>

    <section v-if="activeTab === 'builder'" class="business-template-builder">
      <div class="business-template-builder__editor">
        <section class="business-template-builder__hero">
          <div>
            <p class="business-template-builder__eyebrow">Assessment Builder</p>
            <h2>Create and edit screening templates</h2>
            <p>Build role-based assessments for applicants, then keep the final preview visible beside the editor so your form stays clean.</p>
          </div>
          <div class="business-template-builder__hero-actions">
            <button type="button" class="business-template-builder__publish business-template-builder__publish--secondary" @click="startNewAssessmentTemplate">New Template</button>
            <button type="button" class="business-template-builder__publish business-template-builder__publish--danger" :disabled="!selectedTemplateId" @click="deleteAssessmentTemplate">Delete</button>
            <button type="button" class="business-template-builder__publish" @click="saveAssessmentTemplate">Save Template</button>
          </div>
        </section>

        <section class="business-template-builder__card business-template-builder__card--header">
          <div class="business-assessment-builder__bar">
            <div class="business-template-builder__select-wrap business-assessment-builder__picker">
              <span>Template Library</span>
              <select :value="selectedTemplateId" @change="syncAssessmentDraft($event.target.value)">
                <option v-for="template in assessmentTemplates" :key="template.id" :value="template.id">{{ template.title }}</option>
              </select>
            </div>
            <div class="business-assessment-builder__bar-status">
              <div class="business-assessment-builder__status-card"><strong>{{ assessmentTemplates.length }}</strong><span>Templates</span></div>
            </div>
            <div class="business-assessment-builder__bar-status">
              <div class="business-assessment-builder__status-card"><strong>{{ assessmentDraft.questions.length }}</strong><span>Questions</span></div>
            </div>
          </div>
          <div class="business-template-builder__field-grid">
            <label class="business-template-builder__field"><span>Assessment Title</span><input v-model="assessmentDraft.title" type="text" placeholder="Customer Support Screening"></label>
            <label class="business-template-builder__field"><span>Category</span><input v-model="assessmentDraft.category" type="text" placeholder="Customer Service"></label>
          </div>
          <label class="business-template-builder__field"><span>Description</span><textarea v-model="assessmentDraft.description" placeholder="Describe what this assessment measures."></textarea></label>
          <label class="business-template-builder__field"><span>Passing Score</span><input v-model="assessmentDraft.passingScore" type="number" min="1" max="100"></label>
        </section>

        <section class="business-template-builder__card business-template-builder__toolbar">
          <div class="business-template-builder__toolbar-copy"><strong>Questions</strong><span>Use concise questions so applicants can answer clearly and reviewers can score faster.</span></div>
          <div class="business-template-builder__toolbar-actions">
            <button type="button" class="business-template-builder__add" @click="addAssessmentTemplateQuestion"><i class="bi bi-plus-lg" aria-hidden="true" />Add Question</button>
          </div>
        </section>

        <section class="business-template-builder__questions">
          <article v-for="(question, index) in assessmentDraft.questions" :key="question.id" class="business-template-builder__card business-template-builder__question">
            <div class="business-template-builder__question-top">
              <div class="business-template-builder__question-meta">
                <span class="business-template-builder__question-order">Question {{ index + 1 }}</span>
                <span class="business-template-builder__question-type">{{ question.type }}</span>
              </div>
              <button type="button" class="business-template-builder__remove" @click="removeAssessmentTemplateQuestion(question.id)">Remove</button>
            </div>
            <label class="business-template-builder__field"><span>Question</span><textarea v-model="question.question" placeholder="Write your assessment question here."></textarea></label>
          </article>
        </section>
      </div>

      <aside class="business-assessment-builder__workspace">
        <section class="business-template-preview__shell">
          <div class="business-template-preview__topbar"><strong>Live Preview</strong><span class="business-template-preview__badge">Assessment</span></div>
          <div class="business-template-preview__header">
            <h3>{{ assessmentDraft.title || 'Untitled Assessment' }}</h3>
            <p>{{ assessmentDraft.description || 'Your assessment description will appear here.' }}</p>
          </div>
          <div class="business-template-preview__details">
            <article class="business-template-preview__detail"><span>Category</span><strong>{{ assessmentDraft.category || 'General' }}</strong></article>
            <article class="business-template-preview__detail"><span>Passing Score</span><strong>{{ assessmentDraft.passingScore }}%</strong></article>
            <article class="business-template-preview__detail"><span>Questions</span><strong>{{ assessmentDraft.questions.length }}</strong></article>
          </div>
          <article v-for="(question, index) in assessmentDraft.questions" :key="question.id" class="business-template-preview__question">
            <div class="business-template-preview__question-head"><span>Question {{ index + 1 }}</span><small>{{ question.type }}</small></div>
            <p>{{ question.question || 'Question preview will appear here.' }}</p>
            <input type="text" placeholder="Applicant answer preview" disabled>
          </article>
          <div class="business-template-preview__footer">
            <button type="button" disabled>Preview Submit Button</button>
            <p class="business-template-preview__footer-copy">Frontend preview only. Publishing logic can be reattached later.</p>
          </div>
        </section>
      </aside>
    </section>

    <section v-else class="business-applicant-score">
      <div class="business-assign-templates__header">
        <div>
          <p class="business-assign-templates__eyebrow">Assessment Scores</p>
          <h2>Applicant score tracker</h2>
          <p>Review completed and assigned assessments in one clean score table so recruiters can spot strong matches quickly.</p>
        </div>
        <div class="business-assign-templates__summary"><span>{{ applicantScoreSummary }}</span></div>
      </div>

      <div class="business-applicant-score__toolbar">
        <label class="business-applicant-score__field"><span>Search</span><input v-model.trim="applicantScoreFilters.search" type="text" placeholder="Search applicant or template"></label>
        <label class="business-applicant-score__field">
          <span>Role</span>
          <select v-model="applicantScoreFilters.roleFilter">
            <option v-for="option in applicantScoreRoleOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
        <div class="business-applicant-score__summary">{{ applicantScoreSummary }}</div>
      </div>

      <div class="business-applicant-score__table-shell">
        <div class="business-applicant-score__table">
          <div class="business-applicant-score__head"><span>Applicant</span><span>Applied Role</span><span>Template</span><span>Score</span><span>Status</span></div>
          <div v-if="filteredApplicantScoreRows.length" class="business-applicant-score__body">
            <article v-for="row in filteredApplicantScoreRows" :key="row.id" class="business-applicant-score__row">
              <div class="business-applicant-score__account">
                <div class="business-applicant-score__avatar"><img v-if="row.applicantAvatar" :src="row.applicantAvatar" :alt="`${row.applicantName} avatar`"><span v-else>{{ row.applicantInitials }}</span></div>
                <div class="business-applicant-score__meta"><strong>{{ row.applicantName }}</strong><span>{{ row.applicantEmail }}</span></div>
              </div>
              <div class="business-applicant-score__role"><strong>{{ row.jobTitle }}</strong><span>{{ row.resultLabel }}</span></div>
              <div class="business-applicant-score__template"><strong>{{ row.templateName }}</strong><span>Frontend synced view</span></div>
              <span class="business-applicant-score__score-pill" :class="`is-${row.scoreTone}`">{{ row.scoreValue }}</span>
              <span class="business-applicant-score__status" :class="`is-${row.statusClass}`">{{ row.statusLabel }}</span>
            </article>
          </div>
          <div v-else class="business-applicant-score__empty">No applicant scores match the current filter.</div>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.business-assessment-management,
.business-template-builder,
.business-applicant-score,
.business-assessment-builder__workspace,
.business-template-preview__shell,
.business-applicant-score__table-shell {
  min-width: 0;
}

.business-assessment-management {
  display: grid;
  gap: 1rem;
}

.business-assessment-management__tabs,
.business-template-builder__hero,
.business-template-builder__card,
.business-template-preview__shell,
.business-applicant-score__toolbar,
.business-applicant-score__table-shell,
.business-assign-templates__header {
  box-shadow: 0 16px 34px rgba(24, 49, 38, 0.06);
}

.business-template-builder {
  align-items: start;
}

.business-assessment-builder__workspace {
  position: sticky;
  top: 1rem;
  align-self: start;
}

.business-template-builder__questions,
.business-applicant-score__body {
  min-width: 0;
}

.business-template-preview__question p,
.business-applicant-score__meta span,
.business-applicant-score__role span,
.business-applicant-score__template span {
  overflow-wrap: anywhere;
}

.business-applicant-score__table-shell {
  overflow-x: auto;
}

@media (max-width: 1200px) {
  .business-assessment-builder__workspace {
    position: static;
  }
}
</style>
