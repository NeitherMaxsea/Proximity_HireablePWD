const BUSINESS_BACKEND_DISABLED_MESSAGE =
  'Business backend is temporarily disabled for debugging.'

const notifyBusinessBackendDisabled = (options = {}, message = BUSINESS_BACKEND_DISABLED_MESSAGE) => {
  if (typeof options.showPaymentToast === 'function') {
    options.showPaymentToast(message, 'warning')
  }

  return false
}

const createDisabledProcess = (message = BUSINESS_BACKEND_DISABLED_MESSAGE) => async (options = {}) =>
  notifyBusinessBackendDisabled(options, message)

export const approveApplicantManagementApplicationProcess = createDisabledProcess()
export const rejectApplicantManagementApplicationProcess = createDisabledProcess()
export const completeBusinessInterviewScheduleProcess = createDisabledProcess()
export const approveBusinessInterviewRescheduleRequestProcess = createDisabledProcess()
export const rejectBusinessInterviewRescheduleRequestProcess = createDisabledProcess()
export const createBusinessInterviewScheduleProcess = createDisabledProcess()
export const assignTrainingTemplateToMemberProcess = createDisabledProcess()
export const toggleTrainingAssignmentSkillCompletionProcess = createDisabledProcess()
export const setTrainingAssignmentSkillGradeProcess = createDisabledProcess()
export const saveTrainingTrackingCategoryRemarkProcess = createDisabledProcess()
export const completeTrainingTrackingAssignmentProcess = createDisabledProcess()
export const syncAssignedApplicantAssessmentScoresProcess = createDisabledProcess()
export const assignAssessmentTemplateToApplicantProcess = createDisabledProcess()
export const removeAssignedAssessmentFromApplicantProcess = createDisabledProcess()
