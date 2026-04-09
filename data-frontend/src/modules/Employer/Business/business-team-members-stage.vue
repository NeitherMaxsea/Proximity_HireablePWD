<script setup>
import { computed, reactive, ref, watch } from 'vue'
import '@/components/businesss.css'
import BusinessUserOverview from '@/modules/Employer/Business/business_user-overview.vue'

const props = defineProps({
  activeSection: { type: String, default: 'user-overview' },
  workspaceUserDirectory: { type: Array, default: () => [] },
  employeeDirectory: { type: Array, default: () => [] },
})

const text = (value = '') => String(value ?? '').trim()
const normalizeValue = (value = '') => text(value).toLowerCase()
const buildInitials = (value = '') =>
  text(value).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'TM'
const isRenderableAvatar = (value = '') => /^(https?:|data:|blob:|\/)/i.test(text(value))
const formatDate = (value = '') => {
  const raw = text(value)
  if (!raw) return 'Not set'
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? raw : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const workspaceFallback = [
  {
    id: 'ws-001',
    name: 'Kevin Ramos',
    email: 'kevin.ramos@example.com',
    role: 'Operations Lead',
    status: 'active',
    startDate: '2026-01-12',
    linkedMember: 'Linked to employee profile',
    department: 'Operations',
  },
  {
    id: 'ws-002',
    name: 'Lara Cruz',
    email: 'lara.cruz@example.com',
    role: 'Recruitment Assistant',
    status: 'on leave',
    startDate: '2025-11-05',
    linkedMember: 'Waiting for profile sync',
    department: 'Recruitment',
  },
]

const employeeFallback = [
  {
    id: 'emp-001',
    name: 'Kevin Ramos',
    email: 'kevin.ramos@example.com',
    position: 'Cashier Trainer',
    status: 'active',
    branch: 'Kopiko Main Branch',
    startDate: '2026-01-12',
  },
  {
    id: 'emp-002',
    name: 'Lara Cruz',
    email: 'lara.cruz@example.com',
    position: 'Sales Associate',
    status: 'active',
    branch: 'Kopiko North Branch',
    startDate: '2025-11-05',
  },
]

const permissionRoles = ref([
  {
    id: 'role-admin',
    name: 'Operations Admin',
    summary: 'Full access to hiring, team members, and training tools.',
    assignedUsers: 2,
    enabledModules: 8,
    fullAccessModules: 5,
    modules: [
      { label: 'Dashboard', access: 'Full Access' },
      { label: 'Job Posting', access: 'Full Access' },
      { label: 'Applicant Management', access: 'Edit Access' },
      { label: 'Team Members', access: 'Full Access' },
      { label: 'Subscriptions', access: 'View Access' },
    ],
  },
  {
    id: 'role-support',
    name: 'Recruitment Support',
    summary: 'Can review applicants, schedule interviews, and track offers.',
    assignedUsers: 3,
    enabledModules: 5,
    fullAccessModules: 2,
    modules: [
      { label: 'Applicant Management', access: 'Edit Access' },
      { label: 'Assessment Management', access: 'Edit Access' },
      { label: 'Interview Scheduling', access: 'Full Access' },
      { label: 'Issue Offer', access: 'Edit Access' },
      { label: 'Team Members', access: 'Hidden' },
    ],
  },
])

const userOverviewSearch = ref('')
const userOverviewRoleFilter = ref('all')
const userOverviewStatusFilter = ref('all')
const rolePreviewId = ref(permissionRoles.value[0]?.id || '')
const createUserDraft = reactive({
  name: '',
  email: '',
  roleId: permissionRoles.value[0]?.id || '',
  status: 'active',
  startDate: '',
  notes: '',
})

const normalizedWorkspaceUsers = computed(() => {
  const source = Array.isArray(props.workspaceUserDirectory) && props.workspaceUserDirectory.length
    ? props.workspaceUserDirectory
    : workspaceFallback

  return source.map((item, index) => {
    const role = text(item?.role_name || item?.roleName || item?.role || item?.position) || 'Workspace User'
    const status = normalizeValue(item?.status || item?.employmentStatus || 'active') || 'active'
    const avatarUrl = text(item?.avatar || item?.photoURL || item?.photo_url || item?.profile_avatar)
    return {
      id: text(item?.id || item?.uid || `workspace-user-${index + 1}`),
      name: text(item?.name || item?.full_name || item?.displayName) || `Workspace User ${index + 1}`,
      email: text(item?.email || item?.workEmail || item?.gmail) || 'No email',
      role,
      status,
      statusLabel: status.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      date: text(item?.startDate || item?.createdAt || item?.joinedAt) || '',
      linkedMember: text(item?.linkedMember || item?.employeeName || item?.employee_profile_name) || 'No linked member',
      linkedState: text(item?.linkedState || item?.employee_profile_id || item?.employeeId) ? 'Linked' : 'Pending',
      accessSummary: text(item?.accessSummary || item?.permissionSummary) || 'Frontend restored access view',
      initials: buildInitials(item?.name || item?.full_name || item?.displayName),
      avatarUrl: isRenderableAvatar(avatarUrl) ? avatarUrl : '',
      avatarClass: text(item?.employee_profile_id || item?.employeeId) ? 'business-user-overview__avatar--linked' : 'business-user-overview__avatar--ready',
    }
  })
})

const normalizedEmployeeRows = computed(() => {
  const source = Array.isArray(props.employeeDirectory) && props.employeeDirectory.length
    ? props.employeeDirectory
    : employeeFallback

  return source.map((item, index) => {
    const status = normalizeValue(item?.status || item?.employmentStatus || 'active') || 'active'
    return {
      id: text(item?.id || `employee-${index + 1}`),
      name: text(item?.name || item?.full_name) || `Employee ${index + 1}`,
      email: text(item?.workEmail || item?.email) || 'No email',
      position: text(item?.position || item?.role) || 'Team Member',
      branch: text(item?.branch || item?.branchName || item?.assignment) || 'Main branch',
      startDate: text(item?.startDate || item?.createdAt) || '',
      status,
      statusLabel: status.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    }
  })
})

const roleOptions = computed(() => {
  const seen = new Set()
  return [{ value: 'all', label: 'All Roles' }].concat(
    normalizedWorkspaceUsers.value
      .filter((item) => {
        const key = normalizeValue(item.role)
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map((item) => ({ value: item.role, label: item.role })),
  )
})

const filteredUserOverviewRows = computed(() =>
  normalizedWorkspaceUsers.value.filter((user) => {
    const query = normalizeValue(userOverviewSearch.value)
    const roleFilter = normalizeValue(userOverviewRoleFilter.value)
    const statusFilter = normalizeValue(userOverviewStatusFilter.value)
    const matchesQuery = !query || [user.id, user.name, user.email, user.role].some((value) => normalizeValue(value).includes(query))
    const matchesRole = roleFilter === 'all' || normalizeValue(user.role) === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesQuery && matchesRole && matchesStatus
  }),
)

const userOverviewSummary = computed(() => `${filteredUserOverviewRows.value.length} of ${normalizedWorkspaceUsers.value.length} users`)
const selectedRolePreview = computed(() => permissionRoles.value.find((role) => role.id === rolePreviewId.value) || permissionRoles.value[0] || null)
watch(() => createUserDraft.roleId, (value) => { rolePreviewId.value = value || permissionRoles.value[0]?.id || '' }, { immediate: true })

const teamOverviewCards = computed(() => [
  { label: 'Workspace Users', value: normalizedWorkspaceUsers.value.length, helper: 'Accounts inside the business workspace' },
  { label: 'Employee Profiles', value: normalizedEmployeeRows.value.length, helper: 'Frontend employee directory records' },
  { label: 'Permission Roles', value: permissionRoles.value.length, helper: 'Reusable access profiles' },
])

const teamSections = computed(() => ({
  overview: props.activeSection === 'user-overview',
  create: props.activeSection === 'create-user',
  employees: props.activeSection === 'add-employee',
  permissions: props.activeSection === 'permissions',
}))

const setUserOverviewSearch = (value = '') => { userOverviewSearch.value = value }
const setUserOverviewRoleFilter = (value = 'all') => { userOverviewRoleFilter.value = value }
const setUserOverviewStatusFilter = (value = 'all') => { userOverviewStatusFilter.value = value }
</script>

<template>
  <section class="business-user-management business-team-members-stage">
    <section class="business-user-management__lead">
      <div class="business-user-management__copy">
        <p class="business-user-management__eyebrow">Team Members</p>
        <h2>Restore team management screens with the same Business workspace feel</h2>
        <p>
          This frontend remake brings back the team overview, user creation, employee directory, and permission design
          while backend writes stay paused.
        </p>
      </div>
      <div class="business-user-management__overview-grid">
        <article v-for="card in teamOverviewCards" :key="card.label" class="business-user-management__overview-card">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
          <small>{{ card.helper }}</small>
        </article>
      </div>
    </section>

    <BusinessUserOverview
      v-if="teamSections.overview"
      :workspace-user-count="normalizedWorkspaceUsers.length"
      :employee-profile-count="normalizedEmployeeRows.length"
      :rows="filteredUserOverviewRows"
      :role-options="roleOptions"
      :search="userOverviewSearch"
      :role-filter="userOverviewRoleFilter"
      :status-filter="userOverviewStatusFilter"
      :summary="userOverviewSummary"
      :format-date="formatDate"
      @update:search="setUserOverviewSearch"
      @update:role-filter="setUserOverviewRoleFilter"
      @update:status-filter="setUserOverviewStatusFilter"
    />

    <section v-else-if="teamSections.create" class="business-user-management__grid business-user-management__grid--two">
      <article class="business-user-management__panel business-user-management__panel--admin-create">
        <div class="business-user-management__panel-head">
          <div>
            <p class="business-user-management__panel-label">Create User</p>
            <h3>Prepare a new workspace account</h3>
          </div>
          <span class="business-user-management__panel-chip">Frontend form</span>
        </div>

        <div class="business-user-management__notice">
          This is a restored frontend-only form. Layout and field design are back, while save actions can be reconnected later.
        </div>

        <div class="business-user-management__grid business-user-management__grid--two">
          <label class="business-user-management__field">
            <span>Full Name</span>
            <input v-model="createUserDraft.name" type="text" placeholder="Maria Santos">
          </label>
          <label class="business-user-management__field">
            <span>Work Email</span>
            <input v-model="createUserDraft.email" type="email" placeholder="maria@business.com">
          </label>
          <label class="business-user-management__field">
            <span>Permission Role</span>
            <select v-model="createUserDraft.roleId">
              <option v-for="role in permissionRoles" :key="role.id" :value="role.id">{{ role.name }}</option>
            </select>
          </label>
          <label class="business-user-management__field">
            <span>Status</span>
            <select v-model="createUserDraft.status">
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="disabled">Disabled</option>
            </select>
          </label>
          <label class="business-user-management__field business-user-management__field--full">
            <span>Start Date</span>
            <input v-model="createUserDraft.startDate" type="date">
          </label>
          <label class="business-user-management__field business-user-management__field--full">
            <span>Notes</span>
            <input v-model="createUserDraft.notes" type="text" placeholder="Access notes, branch assignment, or onboarding reminder">
          </label>
        </div>

        <div class="business-user-management__actions">
          <button type="button" class="business-user-management__action-btn business-user-management__action-btn--secondary">Reset</button>
          <button type="button" class="business-user-management__action-btn business-user-management__action-btn--primary">Create User</button>
        </div>
      </article>

      <article class="business-user-management__access-panel">
        <div class="business-user-management__panel-copy">
          <p class="business-user-management__panel-label">Role Preview</p>
          <h3>{{ selectedRolePreview?.name || 'Permission Role' }}</h3>
          <p>{{ selectedRolePreview?.summary || 'Role access summary will appear here.' }}</p>
        </div>

        <div class="business-user-management__meta">
          <small>{{ selectedRolePreview?.assignedUsers || 0 }} assigned users</small>
          <small>{{ selectedRolePreview?.enabledModules || 0 }} enabled modules</small>
        </div>

        <div class="business-user-management__access-sections">
          <article
            v-for="module in selectedRolePreview?.modules || []"
            :key="module.label"
            class="business-user-management__access-item"
          >
            <div class="business-user-management__access-copy">
              <strong>{{ module.label }}</strong>
              <small>Restored frontend access preview</small>
            </div>
            <span
              class="business-user-management__access-badge"
              :class="{
                'is-full': module.access === 'Full Access',
                'is-edit': module.access === 'Edit Access',
                'is-view': module.access === 'View Access',
                'is-hidden': module.access === 'Hidden',
              }"
            >
              {{ module.access }}
            </span>
          </article>
        </div>
      </article>
    </section>

    <article v-else-if="teamSections.employees" class="business-user-management__panel">
      <div class="business-user-management__overview-head">
        <div>
          <p class="business-user-management__panel-label">Employee Directory</p>
          <h3>Employee roster and branch assignment</h3>
        </div>
        <div class="business-user-management__meta">
          <small>{{ normalizedEmployeeRows.length }} employee records</small>
        </div>
      </div>

      <div class="business-user-management__table-wrap">
        <table class="business-user-management__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Start Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in normalizedEmployeeRows" :key="member.id">
              <td>
                <strong>{{ member.name }}</strong><br>
                {{ member.email }}
              </td>
              <td>{{ member.position }}</td>
              <td>{{ member.branch }}</td>
              <td>
                <span class="business-user-management__status" :class="`is-${member.status.replace(/\s+/g, '-')}`">
                  {{ member.statusLabel }}
                </span>
              </td>
              <td>{{ formatDate(member.startDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <section v-else class="business-user-management__grid">
      <article class="business-user-management__panel">
        <div class="business-user-management__overview-head">
          <div>
            <p class="business-user-management__panel-label">Permissions</p>
            <h3>Role library for workspace access</h3>
          </div>
          <span class="business-user-management__panel-chip">{{ permissionRoles.length }} roles</span>
        </div>

        <div class="business-user-management__access-sections">
          <article v-for="role in permissionRoles" :key="role.id" class="business-user-management__access-group">
            <div class="business-user-management__access-group-head">
              <div class="business-user-management__access-group-title">
                <strong>{{ role.name }}</strong>
                <span>{{ role.summary }}</span>
              </div>
              <div class="business-user-management__meta">
                <small>{{ role.assignedUsers }} users</small>
                <small>{{ role.fullAccessModules }} full access modules</small>
              </div>
            </div>

            <div class="business-user-management__access-list">
              <div v-for="module in role.modules" :key="`${role.id}-${module.label}`" class="business-user-management__access-item">
                <div class="business-user-management__access-copy">
                  <strong>{{ module.label }}</strong>
                  <small>Business workspace frontend remake</small>
                </div>
                <span
                  class="business-user-management__access-badge"
                  :class="{
                    'is-full': module.access === 'Full Access',
                    'is-edit': module.access === 'Edit Access',
                    'is-view': module.access === 'View Access',
                    'is-hidden': module.access === 'Hidden',
                  }"
                >
                  {{ module.access }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.business-team-members-stage {
  display: grid;
  gap: 1rem;
  min-width: 0;
}

.business-user-management__lead {
  display: grid;
  gap: 1rem;
}

.business-user-management__copy h2,
.business-user-management__copy p,
.business-user-management__panel-copy h3,
.business-user-management__panel-copy p {
  margin: 0;
}

.business-user-management__panel,
.business-user-management__access-panel,
.business-user-management__lead {
  min-width: 0;
}

.business-user-management__notice {
  line-height: 1.6;
}

.business-user-management__table-wrap {
  overflow-x: auto;
}

.business-user-management__table td {
  vertical-align: top;
}
</style>
