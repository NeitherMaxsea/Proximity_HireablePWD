<script setup>
import { toRefs } from 'vue'
const props = defineProps([
  'activeSection',
  'assessmentUi',
  'canEditBusinessModule',
  'editingAssessmentTemplateId',
  'handleAssessmentTemplateSelection',
  'assessmentTemplateLibrary',
  'startNewAssessmentTemplate',
  'deleteAssessmentTemplate',
  'saveAssessmentTemplate',
  'assessmentTemplateDraft',
  'trainingQuestionTypeOptions',
  'addAssessmentTemplateQuestion',
  'resolveTrainingQuestionTypeMeta',
  'removeAssessmentTemplateQuestion',
  'addAssessmentTemplateOption',
  'setAssessmentTemplateCorrectOption',
  'removeAssessmentTemplateOption',
  'normalizeAssessmentPassingScorePercent',
  'approvedApplicantTemplateAssignments',
  'assignedApplicantTemplateRows',
  'assignableAssessmentTemplates',
  'handleAssessmentAssignmentTemplateSelection',
  'canRemoveAssignedAssessment',
  'requestAssignAssessmentTemplateToApplicant',
  'removeAssignedAssessmentFromApplicant',
  'getAssignableTemplateLabel',
  'applicantScoreRows',
  'applicantScoreFilters',
  'applicantScoreRoleOptions',
  'openAssessmentAssignmentsSection',
  'applicantScoreSummary',
  'filteredApplicantScoreRows',
])
const {
  activeSection,
  assessmentUi,
  canEditBusinessModule,
  editingAssessmentTemplateId,
  handleAssessmentTemplateSelection,
  assessmentTemplateLibrary,
  startNewAssessmentTemplate,
  deleteAssessmentTemplate,
  saveAssessmentTemplate,
  assessmentTemplateDraft,
  trainingQuestionTypeOptions,
  addAssessmentTemplateQuestion,
  resolveTrainingQuestionTypeMeta,
  removeAssessmentTemplateQuestion,
  addAssessmentTemplateOption,
  setAssessmentTemplateCorrectOption,
  removeAssessmentTemplateOption,
  normalizeAssessmentPassingScorePercent,
  approvedApplicantTemplateAssignments,
  assignedApplicantTemplateRows,
  assignableAssessmentTemplates,
  handleAssessmentAssignmentTemplateSelection,
  canRemoveAssignedAssessment,
  requestAssignAssessmentTemplateToApplicant,
  removeAssignedAssessmentFromApplicant,
  getAssignableTemplateLabel,
  applicantScoreRows,
  applicantScoreFilters,
  applicantScoreRoleOptions,
  openAssessmentAssignmentsSection,
  applicantScoreSummary,
  filteredApplicantScoreRows,
} = toRefs(props)
</script>

