import { computed } from 'vue'

const text = (value = '') => String(value ?? '').trim()

const createFallbackApplicants = () => ([
  {
    id: 'applicant-1',
    name: 'Maria Santos',
    role: 'Applicant for Cashier',
    appliedAtLabel: 'today',
    statusTone: 'new',
    statusLabel: 'Fresh',
    isNew: true,
    initials: 'MS',
    avatarUrl: '',
  },
  {
    id: 'applicant-2',
    name: 'John Dela Cruz',
    role: 'Applicant for Sales Associate',
    appliedAtLabel: 'yesterday',
    statusTone: 'review',
    statusLabel: 'Under review',
    isNew: false,
    initials: 'JD',
    avatarUrl: '',
  },
  {
    id: 'applicant-3',
    name: 'Angela Reyes',
    role: 'Applicant for Service Crew',
    appliedAtLabel: '2 days ago',
    statusTone: 'interview',
    statusLabel: 'Interview',
    isNew: false,
    initials: 'AR',
    avatarUrl: '',
  },
  {
    id: 'applicant-4',
    name: 'Paolo Mendoza',
    role: 'Applicant for Store Support',
    appliedAtLabel: '3 days ago',
    statusTone: 'pending',
    statusLabel: 'Pending',
    isNew: false,
    initials: 'PM',
    avatarUrl: '',
  },
])

const createFallbackJobs = () => ([
  { id: 'job-1', title: 'Cashier', isOpen: true },
  { id: 'job-2', title: 'Sales Associate', isOpen: true },
  { id: 'job-3', title: 'Service Crew', isOpen: true },
  { id: 'job-4', title: 'Store Support', isOpen: true },
  { id: 'job-5', title: 'Inventory Clerk', isOpen: true },
  { id: 'job-6', title: 'Shift Lead', isOpen: true },
  { id: 'job-7', title: 'Branch Coordinator', isOpen: true },
])

const createFallbackTeamMembers = (isEmployeeWorkspaceMode = false) =>
  Array.from({ length: isEmployeeWorkspaceMode ? 4 : 11 }, (_, index) => ({
    id: `member-${index + 1}`,
  }))

const normalizeApplicantTone = (status = '') => {
  const normalizedStatus = text(status).toLowerCase()

  if (normalizedStatus.includes('interview')) return 'interview'
  if (normalizedStatus.includes('review')) return 'review'
  if (normalizedStatus.includes('approve')) return 'approved'
  if (normalizedStatus.includes('reject')) return 'rejected'
  if (normalizedStatus.includes('new') || normalizedStatus.includes('fresh')) return 'new'

  return 'pending'
}

const normalizeApplicantLabel = (status = '') => {
  const normalizedStatus = text(status)
  if (!normalizedStatus) return 'Pending'
  return normalizedStatus
}

const buildDashboardTrendMonths = (jobCount, applicantCount) => {
  const safeJobCount = Math.max(Number(jobCount) || 0, 1)
  const safeApplicantCount = Math.max(Number(applicantCount) || 0, 1)

  return [
    { key: 'jan', label: 'Jan', jobs: Math.max(1, safeJobCount - 5), applicants: Math.max(1, safeApplicantCount - 13) },
    { key: 'feb', label: 'Feb', jobs: Math.max(1, safeJobCount - 4), applicants: Math.max(1, safeApplicantCount - 11) },
    { key: 'mar', label: 'Mar', jobs: Math.max(1, safeJobCount - 4), applicants: Math.max(1, safeApplicantCount - 10) },
    { key: 'apr', label: 'Apr', jobs: Math.max(1, safeJobCount - 3), applicants: Math.max(1, safeApplicantCount - 9) },
    { key: 'may', label: 'May', jobs: Math.max(1, safeJobCount - 3), applicants: Math.max(1, safeApplicantCount - 7) },
    { key: 'jun', label: 'Jun', jobs: Math.max(1, safeJobCount - 2), applicants: Math.max(1, safeApplicantCount - 6) },
    { key: 'jul', label: 'Jul', jobs: Math.max(1, safeJobCount - 2), applicants: Math.max(1, safeApplicantCount - 5) },
    { key: 'aug', label: 'Aug', jobs: Math.max(1, safeJobCount - 1), applicants: Math.max(1, safeApplicantCount - 4) },
    { key: 'sep', label: 'Sep', jobs: Math.max(1, safeJobCount - 1), applicants: Math.max(1, safeApplicantCount - 3) },
    { key: 'oct', label: 'Oct', jobs: Math.max(1, safeJobCount - 1), applicants: Math.max(1, safeApplicantCount - 3) },
    { key: 'nov', label: 'Nov', jobs: safeJobCount, applicants: Math.max(1, safeApplicantCount - 1) },
    { key: 'dec', label: 'Dec', jobs: safeJobCount, applicants: safeApplicantCount },
  ]
}

