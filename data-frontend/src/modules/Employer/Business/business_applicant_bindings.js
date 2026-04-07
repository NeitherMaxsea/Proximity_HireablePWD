import { computed } from 'vue'

export const createApplicantState = (ctx = {}) => {
  const {
    businessJobApplications,
    normalizeUserOverviewValue,
  } = ctx

  const businessApplicantHighlights = computed(() => {
    const allApplicants = businessJobApplications.value
    const totalApplicants = allApplicants.length
    const underReviewCount = allApplicants.filter((item) =>
      ['reviewing', 'under review', 'in_review'].includes(normalizeUserOverviewValue(item?.status)),
    ).length
    const interviewReadyCount = allApplicants.filter((item) =>
      normalizeUserOverviewValue(item?.status).includes('interview'),
    ).length

    return [
      { label: 'New Applicants', value: String(totalApplicants) },
      { label: 'Under Review', value: String(underReviewCount) },
      { label: 'Interview Ready', value: String(interviewReadyCount) },
    ]
  })

  return {
    businessApplicantHighlights,
  }
}

export const createApplicantBindings = (ctx) => computed(() => ({
  businessApplicantHighlights: ctx.businessApplicantHighlights.value,
  applicantManagementFilters: ctx.applicantManagementFilters,
  applicantManagementRoleOptions: ctx.applicantManagementRoleOptions.value,
  reviewApplicantManagementQueue: ctx.reviewApplicantManagementQueue,
  applicantManagementSummary: ctx.applicantManagementSummary.value,
  filteredApplicantManagementRows: ctx.filteredApplicantManagementRows.value,
  openApplicantManagementDecision: ctx.openApplicantManagementDecision,
  requestApproveApplicantManagementApplication: ctx.requestApproveApplicantManagementApplication,
}))
