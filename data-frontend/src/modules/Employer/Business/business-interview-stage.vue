<script setup>
import { computed, reactive, ref } from 'vue'
import '@/components/businesss.css'

const props = defineProps({
  businessJobApplications: { type: Array, default: () => [] },
})

const text = (value = '') => String(value ?? '').trim()
const normalizeValue = (value = '') => text(value).toLowerCase()
const isRefreshing = ref(false)
const formError = ref('')
const selectedDay = ref(new Date().getDate())
const currentDate = ref(new Date())
const form = reactive({
  applicantId: '',
  interviewType: 'Initial Interview',
  schedule: '',
  mode: 'Online',
  locationOrLink: '',
  interviewer: 'Hiring Manager',
  notes: '',
})

const fallbackApplicants = [
  { id: 'interview-1', applicantName: 'Maria Santos', applicantEmail: 'maria.santos@example.com', jobTitle: 'Cashier', status: 'approved' },
  { id: 'interview-2', applicantName: 'John Dela Cruz', applicantEmail: 'john.delacruz@example.com', jobTitle: 'Sales Associate', status: 'interview', interviewDate: new Date().toISOString(), interviewer: 'Hiring Manager' },
]

const acceptedApplicants = computed(() => {
  const source = Array.isArray(props.businessJobApplications) && props.businessJobApplications.length ? props.businessJobApplications : fallbackApplicants
  return source
    .filter((item) => {
      const status = normalizeValue(item?.status)
      return status.includes('approve') || status.includes('interview') || !status
    })
    .map((item, index) => ({
      id: text(item?.id || `applicant-${index + 1}`),
      applicantName: text(item?.applicantName || item?.applicant_name || item?.name) || `Applicant ${index + 1}`,
      applicantEmail: text(item?.applicantEmail || item?.applicant_email || item?.email) || 'No email',
      jobTitle: text(item?.jobTitle || item?.job_title || item?.role) || 'Open role',
      interviewStatus: normalizeValue(item?.interviewSchedule) ? 'scheduled' : normalizeValue(item?.status).includes('interview') ? 'completed' : 'ready',
      interviewDate: text(item?.interviewDate || item?.interviewSchedule || item?.appliedAt),
      interviewer: text(item?.interviewer || 'Hiring Manager'),
    }))
})

const stats = computed(() => ({
  ready: acceptedApplicants.value.filter((item) => item.interviewStatus === 'ready').length,
  scheduled: acceptedApplicants.value.filter((item) => item.interviewStatus === 'scheduled').length,
  completed: acceptedApplicants.value.filter((item) => item.interviewStatus === 'completed').length,
}))

const applicantOptions = computed(() =>
  acceptedApplicants.value.map((item) => ({
    value: item.id,
    label: `${item.applicantName} - ${item.jobTitle}`,
  })),
)

const refreshApplicants = async () => {
  isRefreshing.value = true
  await new Promise((resolve) => setTimeout(resolve, 420))
  isRefreshing.value = false
}

const createBusinessInterviewSchedule = async () => {
  if (!text(form.applicantId) || !text(form.schedule)) {
    formError.value = 'Select an applicant and a schedule before creating the interview.'
    return
  }
  formError.value = ''
}

const resetForm = () => {
  form.applicantId = ''
  form.interviewType = 'Initial Interview'
  form.schedule = ''
  form.mode = 'Online'
  form.locationOrLink = ''
  form.interviewer = 'Hiring Manager'
  form.notes = ''
  formError.value = ''
}

const monthLabel = computed(() => currentDate.value.toLocaleString('en-US', { month: 'long', year: 'numeric' }))
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let index = 0; index < firstDay; index += 1) days.push({ key: `empty-${index}`, label: '', muted: true, schedules: 0 })
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({
      key: `day-${day}`,
      label: day,
      muted: false,
      isToday: day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear(),
      isSelected: day === selectedDay.value,
      schedules: acceptedApplicants.value.filter((item) => new Date(item.interviewDate || Date.now()).getDate() === day).length,
    })
  }
  return days
})

const selectedDaySchedules = computed(() =>
  acceptedApplicants.value.filter((item) => new Date(item.interviewDate || Date.now()).getDate() === selectedDay.value),
)

const resolveStatusBadgeClass = (status = '') => {
  const normalized = normalizeValue(status)
  if (normalized === 'completed') return 'is-completed'
  if (normalized === 'scheduled') return 'is-scheduled'
  if (normalized === 'ready') return 'is-ready'
  return 'is-pending'
}
</script>

