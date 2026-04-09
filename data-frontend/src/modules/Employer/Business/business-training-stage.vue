<script setup>
import { computed, reactive, ref } from 'vue'
import '@/components/businesss.css'

const props = defineProps({
  employeeDirectory: { type: Array, default: () => [] },
})

const text = (value = '') => String(value ?? '').trim()
const trainingTemplatesTab = ref('builder')
const trainingAssignmentTab = ref('assign')
const editingTrainingTemplateId = ref('training-template-1')

const trainingTemplateLibrary = ref([
  { id: 'training-template-1', title: 'Store Operations Onboarding', description: 'Core onboarding flow for newly hired retail staff.', categories: [{ id: 'category-1', title: 'Customer Service', skills: ['Greeting customers', 'Handling basic concerns'] }, { id: 'category-2', title: 'POS Operations', skills: ['Cash handling', 'Receipt workflow'] }] },
  { id: 'training-template-2', title: 'Branch Admin Readiness', description: 'Documentation, reporting, and daily branch coordination.', categories: [{ id: 'category-3', title: 'Reporting', skills: ['Daily sales summary', 'Incident logs'] }] },
])

const trainingTemplateDraft = reactive({
  title: 'Store Operations Onboarding',
  description: 'Core onboarding flow for newly hired retail staff.',
  categories: [{ id: 'category-1', title: 'Customer Service', skills: ['Greeting customers', 'Handling basic concerns'] }, { id: 'category-2', title: 'POS Operations', skills: ['Cash handling', 'Receipt workflow'] }],
})

const syncTrainingDraft = (templateId = '') => {
  const template = trainingTemplateLibrary.value.find((item) => item.id === templateId) || trainingTemplateLibrary.value[0]
  if (!template) return
  editingTrainingTemplateId.value = template.id
  trainingTemplateDraft.title = template.title
  trainingTemplateDraft.description = template.description
  trainingTemplateDraft.categories = template.categories.map((item) => ({ ...item, skills: [...item.skills] }))
}

const startNewTrainingTemplate = () => {
  editingTrainingTemplateId.value = ''
  trainingTemplateDraft.title = ''
  trainingTemplateDraft.description = ''
  trainingTemplateDraft.categories = [{ id: `category-${Date.now()}`, title: '', skills: [''] }]
}

const saveTrainingTemplate = () => {
  const payload = {
    id: editingTrainingTemplateId.value || `training-template-${Date.now()}`,
    title: text(trainingTemplateDraft.title) || 'Untitled Training Template',
    description: text(trainingTemplateDraft.description) || 'Training template description',
    categories: trainingTemplateDraft.categories.map((item, index) => ({
      id: text(item.id) || `category-${index + 1}`,
      title: text(item.title) || `Category ${index + 1}`,
      skills: Array.isArray(item.skills) ? item.skills.map((skill) => text(skill)).filter(Boolean) : [],
    })),
  }
  const existingIndex = trainingTemplateLibrary.value.findIndex((item) => item.id === payload.id)
  if (existingIndex >= 0) trainingTemplateLibrary.value.splice(existingIndex, 1, payload)
  else trainingTemplateLibrary.value.unshift(payload)
  syncTrainingDraft(payload.id)
}

const addTrainingTemplateCategory = () => {
  trainingTemplateDraft.categories.push({ id: `category-${Date.now()}`, title: '', skills: [''] })
}
const removeTrainingTemplateCategory = (categoryId = '') => {
  trainingTemplateDraft.categories = trainingTemplateDraft.categories.filter((item) => item.id !== categoryId)
}
const addTrainingTemplateSkill = (categoryId = '') => {
  const category = trainingTemplateDraft.categories.find((item) => item.id === categoryId)
  if (category) category.skills.push('')
}
const removeTrainingTemplateSkill = (categoryId = '', skillIndex = 0) => {
  const category = trainingTemplateDraft.categories.find((item) => item.id === categoryId)
  if (category) category.skills.splice(skillIndex, 1)
}

const memberRows = computed(() => {
  const source = Array.isArray(props.employeeDirectory) && props.employeeDirectory.length
    ? props.employeeDirectory
    : [{ id: 'member-1', name: 'Kevin Ramos', workEmail: 'kevin.ramos@example.com', position: 'Cashier' }, { id: 'member-2', name: 'Lara Cruz', workEmail: 'lara.cruz@example.com', position: 'Sales Associate' }]
  return source.map((item, index) => ({
    id: text(item?.id || `member-${index + 1}`),
    name: text(item?.name || item?.full_name) || `Member ${index + 1}`,
    email: text(item?.workEmail || item?.email) || 'No email',
    position: text(item?.position || item?.role || 'Team Member'),
  }))
})