const buildLinePath = (points = []) =>
  points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')

export const createDashboardState = (ctx = {}) => {
  const dashboardApplicantFeed = computed(() => {
    const sourceApplicants = Array.isArray(ctx.businessJobApplications?.value)
      ? ctx.businessJobApplications.value
      : createFallbackApplicants()

    return sourceApplicants.slice(0, 6).map((item, index) => {
      const normalizedName = text(item?.name || item?.fullName || item?.applicant_name) || `Applicant ${index + 1}`
      const initials = normalizedName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'AP'
      const normalizedStatus = normalizeApplicantLabel(item?.statusLabel || item?.status)
      const statusTone = normalizeApplicantTone(normalizedStatus)

      return {
        id: text(item?.id || item?.applicationId || item?.email || `applicant-${index + 1}`),
        name: normalizedName,
        role: text(item?.role || item?.appliedRole || item?.jobTitle || item?.position) || 'Applicant',
        appliedAtLabel: text(item?.appliedAtLabel || item?.date || item?.appliedAt) || 'recently',
        statusTone,
        statusLabel: normalizedStatus,
        isNew: item?.isNew === true || statusTone === 'new',
        initials,
        avatarUrl: text(item?.avatarUrl || item?.avatar || item?.photoURL),
      }
    })
  })

  const dashboardOpenJobs = computed(() => {
    const sourceJobs = Array.isArray(ctx.businessJobPosts?.value)
      ? ctx.businessJobPosts.value
      : createFallbackJobs()

    const openJobs = sourceJobs.filter((item) => item?.isOpen !== false && text(item?.status).toLowerCase() !== 'closed')
    return openJobs.length || sourceJobs.length
  })

  const dashboardTeamMembers = computed(() => {
    const workspaceUsers = Array.isArray(ctx.workspaceUserDirectory?.value) ? ctx.workspaceUserDirectory.value : []
    const employeeDirectory = Array.isArray(ctx.employeeDirectory?.value) ? ctx.employeeDirectory.value : []
    const fallbackTeam = createFallbackTeamMembers(Boolean(ctx.isBusinessEmployeeWorkspaceMode?.value))

    return workspaceUsers.length || employeeDirectory.length
      ? Math.max(workspaceUsers.length, employeeDirectory.length)
      : fallbackTeam.length
  })

  const dashboardApplicantCount = computed(() => dashboardApplicantFeed.value.length)
  const dashboardNewApplicantCount = computed(() => dashboardApplicantFeed.value.filter((item) => item.isNew).length)
  const dashboardUnderReviewCount = computed(() =>
    dashboardApplicantFeed.value.filter((item) => item.statusTone === 'review' || item.statusTone === 'interview').length,
  )
  const dashboardResponseRate = computed(() => {
    const applicantCount = dashboardApplicantCount.value
    if (!applicantCount) return 0

    return Math.min(100, Math.round(((dashboardUnderReviewCount.value + dashboardNewApplicantCount.value) / applicantCount) * 100))
  })

  const dashboardSummaryCards = computed(() => ([
    {
      label: 'Open Roles',
      value: String(dashboardOpenJobs.value),
      subtitle: 'Positions actively published this cycle.',
      icon: 'bi bi-briefcase-fill',
      tone: 'emerald',
    },
    {
      label: 'Applicants',
      value: String(dashboardApplicantCount.value),
      subtitle: 'Candidates currently visible in the workspace.',
      icon: 'bi bi-people-fill',
      tone: 'sky',
    },
    {
      label: 'Response Rate',
      value: `${dashboardResponseRate.value}%`,
      subtitle: 'Applicants already touched by the hiring flow.',
      icon: 'bi bi-graph-up-arrow',
      tone: 'amber',
    },
    {
      label: 'Team Members',
      value: String(dashboardTeamMembers.value),
      subtitle: 'Users collaborating in this branch workspace.',
      icon: 'bi bi-diagram-3-fill',
      tone: 'violet',
    },
  ]))

  const dashboardSyncOverview = computed(() => ({
    badge: ctx.isBusinessEmployeeWorkspaceMode?.value ? 'Employee view' : 'Owner view',
  }))

  const dashboardBarSeries = computed(() => {
    const applicantCount = Math.max(dashboardApplicantCount.value, 1)
    const screeningCount = dashboardNewApplicantCount.value || dashboardApplicantCount.value
    const interviewCount = dashboardApplicantFeed.value.filter((item) => item.statusTone === 'interview').length
    const activeCount = dashboardUnderReviewCount.value
    const readyCount = dashboardApplicantFeed.value.filter((item) =>
      ['approved', 'interview'].includes(item.statusTone),
    ).length
    const toPercent = (count) => `${Math.min(100, Math.round((count / applicantCount) * 100))}%`

    return [
      { label: 'Screening', detail: 'Profiles checked in the first pass.', value: toPercent(screeningCount), width: toPercent(screeningCount), tone: 'emerald' },
      { label: 'Interviewing', detail: 'Candidates moved to interviews.', value: toPercent(interviewCount), width: toPercent(interviewCount), tone: 'sky' },
      { label: 'Active Review', detail: 'Applicants currently under recruiter review.', value: toPercent(activeCount), width: toPercent(activeCount), tone: 'amber' },
      { label: 'Ready Next Step', detail: 'Applicants cleared for the next action.', value: toPercent(readyCount), width: toPercent(readyCount), tone: 'violet' },
    ]
  })

  const dashboardDonutLegend = computed(() => ([
    { label: 'Jobs', value: String(dashboardOpenJobs.value), countLabel: 'active openings', color: '#2f8f63' },
    { label: 'Applicants', value: String(dashboardApplicantCount.value), countLabel: 'in pipeline', color: '#3e7be0' },
    { label: 'Team', value: String(dashboardTeamMembers.value), countLabel: 'workspace users', color: '#a46ee8' },
  ]))

  const dashboardDonutTotal = computed(() =>
    dashboardDonutLegend.value.reduce((total, item) => total + (Number(item.value) || 0), 0),
  )

  const dashboardDonutStyle = computed(() => {
    const total = dashboardDonutTotal.value || 1
    let offset = 0

    const segments = dashboardDonutLegend.value.map((item) => {
      const start = offset
      offset += ((Number(item.value) || 0) / total) * 100
      return `${item.color} ${start}% ${offset}%`
    })

    return {
      background: `conic-gradient(${segments.join(', ')})`,
    }
  })

  const businessTrendChart = computed(() => {
    const months = buildDashboardTrendMonths(dashboardOpenJobs.value, dashboardApplicantCount.value)
    const chartWidth = 720
    const chartHeight = 260
    const topPadding = 18
    const bottomPadding = 28
    const leftPadding = 18
    const rightPadding = 18
    const values = months.flatMap((item) => [item.jobs, item.applicants])
    const maxValue = Math.max(...values, 1)
    const usableWidth = chartWidth - leftPadding - rightPadding
    const usableHeight = chartHeight - topPadding - bottomPadding

    const mapPoint = (value, index, key) => ({
      key: `${key}-${months[index].key}`,
      label: months[index].label,
      x: leftPadding + ((usableWidth / Math.max(months.length - 1, 1)) * index),
      y: topPadding + (usableHeight - ((value / maxValue) * usableHeight)),
      isCurrent: index === months.length - 1,
    })

    const jobPoints = months.map((item, index) => mapPoint(item.jobs, index, 'job'))
    const applicantPoints = months.map((item, index) => mapPoint(item.applicants, index, 'applicant'))
    const jobPath = buildLinePath(jobPoints)
    const applicantPath = buildLinePath(applicantPoints)
    const jobAreaPath = `${jobPath} L ${jobPoints.at(-1)?.x || chartWidth} ${chartHeight - bottomPadding} L ${jobPoints[0]?.x || leftPadding} ${chartHeight - bottomPadding} Z`

    return {
      chartWidth,
      chartHeight,
      months,
      jobPoints,
      applicantPoints,
      jobPath,
      applicantPath,
      jobAreaPath,
      totalJobs: months.reduce((sum, item) => sum + item.jobs, 0),
      totalApplicants: months.reduce((sum, item) => sum + item.applicants, 0),
      highlightCards: [
        { label: 'Peak Month', value: months.at(-1)?.label || 'Current', detail: 'Most active hiring month.', trend: 'up', tone: 'emerald' },
        { label: 'Jobs Live', value: String(dashboardOpenJobs.value), detail: 'Open positions right now.', trend: 'up', tone: 'sky' },
        { label: 'Applicants This Cycle', value: String(dashboardApplicantCount.value), detail: 'Visible in the active queue.', trend: 'up', tone: 'amber' },
      ],
    }
  })

  return {
    dashboardSummaryCards,
    dashboardApplicantFeed,
    dashboardSyncOverview,
    dashboardBarSeries,
    dashboardDonutLegend,
    dashboardDonutTotal,
    dashboardDonutStyle,
    businessTrendChart,
  }
}