<template>
<section v-if="activeSection === 'assessment-management'" class="business-assessment-management">
              <div class="business-assessment-management__tabs" role="tablist" aria-label="Assessment management views">
                <button
                  type="button"
                  class="business-assessment-management__tab"
                  :class="{ 'is-active': assessmentUi.managementTab === 'builder' }"
                  @click="assessmentUi.managementTab = 'builder'"
                >
                  Create Template
                </button>
                <button
                  type="button"
                  class="business-assessment-management__tab"
                  :class="{ 'is-active': assessmentUi.managementTab === 'assignments' }"
                  @click="assessmentUi.managementTab = 'assignments'"
                >
                  Assign Assessment
                </button>
              </div>

              <div v-if="assessmentUi.managementTab === 'builder'" class="business-template-builder">
                <div class="business-template-builder__editor">
                <fieldset class="business-template-builder__fieldset" :disabled="!canEditBusinessModule('assessment-management')">
                  <div class="business-assessment-builder__bar">
                    <label class="business-template-builder__select-wrap business-assessment-builder__picker">
                      <span>{{ editingAssessmentTemplateId ? 'Editing Template' : 'Open Template' }}</span>
                      <select :value="editingAssessmentTemplateId" @change="handleAssessmentTemplateSelection($event.target.value)">
                        <option value="">New template</option>
                        <option v-for="template in assessmentTemplateLibrary" :key="template.id" :value="template.id">
                          {{ template.title || 'Untitled template' }} | {{ template.questions.length }} questions
                        </option>
                      </select>
                    </label>
                    <div class="business-assessment-builder__bar-status">
                      <div class="business-assessment-builder__status-card">
                        <strong>{{ assessmentTemplateLibrary.length }}</strong>
                        <span>Saved</span>
                      </div>
                    </div>
                    <div class="business-template-builder__hero-actions">
                      <button
                        type="button"
                        class="business-template-builder__publish business-template-builder__publish--secondary"
                        @click="startNewAssessmentTemplate"
                      >
                        New
                      </button>
                      <button
                        v-if="editingAssessmentTemplateId"
                        type="button"
                        class="business-template-builder__publish business-template-builder__publish--danger"
                        @click="deleteAssessmentTemplate"
                      >
                        Delete
                      </button>
                      <button type="button" class="business-template-builder__publish" @click="saveAssessmentTemplate">
                        {{ editingAssessmentTemplateId ? 'Update' : 'Save' }}
                      </button>
                    </div>
                  </div>
                  <p v-if="editingAssessmentTemplateId" class="business-assessment-builder__bar-note">
                    Deleting removes the selected saved template from the library only.
                  </p>

                  <article class="business-template-builder__card business-assessment-builder__workspace">
                    <div class="business-template-builder__field-grid">
                      <label class="business-template-builder__field">
                        <span>Template Title</span>
                        <input v-model="assessmentTemplateDraft.title" type="text" placeholder="Frontend developer technical screen" />
                      </label>

                      <label class="business-template-builder__field">
                        <span>Passing Score (%)</span>
                        <input
                          v-model.number="assessmentTemplateDraft.passingScorePercent"
                          type="number"
                          min="1"
                          max="100"
                          placeholder="70"
                        />
                      </label>
                    </div>

                    <label class="business-template-builder__field">
                      <span>Description</span>
                      <textarea
                        v-model="assessmentTemplateDraft.description"
                        rows="3"
                        placeholder="Explain what this technical assessment measures and when it should be sent."
                      />
                    </label>

                    <label class="business-template-builder__field">
                      <span>Instructions for Candidates</span>
                      <textarea
                        v-model="assessmentTemplateDraft.instructions"
                        rows="4"
                        placeholder="Add directions, scoring reminders, allowed tools, or submission rules for the candidate."
                      />
                    </label>

                    <div class="business-assessment-builder__toolbar">
                      <label class="business-template-builder__select-wrap">
                        <span>Question type</span>
                        <select v-model="assessmentUi.questionType">
                          <option v-for="type in trainingQuestionTypeOptions" :key="type.value" :value="type.value">
                            {{ type.label }}
                          </option>
                        </select>
                      </label>
                      <button type="button" class="business-template-builder__add" @click="addAssessmentTemplateQuestion">
                        <i class="bi bi-plus-lg" aria-hidden="true" />
                        Add question
                      </button>
                    </div>

                    <TransitionGroup name="business-template-question" tag="div" class="business-template-builder__questions">
                      <article
                        v-for="(question, index) in assessmentTemplateDraft.questions"
                        :key="question.id"
                        class="business-template-builder__card business-template-builder__question"
                      >
                        <div class="business-template-builder__question-top">
                          <div class="business-template-builder__question-meta">
                            <span class="business-template-builder__question-order">Question {{ index + 1 }}</span>
                            <span class="business-template-builder__question-type">
                              <i :class="resolveTrainingQuestionTypeMeta(question.type).icon" aria-hidden="true" />
                              {{ resolveTrainingQuestionTypeMeta(question.type).label }}
                            </span>
                          </div>
                          <button type="button" class="business-template-builder__remove" @click="removeAssessmentTemplateQuestion(question.id)">
                            Remove
                          </button>
                        </div>

                        <label class="business-template-builder__field">
                          <span>Question</span>
                          <input v-model="question.label" type="text" placeholder="Enter question title" />
                        </label>

                        <label class="business-template-builder__field">
                          <span>Helper text</span>
                          <input v-model="question.helpText" type="text" placeholder="Optional helper copy" />
                        </label>

                        <div
                          v-if="question.type === 'multiple-choice' || question.type === 'checkboxes'"
                          class="business-template-builder__options"
                        >
                          <div class="business-template-builder__option-actions">
                            <span>Answer options</span>
                            <button type="button" class="business-template-builder__option-add" @click="addAssessmentTemplateOption(question.id)">
                              Add option
                            </button>
                          </div>
                          <div
                            v-for="(option, optionIndex) in question.options"
                            :key="`${question.id}-option-${optionIndex}`"
                            class="business-template-builder__option-row"
                          >
                            <label
                              v-if="question.type === 'multiple-choice'"
                              class="business-template-builder__answer-marker"
                              :aria-label="`Mark option ${optionIndex + 1} as the correct answer`"
                            >
                              <input
                                type="radio"
                                :name="`${question.id}-correct-answer`"
                                :checked="question.correctOptionIndex === optionIndex"
                                @change="setAssessmentTemplateCorrectOption(question.id, optionIndex)"
                              />
                            </label>
                            <i v-else class="bi bi-square" aria-hidden="true" />
                            <input v-model="question.options[optionIndex]" type="text" :placeholder="`Option ${optionIndex + 1}`" />
                            <button
                              type="button"
                              class="business-template-builder__option-remove"
                              @click="removeAssessmentTemplateOption(question.id, optionIndex)"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div v-else-if="question.type === 'rating'" class="business-template-builder__scale">
                          <span>Scale preview</span>
                          <div class="business-template-builder__scale-points">
                            <span v-for="point in question.options" :key="`${question.id}-${point}`">{{ point }}</span>
                          </div>
                        </div>

                        <label class="business-template-builder__toggle">
                          <input v-model="question.required" type="checkbox" />
                          <span>Required question</span>
                        </label>
                      </article>
                    </TransitionGroup>
                  </article>
                </fieldset>
              </div>

              <aside class="business-template-preview">
                <div class="business-template-preview__shell">
                  <div class="business-template-preview__topbar">
                    <span class="business-template-preview__badge">Live Preview</span>
                    <strong>Assessment Preview</strong>
                  </div>
                  <article class="business-template-preview__form">
                    <div class="business-template-preview__header">
                      <h3 :class="{ 'business-template-preview__placeholder': !assessmentTemplateDraft.title }">
                        {{ assessmentTemplateDraft.title || 'Untitled assessment template' }}
                      </h3>
                      <p :class="{ 'business-template-preview__placeholder': !assessmentTemplateDraft.description }">
                        {{ assessmentTemplateDraft.description || 'Add a short description so candidates know what this technical assessment covers.' }}
                      </p>
                      <p
                        class="business-assessment-builder__preview-note"
                        :class="{ 'business-template-preview__placeholder': !assessmentTemplateDraft.instructions }"
                      >
                        {{ assessmentTemplateDraft.instructions || 'Add assessment instructions so candidates know how to answer or what tools they can use.' }}
                      </p>
                      <p class="business-assessment-builder__preview-note">
                        Pass mark: {{ normalizeAssessmentPassingScorePercent(assessmentTemplateDraft.passingScorePercent, 70) }}%
                      </p>
                    </div>

                    <article
                      v-for="(question, index) in assessmentTemplateDraft.questions"
                      :key="`${question.id}-preview`"
                      class="business-template-preview__question"
                    >
                      <div class="business-template-preview__question-head">
                        <span>Question {{ index + 1 }}</span>
                        <small v-if="question.required">Required</small>
                      </div>
                      <strong :class="{ 'business-template-preview__placeholder': !question.label }">
                        {{ question.label || 'Untitled question' }}
                      </strong>
                      <p
                        v-if="question.helpText || !['multiple-choice', 'checkboxes', 'rating'].includes(question.type)"
                        :class="{ 'business-template-preview__placeholder': !question.helpText }"
                      >
                        {{ question.helpText || 'Optional helper text appears here.' }}
                      </p>

                      <input
                        v-if="question.type === 'short-text'"
                        type="text"
                        placeholder="Short answer text"
                        readonly
                      />
                      <textarea
                        v-else-if="question.type === 'paragraph'"
                        rows="4"
                        placeholder="Long answer text"
                        readonly
                      />
                      <div
                        v-else-if="question.type === 'multiple-choice' || question.type === 'checkboxes'"
                        class="business-template-preview__choices"
                      >
                        <label
                          v-for="(option, optionIndex) in question.options"
                          :key="`${question.id}-choice-${optionIndex}`"
                          class="business-template-preview__choice"
                        >
                          <input
                            :type="question.type === 'multiple-choice' ? 'radio' : 'checkbox'"
                            :name="question.id"
                            :checked="question.type === 'multiple-choice' && question.correctOptionIndex === optionIndex"
                            disabled
                          />
                          <span :class="{ 'business-template-preview__placeholder': !option }">
                            {{ option || `Option ${optionIndex + 1}` }}
                          </span>
                        </label>
                      </div>
                      <div v-else-if="question.type === 'rating'" class="business-template-preview__rating">
                        <button v-for="point in question.options" :key="`${question.id}-rating-${point}`" type="button" disabled>
                          {{ point }}
                        </button>
                      </div>
                    </article>

                    <div class="business-template-preview__footer">
                      <button type="button" disabled>Start Assessment</button>
                    </div>
                  </article>
                </div>
              </aside>
              </div>

              <div v-else class="business-assign-templates">
                <div class="business-assign-templates__header">
                  <div>
                    <p class="business-assign-templates__eyebrow">Assessment Assignment</p>
                    <h2>Assign assessment templates to approved applicants</h2>
                    <p>Use the approved applicants table below to choose which assessment template each applicant should receive.</p>
                  </div>
                  <div class="business-assign-templates__summary">
                    <span>{{ approvedApplicantTemplateAssignments.length }} approved applicants</span>
                    <span>{{ assignedApplicantTemplateRows.length }} templates assigned</span>
                  </div>
                </div>

                <div class="business-assign-templates__tabs">
                  <button
                    type="button"
                    class="business-assign-templates__tab"
                    :class="{ 'is-active': assessmentUi.assignmentTab === 'approved-applicants' }"
                    @click="assessmentUi.assignmentTab = 'approved-applicants'"
                  >
                    Approved Applicants
                  </button>
                  <button
                    type="button"
                    class="business-assign-templates__tab"
                    :class="{ 'is-active': assessmentUi.assignmentTab === 'assigned-templates' }"
                    @click="assessmentUi.assignmentTab = 'assigned-templates'"
                  >
                    Assigned Templates
                  </button>
                </div>

                <article v-if="assessmentUi.assignmentTab === 'approved-applicants'" class="business-assign-templates__panel">
                  <div class="business-assign-templates__table-wrap">
                    <table class="business-assign-templates__table">
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Applied Role</th>
                          <th>Approved</th>
                          <th>Score</th>
                          <th>Template</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="applicant in approvedApplicantTemplateAssignments" :key="applicant.id">
                          <td>
                            <div class="business-assign-templates__applicant">
                              <strong>{{ applicant.name }}</strong>
                              <span>{{ applicant.email }}</span>
                            </div>
                          </td>
                          <td>{{ applicant.role }}</td>
                          <td>{{ applicant.approvalDate }}</td>
                          <td>{{ applicant.score }}</td>
                          <td>
                            <select
                              v-model="applicant.selectedTemplateId"
                              class="business-assign-templates__select"
                              :disabled="!canEditBusinessModule('assessment-management')"
                              @change="handleAssessmentAssignmentTemplateSelection(applicant.id, applicant.selectedTemplateId)"
                            >
                              <option value="">Select template</option>
                              <option v-for="template in assignableAssessmentTemplates" :key="template.id" :value="template.id">
                                {{ template.title }}
                              </option>
                            </select>
                          </td>
                          <td>
                            <span
                              class="business-assign-templates__status"
                              :class="{ 'is-assigned': applicant.assignmentStatus === 'Assigned' }"
                            >
                              {{ applicant.assignmentStatus }}
                            </span>
                          </td>
                          <td>
                            <div class="business-assign-templates__actions">
                              <button
                                type="button"
                                class="business-assign-templates__action business-assign-templates__action--icon"
                                :title="applicant.assignmentStatus === 'Assigned' ? 'Update assessment assignment' : 'Assign assessment template'"
                                :aria-label="applicant.assignmentStatus === 'Assigned' ? 'Update assessment assignment' : 'Assign assessment template'"
                                :disabled="!canEditBusinessModule('assessment-management')"
                                @click="requestAssignAssessmentTemplateToApplicant(applicant.id)"
                              >
                                <i :class="applicant.assignmentStatus === 'Assigned' ? 'bi bi-arrow-repeat' : 'bi bi-send'" aria-hidden="true" />
                              </button>
                              <button
                                v-if="canRemoveAssignedAssessment(applicant)"
                                type="button"
                                class="business-assign-templates__action business-assign-templates__action--danger business-assign-templates__action--icon"
                                title="Remove assessment assignment"
                                aria-label="Remove assessment assignment"
                                :disabled="!canEditBusinessModule('assessment-management')"
                                @click="removeAssignedAssessmentFromApplicant(applicant.id)"
                              >
                                <i class="bi bi-trash3" aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </article>

                <article v-else class="business-assign-templates__panel">
                  <div v-if="assignedApplicantTemplateRows.length" class="business-assign-templates__table-wrap">
                    <table class="business-assign-templates__table">
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Applied Role</th>
                          <th>Assigned Template</th>
                          <th>Assigned Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="applicant in assignedApplicantTemplateRows" :key="`${applicant.id}-assigned`">
                          <td>
                            <div class="business-assign-templates__applicant">
                              <strong>{{ applicant.name }}</strong>
                              <span>{{ applicant.email }}</span>
                            </div>
                          </td>
                          <td>{{ applicant.role }}</td>
                          <td>{{ getAssignableTemplateLabel(applicant.selectedTemplateId, applicant.templateTitle) }}</td>
                          <td>{{ applicant.assignedAt || 'Not set' }}</td>
                          <td>
                            <span class="business-assign-templates__status is-assigned">{{ applicant.assignmentStatus }}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              class="business-assign-templates__action business-assign-templates__action--danger business-assign-templates__action--icon"
                              title="Remove assessment assignment"
                              aria-label="Remove assessment assignment"
                              :disabled="!canEditBusinessModule('assessment-management')"
                              @click="removeAssignedAssessmentFromApplicant(applicant.id)"
                            >
                              <i class="bi bi-trash3" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-else class="business-assign-templates__empty">
                    <strong>No templates assigned yet</strong>
                    <p>Pick a template from the approved applicants tab and assign it to see the queue here.</p>
                  </div>
                </article>
              </div>
            </section>