const assignableTrainingTemplates = computed(() => trainingTemplateLibrary.value.map((item) => ({ value: item.id, label: item.title })))
const selectedTrackingAssignmentId = ref(memberRows.value[0]?.id || '')
const trackingRows = computed(() => memberRows.value.map((member, index) => ({
  ...member,
  templateTitle: trainingTemplateLibrary.value[index % trainingTemplateLibrary.value.length]?.title || 'Training Template',
  progressLabel: index === 0 ? '75%' : '40%',
  progressTone: index === 0 ? 'completed' : 'in-progress',
})))
const selectedTrackingAssignment = computed(() => trackingRows.value.find((item) => item.id === selectedTrackingAssignmentId.value) || trackingRows.value[0] || null)
</script>

<template>
  <section class="business-assessment-management">
    <div class="business-assessment-management__tabs">
      <button type="button" class="business-assessment-management__tab" :class="{ 'is-active': trainingTemplatesTab === 'builder' }" @click="trainingTemplatesTab = 'builder'">Training Templates</button>
      <button type="button" class="business-assessment-management__tab" :class="{ 'is-active': trainingTemplatesTab === 'tracking' }" @click="trainingTemplatesTab = 'tracking'">Training Tracking</button>
    </div>

    <section v-if="trainingTemplatesTab === 'builder'" class="business-template-builder">
      <div class="business-template-builder__editor">
        <section class="business-template-builder__hero">
          <div>
            <p class="business-template-builder__eyebrow">Training Builder</p>
            <h2>Create onboarding and upskilling templates</h2>
            <p>Organize training into categories and skills so team tracking stays easy to scan in one workspace.</p>
          </div>
          <div class="business-template-builder__hero-actions">
            <button type="button" class="business-template-builder__publish business-template-builder__publish--secondary" @click="startNewTrainingTemplate">New Template</button>
            <button type="button" class="business-template-builder__publish" @click="saveTrainingTemplate">Save Template</button>
          </div>
        </section>

        <section class="business-template-builder__card business-template-builder__card--header">
          <div class="business-template-builder__field-grid">
            <label class="business-template-builder__field"><span>Template Title</span><input v-model="trainingTemplateDraft.title" type="text"></label>
            <label class="business-template-builder__field">
              <span>Template Library</span>
              <select :value="editingTrainingTemplateId" @change="syncTrainingDraft($event.target.value)">
                <option v-for="template in trainingTemplateLibrary" :key="template.id" :value="template.id">{{ template.title }}</option>
              </select>
            </label>
          </div>
          <label class="business-template-builder__field"><span>Description</span><textarea v-model="trainingTemplateDraft.description"></textarea></label>
        </section>

        <section class="business-template-builder__toolbar business-template-builder__card">
          <div class="business-template-builder__toolbar-copy"><strong>Categories and Skills</strong><span>Create grouped skills so managers can track training progress more cleanly.</span></div>
          <div class="business-template-builder__toolbar-actions">
            <button type="button" class="business-template-builder__add" @click="addTrainingTemplateCategory"><i class="bi bi-plus-lg" aria-hidden="true" />Add Category</button>
          </div>
        </section>

        <section class="business-template-builder__questions">
          <article v-for="(category, categoryIndex) in trainingTemplateDraft.categories" :key="category.id" class="business-template-builder__card">
            <div class="business-template-builder__question-top">
              <div class="business-template-builder__question-meta"><span class="business-template-builder__question-order">Category {{ categoryIndex + 1 }}</span></div>
              <button type="button" class="business-template-builder__remove" @click="removeTrainingTemplateCategory(category.id)">Remove</button>
            </div>
            <label class="business-template-builder__field"><span>Category Name</span><input v-model="category.title" type="text" placeholder="Customer Service"></label>
            <div class="business-template-builder__skill-list">
              <div v-for="(skill, skillIndex) in category.skills" :key="`${category.id}-${skillIndex}`" class="business-template-builder__skill-item">
                <div class="business-template-builder__option-actions"><span>Skill {{ skillIndex + 1 }}</span><button type="button" class="business-template-builder__option-remove" @click="removeTrainingTemplateSkill(category.id, skillIndex)">Remove Skill</button></div>
                <input v-model="category.skills[skillIndex]" class="business-template-builder__skill-detail-input" type="text" placeholder="Greeting customers warmly">
              </div>
            </div>
            <button type="button" class="business-template-builder__option-add" @click="addTrainingTemplateSkill(category.id)">Add Skill</button>
          </article>
        </section>
      </div>

      <aside class="business-assessment-builder__workspace">
        <section class="business-template-preview__shell">
          <div class="business-template-preview__topbar"><strong>Training Preview</strong><span class="business-template-preview__badge">Training</span></div>
          <div class="business-template-preview__header"><h3>{{ trainingTemplateDraft.title || 'Untitled Training Template' }}</h3><p>{{ trainingTemplateDraft.description || 'Training description preview will appear here.' }}</p></div>
          <div class="business-template-preview__training-skills">
            <article v-for="category in trainingTemplateDraft.categories" :key="category.id" class="business-template-preview__question">
              <div class="business-template-preview__question-head"><span>{{ category.title || 'Untitled Category' }}</span><small>{{ category.skills.length }} skills</small></div>
              <div class="business-template-preview__training-skills">
                <div v-for="(skill, skillIndex) in category.skills" :key="`${category.id}-preview-${skillIndex}`" class="business-template-preview__training-skill">
                  <div class="business-template-preview__training-skill-copy"><strong>{{ skill || `Skill ${skillIndex + 1}` }}</strong><p>Training skill preview for frontend-only workspace mode.</p></div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </aside>
    </section>

    <section v-else class="business-assign-templates">
      <div class="business-assign-templates__header">
        <div>
          <p class="business-assign-templates__eyebrow">Training Management</p>
          <h2>Assign and track training progress</h2>
          <p>View member training assignments and inspect progress details without leaving the business workspace shell.</p>
        </div>
      </div>

      <div class="business-assign-templates__tabs">
        <button type="button" class="business-assign-templates__tab" :class="{ 'is-active': trainingAssignmentTab === 'assign' }" @click="trainingAssignmentTab = 'assign'">Assign Templates</button>
        <button type="button" class="business-assign-templates__tab" :class="{ 'is-active': trainingAssignmentTab === 'tracking' }" @click="trainingAssignmentTab = 'tracking'">Progress Tracking</button>
      </div>

      <div v-if="trainingAssignmentTab === 'assign'" class="business-assign-templates__table-shell">
        <table class="business-assign-templates__table">
          <thead><tr><th>Member</th><th>Position</th><th>Template</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="member in memberRows" :key="member.id">
              <td><div class="business-assign-templates__applicant"><strong>{{ member.name }}</strong><span>{{ member.email }}</span></div></td>
              <td>{{ member.position }}</td>
              <td><select class="business-assign-templates__select"><option value="">Select template</option><option v-for="template in assignableTrainingTemplates" :key="template.value" :value="template.value">{{ template.label }}</option></select></td>
              <td><div class="business-assign-templates__actions"><button type="button" class="business-assign-templates__action">Assign</button></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="business-assign-templates__tracking">
        <div class="business-assign-templates__tracking-table-view">
          <div class="business-assign-templates__tracking-view-head"><div><h3>Training progress</h3><p>Select a member below to inspect the frontend tracking detail view.</p></div></div>
          <div class="business-assign-templates__table-shell">
            <table class="business-assign-templates__table">
              <thead><tr><th>Member</th><th>Template</th><th>Progress</th><th>Actions</th></tr></thead>
              <tbody>
                <tr v-for="row in trackingRows" :key="row.id">
                  <td><div class="business-assign-templates__applicant"><strong>{{ row.name }}</strong><span>{{ row.position }}</span></div></td>
                  <td>{{ row.templateTitle }}</td>
                  <td class="business-assign-templates__tracking-progress-cell"><strong>{{ row.progressLabel }}</strong><span>{{ row.progressTone }}</span></td>
                  <td><button type="button" class="business-assign-templates__action" @click="selectedTrackingAssignmentId = row.id">View Detail</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="selectedTrackingAssignment" class="business-assign-templates__tracking-detail-view">
          <div class="business-assign-templates__tracking-detail">
            <div class="business-assign-templates__tracking-detail-top"><div><h3>{{ selectedTrackingAssignment.name }}</h3><p>{{ selectedTrackingAssignment.templateTitle }}</p></div><span>{{ selectedTrackingAssignment.progressLabel }} complete</span></div>
            <div class="business-assign-templates__tracking-summary">
              <article class="business-assign-templates__tracking-stat"><span>Current Progress</span><strong>{{ selectedTrackingAssignment.progressLabel }}</strong><small>Frontend preview synced to the training management route.</small></article>
              <article class="business-assign-templates__tracking-stat"><span>Status</span><strong>{{ selectedTrackingAssignment.progressTone }}</strong><small>Backend actions can be restored later without changing this layout.</small></article>
            </div>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.business-assessment-management,
.business-template-builder,
.business-assign-templates,
.business-assessment-builder__workspace,
.business-template-preview__shell,
.business-assign-templates__table-shell,
.business-assign-templates__tracking {
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
.business-assign-templates__header,
.business-assign-templates__tabs,
.business-assign-templates__table-shell,
.business-assign-templates__tracking-detail {
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

.business-template-preview__training-skill-copy p,
.business-assign-templates__applicant span,
.business-assign-templates__tracking-progress-cell span {
  overflow-wrap: anywhere;
}

.business-assign-templates__table-shell {
  overflow-x: auto;
}

@media (max-width: 1200px) {
  .business-assessment-builder__workspace {
    position: static;
  }
}
</style>