<template>
  <section class="business-interview-scheduling">
    <header class="business-interview-scheduling__header">
      <div class="business-interview-scheduling__header-copy">
        <p class="business-interview-scheduling__kicker">Interview Management</p>
        <h2>Schedule interviews and track interview progress</h2>
        <p>Keep interview scheduling and status tracking inside one business workspace view while backend actions stay paused.</p>
      </div>
      <div class="business-interview-scheduling__header-actions">
        <button type="button" class="business-interview-scheduling__link-btn">Schedule</button>
        <button type="button" class="business-interview-scheduling__refresh" :disabled="isRefreshing" @click="refreshApplicants">{{ isRefreshing ? 'Refreshing...' : 'Refresh' }}</button>
      </div>
    </header>

    <div class="business-interview-scheduling__stat-strip">
      <span>{{ stats.ready }} ready</span>
      <span>{{ stats.scheduled }} scheduled</span>
      <span>{{ stats.completed }} completed</span>
    </div>

    <div class="business-interview-scheduling__layout">
      <section class="business-interview-scheduling__main">
        <article class="business-interview-scheduling__card">
          <div class="business-interview-scheduling__card-head">
            <div>
              <p class="business-interview-scheduling__card-kicker">Scheduling Form</p>
              <h3>Create interview schedule</h3>
              <p>Choose an applicant and set the interview details below.</p>
            </div>
          </div>

          <div class="business-interview-scheduling__form-grid">
            <label class="business-interview-scheduling__field business-interview-scheduling__field--full">
              <span>Applicant</span>
              <select v-model="form.applicantId"><option value="">Select applicant</option><option v-for="option in applicantOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select>
            </label>
            <label class="business-interview-scheduling__field"><span>Interview Type</span><select v-model="form.interviewType"><option>Initial Interview</option><option>Final Interview</option><option>Panel Interview</option></select></label>
            <label class="business-interview-scheduling__field"><span>Schedule</span><input v-model="form.schedule" type="datetime-local"></label>
            <label class="business-interview-scheduling__field"><span>Mode</span><select v-model="form.mode"><option>Online</option><option>On-site</option><option>Hybrid</option></select></label>
            <label class="business-interview-scheduling__field"><span>Interviewer</span><input v-model="form.interviewer" type="text"></label>
            <label class="business-interview-scheduling__field business-interview-scheduling__field--full"><span>Location or Meeting Link</span><input v-model="form.locationOrLink" type="text" placeholder="Office meeting room or video call link"></label>
            <label class="business-interview-scheduling__field business-interview-scheduling__field--full"><span>Notes</span><textarea v-model="form.notes" rows="4" placeholder="Add interviewer notes or reminders"></textarea></label>
          </div>

          <p v-if="formError" class="business-interview-scheduling__error">{{ formError }}</p>
          <div class="business-interview-scheduling__actions">
            <button type="button" class="business-interview-scheduling__reset" @click="resetForm">Reset</button>
            <button type="button" class="business-interview-scheduling__submit" @click="createBusinessInterviewSchedule">Create Schedule</button>
          </div>
        </article>

        <article class="business-interview-scheduling__card">
          <div class="business-interview-scheduling__calendar-head">
            <h3>Interview Calendar</h3>
            <div class="business-interview-scheduling__calendar-nav">
              <button type="button" @click="currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)">&lt;</button>
              <strong>{{ monthLabel }}</strong>
              <button type="button" @click="currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)">&gt;</button>
            </div>
          </div>
          <div class="business-interview-scheduling__calendar-grid business-interview-scheduling__calendar-grid--week"><span v-for="label in weekdayLabels" :key="label">{{ label }}</span></div>
          <div class="business-interview-scheduling__calendar-grid">
            <button v-for="day in calendarDays" :key="day.key" type="button" class="business-interview-scheduling__day-cell" :class="{ 'is-muted': day.muted, 'is-today': day.isToday, 'is-selected': day.isSelected, 'is-busy': day.schedules }" :disabled="day.muted" @click="selectedDay = day.label">
              <span class="business-interview-scheduling__day-number">{{ day.label }}</span>
              <small v-if="day.schedules">{{ day.schedules }} schedule{{ day.schedules === 1 ? '' : 's' }}</small>
            </button>
          </div>
          <div class="business-interview-scheduling__day-list">
            <h4>Selected Day Schedules</h4>
            <ul v-if="selectedDaySchedules.length"><li v-for="row in selectedDaySchedules" :key="row.id"><strong>{{ row.applicantName }}</strong><span>{{ row.jobTitle }}</span></li></ul>
            <p v-else class="business-interview-scheduling__day-empty">No interview schedules for this day yet.</p>
          </div>
        </article>
      </section>

      <aside class="business-interview-status">
        <article v-for="row in acceptedApplicants" :key="row.id" class="business-interview-scheduling__card business-interview-status__panel">
          <div class="business-interview-status__applicant"><strong>{{ row.applicantName }}</strong><span>{{ row.applicantEmail }}</span><small>{{ row.jobTitle }}</small></div>
          <div class="business-interview-status__stage"><strong>Interview Status</strong><span>{{ row.interviewer }}</span></div>
          <span class="business-interview-status__badge" :class="resolveStatusBadgeClass(row.interviewStatus)">{{ row.interviewStatus }}</span>
        </article>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.business-interview-scheduling,
.business-interview-scheduling__layout,
.business-interview-scheduling__main,
.business-interview-status {
  min-width: 0;
}

.business-interview-scheduling {
  display: grid;
  gap: 1rem;
}

.business-interview-scheduling__header,
.business-interview-scheduling__card,
.business-interview-status__panel,
.business-interview-scheduling__stat-strip {
  box-shadow: 0 16px 34px rgba(24, 49, 38, 0.06);
}

.business-interview-scheduling__main {
  min-width: 0;
}

.business-interview-status {
  display: grid;
  gap: 1rem;
  align-content: start;
}

.business-interview-scheduling__day-list ul,
.business-interview-status__applicant,
.business-interview-status__stage {
  min-width: 0;
}

.business-interview-status__applicant span,
.business-interview-status__applicant small {
  overflow-wrap: anywhere;
}
</style>