<section
              v-else-if="activeSection === 'applicant-score'"
              class="business-applicant-score"
            >
              <article class="business-user-management__panel business-user-management__panel--form">
                <div class="business-user-management__panel-head">
                  <div>
                    <p class="business-user-management__panel-label">Applicant Score</p>
                    <h3>Assessment scores and shortlisted applicant results</h3>
                  </div>
                  <span class="business-user-management__panel-chip">{{ applicantScoreRows.length }} realtime rows</span>
                </div>

                <div class="business-applicant-score__toolbar">
                  <label class="business-applicant-score__field business-applicant-score__field--search">
                    <span>Search</span>
                    <input
                      v-model.trim="applicantScoreFilters.search"
                      type="text"
                      placeholder="Search by applicant, role, template, or score..."
                    />
                  </label>

                  <label class="business-applicant-score__field">
                    <span>Role</span>
                    <select v-model="applicantScoreFilters.roleFilter">
                      <option v-for="option in applicantScoreRoleOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </label>

                  <label class="business-applicant-score__field">
                    <span>Status</span>
                    <select v-model="applicantScoreFilters.statusFilter">
                      <option value="all">All</option>
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="submitted">Submitted</option>
                      <option value="assigned">Assigned</option>
                      <option value="pending">Pending</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    class="business-user-management__action-btn business-user-management__action-btn--primary"
                    @click="openAssessmentAssignmentsSection"
                  >
                    <i class="bi bi-ui-checks-grid" aria-hidden="true" />
                    Assign Assessment
                  </button>

                  <div class="business-applicant-score__summary">
                    {{ applicantScoreSummary }}
                  </div>
                </div>

                <div class="business-applicant-score__table-shell">
                  <div class="business-applicant-score__table">
                    <div class="business-applicant-score__head">
                      <span>#</span>
                      <span>Applicant</span>
                      <span>Applied Role</span>
                      <span>Score</span>
                      <span>Template</span>
                      <span>Status</span>
                      <span>Approved</span>
                    </div>

                    <div v-if="filteredApplicantScoreRows.length" class="business-applicant-score__body">
                      <article
                        v-for="row in filteredApplicantScoreRows"
                        :key="row.id"
                        class="business-applicant-score__row"
                      >
                        <div>{{ row.rowNumber }}</div>

                        <div class="business-applicant-score__account">
                          <div class="business-applicant-score__avatar">
                            {{ row.initials }}
                          </div>

                          <div class="business-applicant-score__meta">
                            <strong>{{ row.name }}</strong>
                            <span>{{ row.email }}</span>
                          </div>
                        </div>

                        <div class="business-applicant-score__role">
                          <strong>{{ row.role }}</strong>
                          <span>{{ row.technicalLabel }}</span>
                        </div>

                        <div>
                          <span class="business-applicant-score__score-pill" :class="`is-${row.scoreTone}`">{{ row.scoreLabel }}</span>
                        </div>

                        <div class="business-applicant-score__template">
                          <strong>{{ row.templateTitle }}</strong>
                          <span>{{ row.templateDetail }}</span>
                        </div>

                        <div>
                          <span class="business-applicant-score__status" :class="`is-${row.status.replace(/\s+/g, '-')}`">{{ row.statusLabel }}</span>
                        </div>

                        <div>{{ row.approvalDate || 'Not set' }}</div>
                      </article>
                    </div>
                  </div>
                </div>

                <div v-if="!filteredApplicantScoreRows.length" class="business-applicant-score__empty">
                  No applicant scores match the current filter.
                </div>
              </article>
            </section>
</template>
