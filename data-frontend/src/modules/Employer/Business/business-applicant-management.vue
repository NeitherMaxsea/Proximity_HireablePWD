<script setup>
import { computed, reactive } from 'vue'
import BusinessApplicantContent from '@/modules/Employer/Business/business_Applicant.vue'
import { createApplicantState } from '@/modules/Employer/Business/business_applicant_bindings'
import '@/components/businesss.css'

const props = defineProps({
  businessJobApplications: {
    type: Array,
    default: () => [],
  },
})

const text = (value = '') => String(value ?? '').trim()
const normalizeValue = (value = '') => text(value).toLowerCase()
const formatRelativeDate = (value = '') => {
  const parsedTime = Date.parse(text(value))
  if (!parsedTime) return 'Recently'

  const diff = Date.now() - parsedTime
  const day = 24 * 60 * 60 * 1000
  if (diff < day) return 'Today'
  if (diff < day * 2) return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(parsedTime))
}
const buildInitials = (value = '') =>
  text(value)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'AP'

const fallbackApplicants = [
  {
    id: 'fallback-applicant-1',
    applicantName: 'Maria Santos',
    applicantEmail: 'maria.santos@example.com',
    jobTitle: 'Cashier',
    status: 'pending',
    appliedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-applicant-2',
    applicantName: 'John Dela Cruz',
    applicantEmail: 'john.delacruz@example.com',
    jobTitle: 'Sales Associate',
    status: 'under review',
    appliedAt: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
  },
]

const statusOverrides = reactive({})
const applicantManagementFilters = reactive({
  search: '',
  roleFilter: 'all',
  statusFilter: 'all',
})

const baseApplications = computed(() =>
  Array.isArray(props.businessJobApplications) && props.businessJobApplications.length
    ? props.businessJobApplications
    : fallbackApplicants,
)

const applicantState = createApplicantState({
  businessJobApplications: computed(() =>
    baseApplications.value.map((item) => ({
      ...item,
      status: text(statusOverrides[item.id] || item.status || 'pending'),
    })),
  ),
  normalizeUserOverviewValue: normalizeValue,
})

const applicantManagementRoleOptions = computed(() => {
  const seen = new Set()
  const options = [{ value: 'all', label: 'All Roles' }]

  baseApplications.value.forEach((item) => {
    const role = text(item?.jobTitle || item?.job_title || item?.role || item?.position)
    if (!role || seen.has(role.toLowerCase())) return
    seen.add(role.toLowerCase())
    options.push({
      value: role,
      label: role,
    })
  })

  return options
})

const normalizeStatusLabel = (value = '') => {
  const normalized = normalizeValue(value)
  if (!normalized) return 'Pending'
  if (normalized === 'in_review') return 'Under Review'

  return normalized
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const resolveFinalAction = (status = '') => {
  const normalized = normalizeValue(status)
  if (normalized.includes('approve')) {
    return { tone: 'approved', label: 'Approved', icon: 'bi bi-check-circle-fill' }
  }

  if (normalized.includes('reject')) {
    return { tone: 'rejected', label: 'Rejected', icon: 'bi bi-x-circle-fill' }
  }

  return { tone: 'neutral', label: 'View', icon: 'bi bi-eye-fill' }
}

const filteredApplicantManagementRows = computed(() => {
  const query = normalizeValue(applicantManagementFilters.search)
  const roleFilter = normalizeValue(applicantManagementFilters.roleFilter)
  const statusFilter = normalizeValue(applicantManagementFilters.statusFilter)

  return baseApplications.value
    .map((item, index) => {
      const name = text(item?.applicantName || item?.applicant_name || item?.name) || `Applicant ${index + 1}`
      const email = text(item?.applicantEmail || item?.applicant_email || item?.email) || 'No email'
      const role = text(item?.jobTitle || item?.job_title || item?.role || item?.position) || 'Applicant'
      const status = text(statusOverrides[item.id] || item?.status || 'pending')
      const normalizedStatus = normalizeValue(status)
      const statusLabel = normalizeStatusLabel(status)
      const isFinalStatus = normalizedStatus.includes('approve') || normalizedStatus.includes('reject')

      return {
        id: text(item?.id || item?.applicationId || `${email}-${index}`),
        name,
        email,
        role,
        accessSummary: text(item?.businessName || item?.companyName || 'Business application'),
        status: normalizedStatus.replace(/_/g, ' '),
        statusLabel,
        date: formatRelativeDate(item?.appliedAt || item?.createdAt || item?.date),
        initials: buildInitials(name),
        avatarUrl: text(item?.applicantAvatar || item?.avatarUrl || item?.avatar),
        avatarClass: `is-${normalizedStatus.replace(/\s+/g, '-') || 'pending'}`,
        isFinalStatus,
        finalAction: resolveFinalAction(status),
      }
    })
    .filter((item) => {
      const matchesQuery = !query || [item.name, item.email, item.role].some((value) => normalizeValue(value).includes(query))
      const matchesRole = roleFilter === 'all' || normalizeValue(item.role) === roleFilter
      const matchesStatus = statusFilter === 'all' || normalizeValue(item.status) === statusFilter
      return matchesQuery && matchesRole && matchesStatus
    })
})

const applicantManagementSummary = computed(() => {
  const count = filteredApplicantManagementRows.value.length
  if (!count) return 'No applicants found'
  return `${count} applicant${count === 1 ? '' : 's'} shown`
})

const openApplicantManagementDecision = (applicationId = '', action = 'view') => {
  const applicant = filteredApplicantManagementRows.value.find((item) => item.id === text(applicationId))
  if (!applicant) return

  if (action === 'reject') {
    statusOverrides[applicant.id] = 'rejected'
    return
  }

  if (action === 'view') {
    if (typeof window !== 'undefined') {
      window.alert(`${applicant.name}\n${applicant.role}\n${applicant.email}\nStatus: ${applicant.statusLabel}`)
    }
  }
}

const requestApproveApplicantManagementApplication = (applicationId = '') => {
  const normalizedId = text(applicationId)
  if (!normalizedId) return
  statusOverrides[normalizedId] = 'approved'
}

const reviewApplicantManagementQueue = () => {
  baseApplications.value.forEach((item) => {
    const itemId = text(item?.id)
    const currentStatus = normalizeValue(statusOverrides[itemId] || item?.status)
    if (itemId && currentStatus === 'pending') {
      statusOverrides[itemId] = 'under review'
    }
  })
}

const {
  businessApplicantHighlights,
} = applicantState
</script>

<template>
  <section class="business-shell__stage">
    <BusinessApplicantContent
      :business-applicant-highlights="businessApplicantHighlights"
      :applicant-management-filters="applicantManagementFilters"
      :applicant-management-role-options="applicantManagementRoleOptions"
      :review-applicant-management-queue="reviewApplicantManagementQueue"
      :applicant-management-summary="applicantManagementSummary"
      :filtered-applicant-management-rows="filteredApplicantManagementRows"
      :open-applicant-management-decision="openApplicantManagementDecision"
      :request-approve-applicant-management-application="requestApproveApplicantManagementApplication"
    />
  </section>
</template>
