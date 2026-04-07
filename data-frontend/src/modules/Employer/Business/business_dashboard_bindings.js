import { computed } from 'vue'

export const createDashboardState = (ctx = {}) => {
  const {
    employeeDirectory,
    workspaceUserDirectory,
    businessJobApplications,
    normalizeUserOverviewValue,
    postedJobs,
    postedJobsSummary,
    approvedApplicantTemplateAssignments,
    trainingTemplateAssignments,
    hasUnlockedBusinessWorkspace,
    isPostedJobsLoading,
    postedJobsSyncMessage,
    isWorkspaceUserDirectoryLoading,
    workspaceUserDirectorySyncMessage,
    currentBusinessAccountIdentity,
    assessmentTemplateLibrary,
    trainingTemplateLibrary,
  } = ctx

  const summaryCards = computed(() => {
    const linkedActiveMembers = employeeDirectory.value.filter((employee) => employee.status === 'Active').length
    const totalWorkspaceMembers = workspaceUserDirectory.value.length
    const activeMembers = Math.max(linkedActiveMembers, totalWorkspaceMembers)
    const totalApplicants = businessJobApplications.value.length
    const reviewApplicants = businessJobApplications.value.filter((application) =>
      ['reviewing', 'under review', 'in_review'].includes(normalizeUserOverviewValue(application?.status)),
    ).length

    return [
      {
        label: 'Posted Jobs',
        value: String(postedJobs.value.length),
        subtitle: `${postedJobsSummary.value.openCount} open listings in the workspace`,
        icon: 'bi bi-briefcase',
        tone: 'emerald',
      },
      {
        label: 'Applicants',
        value: String(totalApplicants),
        subtitle: totalApplicants
          ? `${reviewApplicants} applicants currently under review in this workspace`
          : 'No applicant submissions have arrived in this workspace yet',
        icon: 'bi bi-people',
        tone: 'sky',
      },
      {
        label: 'Team Members',
        value: String(totalWorkspaceMembers),
        subtitle: totalWorkspaceMembers
          ? `${activeMembers} synced members connected to this business workspace`
          : 'No synced team members in this business workspace yet',
        icon: 'bi bi-person-badge',
        tone: 'amber',
      },
      {
        label: 'Workspace Access',
        value: 'Active',
        subtitle: 'Business tools and workspace pages are ready to use.',
        icon: 'bi bi-stars',
        tone: 'violet',
      },
    ]
  })

  const dashboardTrendMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const clampDashboardPercent = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)))
  const formatDashboardPercent = (value) => `${clampDashboardPercent(value)}%`
  const buildDashboardRingStyle = (
    value,
    activeStart,
    activeEnd = activeStart,
    idleColor = 'rgba(219, 229, 221, 0.92)',
  ) => {
    const percent = clampDashboardPercent(value)
    return {
      background: `radial-gradient(circle at center, #ffffff 58%, transparent 59%), conic-gradient(${activeStart} 0%, ${activeEnd} ${percent}%, ${idleColor} ${percent}%, ${idleColor} 100%)`,
    }
  }
  const resolveDashboardSyncState = (loading, message) => {
    if (loading) return 'syncing'
    if (String(message || '').trim()) return 'issue'
    return 'live'
  }
  const resolveDashboardSyncLabel = (state) => {
    if (state === 'syncing') return 'Syncing'
    if (state === 'issue') return 'Check'
    return 'Live'
  }
  const countDashboardRecordsByMonth = (records = [], dateKeys = []) => {
    const currentYear = new Date().getFullYear()
    const monthlyCounts = Array.from({ length: 12 }, () => 0)

    records.forEach((record) => {
      const resolvedKey = dateKeys.find((key) => String(record?.[key] || '').trim())
      const rawValue = resolvedKey ? record?.[resolvedKey] : ''
      const parsedDate = new Date(String(rawValue || ''))
      if (Number.isNaN(parsedDate.getTime()) || parsedDate.getFullYear() !== currentYear) return
      monthlyCounts[parsedDate.getMonth()] += 1
    })

    return monthlyCounts
  }
  const buildDashboardSmoothLinePath = (points = []) => {
    if (!Array.isArray(points) || !points.length) return ''
    if (points.length === 1) {
      return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
    }

    let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
    for (let index = 0; index < points.length - 1; index += 1) {
      const currentPoint = points[index]
      const nextPoint = points[index + 1]
      const controlX = currentPoint.x + ((nextPoint.x - currentPoint.x) / 2)
      path += ` C ${controlX.toFixed(2)} ${currentPoint.y.toFixed(2)}, ${controlX.toFixed(2)} ${nextPoint.y.toFixed(2)}, ${nextPoint.x.toFixed(2)} ${nextPoint.y.toFixed(2)}`
    }

    return path
  }
  const buildDashboardAreaPath = (points = [], chartHeight = 0) => {
    if (!points.length || chartHeight <= 0) return ''
    const linePath = buildDashboardSmoothLinePath(points)
    const firstPoint = points[0]
    const lastPoint = points[points.length - 1]
    return `${linePath} L ${lastPoint.x.toFixed(2)} ${chartHeight.toFixed(2)} L ${firstPoint.x.toFixed(2)} ${chartHeight.toFixed(2)} Z`
  }
  const calculateDashboardGrowth = (current, previous) => {
    const safeCurrent = Number(current) || 0
    const safePrevious = Number(previous) || 0
    if (safePrevious <= 0) {
      return {
        value: safeCurrent > 0 ? 100 : 0,
        isNew: safeCurrent > 0,
        trend: safeCurrent > 0 ? 'up' : 'steady',
      }
    }

    const value = Math.round(((safeCurrent - safePrevious) / safePrevious) * 100)
    return {
      value,
      isNew: false,
      trend: value > 0 ? 'up' : value < 0 ? 'down' : 'steady',
    }
  }
  const formatDashboardGrowthLabel = (growth) => {
    if (growth.isNew) return 'New activity'
    if (growth.value > 0) return `+${growth.value}%`
    if (growth.value < 0) return `${growth.value}%`
    return 'No change'
  }
  const dashboardJobTrendSeries = computed(() =>
    countDashboardRecordsByMonth(postedJobs.value, ['createdAt', 'updatedAt']),
  )
  const dashboardApplicantTrendSeries = computed(() =>
    countDashboardRecordsByMonth(businessJobApplications.value, ['appliedAt', 'createdAt', 'submittedAt']),
  )
  const businessTrendChart = computed(() => {
    const currentYear = new Date().getFullYear()
    const currentMonthIndex = new Date().getMonth()
    const months = dashboardTrendMonths.map((label, index) => {
      const jobs = dashboardJobTrendSeries.value[index] || 0
      const applicants = dashboardApplicantTrendSeries.value[index] || 0
      return {
        key: `${currentYear}-${String(index + 1).padStart(2, '0')}`,
        label,
        jobs,
        applicants,
        total: jobs + applicants,
      }
    })

    const chartWidth = 600
    const chartHeight = 188
    const maxValue = Math.max(1, ...months.map((month) => Math.max(month.jobs, month.applicants)))
    const stepX = months.length > 1 ? chartWidth / (months.length - 1) : chartWidth
    const toY = (value) => chartHeight - ((value / maxValue) * (chartHeight - 36) + 18)

    const jobPoints = months.map((month, index) => ({
      x: index * stepX,
      y: toY(month.jobs),
      value: month.jobs,
      label: month.label,
      isCurrent: index === currentMonthIndex,
    }))
    const applicantPoints = months.map((month, index) => ({
      x: index * stepX,
      y: toY(month.applicants),
      value: month.applicants,
      label: month.label,
      isCurrent: index === currentMonthIndex,
    }))

    const currentMonth = months[currentMonthIndex] || months[months.length - 1] || {
      label: 'This month',
      jobs: 0,
      applicants: 0,
      total: 0,
    }
    const previousMonth = months[Math.max(currentMonthIndex - 1, 0)] || currentMonth
    const jobGrowth = calculateDashboardGrowth(currentMonth.jobs, previousMonth.jobs)
    const applicantGrowth = calculateDashboardGrowth(currentMonth.applicants, previousMonth.applicants)
    const totalGrowth = calculateDashboardGrowth(currentMonth.total, previousMonth.total)
    const peakMonth = months.reduce((peak, month) => (month.total > peak.total ? month : peak), months[0] || {
      label: 'Jan',
      jobs: 0,
      applicants: 0,
      total: 0,
    })

    return {
      months,
      chartWidth,
      chartHeight,
      jobPath: buildDashboardSmoothLinePath(jobPoints),
      applicantPath: buildDashboardSmoothLinePath(applicantPoints),
      jobAreaPath: buildDashboardAreaPath(jobPoints, chartHeight),
      jobPoints,
      applicantPoints,
      totalJobs: months.reduce((sum, month) => sum + month.jobs, 0),
      totalApplicants: months.reduce((sum, month) => sum + month.applicants, 0),
      callout: {
        label: currentMonth.label,
        value: currentMonth.total,
        copy: `${currentMonth.jobs} jobs and ${currentMonth.applicants} applicants this month`,
      },
      highlightCards: [
        {
          label: 'Jobs This Month',
          value: String(currentMonth.jobs),
          detail: `${formatDashboardGrowthLabel(jobGrowth)} vs ${previousMonth.label}`,
          trend: jobGrowth.trend,
          tone: 'jobs',
        },
        {
          label: 'Applicants This Month',
          value: String(currentMonth.applicants),
          detail: `${formatDashboardGrowthLabel(applicantGrowth)} vs ${previousMonth.label}`,
          trend: applicantGrowth.trend,
          tone: 'applicants',
        },
        {
          label: 'Workspace Momentum',
          value: String(currentMonth.total),
          detail: `${formatDashboardGrowthLabel(totalGrowth)} with peak in ${peakMonth.label}`,
          trend: totalGrowth.trend,
          tone: 'momentum',
        },
      ],
    }
  })
  const dashboardInterviewReadyCount = computed(() =>
    businessJobApplications.value.filter((item) =>
      normalizeUserOverviewValue(item?.status).includes('interview'),
    ).length,
  )
  const dashboardApplicantsUnderReviewCount = computed(() =>
    businessJobApplications.value.filter((item) =>
      ['reviewing', 'under review', 'in_review'].includes(normalizeUserOverviewValue(item?.status)),
    ).length,
  )
  const dashboardPendingApplicantCount = computed(() =>
    businessJobApplications.value.filter((item) => {
      const normalizedStatus = normalizeUserOverviewValue(item?.status || 'applied')
      return ['applied', 'pending', 'reviewing', 'under review', 'in_review'].includes(normalizedStatus)
    }).length,
  )
  const dashboardAssignedAssessmentCount = computed(() =>
    approvedApplicantTemplateAssignments.value.filter((applicant) =>
      normalizeUserOverviewValue(applicant?.assignmentStatus) === 'assigned',
    ).length,
  )
  const dashboardAssignedTrainingCount = computed(() =>
    trainingTemplateAssignments.value.filter((member) =>
      normalizeUserOverviewValue(member?.assignmentStatus) === 'assigned',
    ).length,
  )
  const dashboardHiringCyclePercent = computed(() => {
    const totalApplicants = businessJobApplications.value.length
    if (!totalApplicants) return 0
    const progressedApplicants = dashboardApplicantsUnderReviewCount.value + dashboardInterviewReadyCount.value
    return (progressedApplicants / totalApplicants) * 100
  })
  const dashboardInterviewRatePercent = computed(() => {
    const totalApplicants = businessJobApplications.value.length
    if (!totalApplicants) return 0
    return (dashboardInterviewReadyCount.value / totalApplicants) * 100
  })
  const dashboardWorkspaceHealthPercent = computed(() => {
    const checkpointCount = 5
    const completedCheckpoints = [
      postedJobs.value.length > 0,
      businessJobApplications.value.length > 0,
      workspaceUserDirectory.value.length > 0,
      assessmentTemplateLibrary.value.length > 0 || trainingTemplateLibrary.value.length > 0,
      hasUnlockedBusinessWorkspace.value,
    ].filter(Boolean).length

    return (completedCheckpoints / checkpointCount) * 100
  })
  const dashboardProgressCards = computed(() => [
    {
      label: 'Hiring Cycle',
      value: formatDashboardPercent(dashboardHiringCyclePercent.value),
      stat: `${dashboardApplicantsUnderReviewCount.value + dashboardInterviewReadyCount.value} / ${businessJobApplications.value.length || 0}`,
      copy: `${dashboardApplicantsUnderReviewCount.value + dashboardInterviewReadyCount.value} of ${businessJobApplications.value.length} applicants are already moving through screening.`,
      caption: businessJobApplications.value.length
        ? 'Applicant pipeline progress'
        : 'Waiting for applicants',
      tone: 'emerald',
      ringStyle: buildDashboardRingStyle(dashboardHiringCyclePercent.value, '#198754', '#63c58f'),
    },
    {
      label: 'Interview Rate',
      value: formatDashboardPercent(dashboardInterviewRatePercent.value),
      stat: `${dashboardInterviewReadyCount.value} ready`,
      copy: `${dashboardInterviewReadyCount.value} applicants are already interview-ready in this workspace.`,
      caption: businessJobApplications.value.length
        ? 'Interview-ready pipeline'
        : 'No interview-ready applicants yet',
      tone: 'sky',
      ringStyle: buildDashboardRingStyle(dashboardInterviewRatePercent.value, '#0ea5e9', '#7dd3fc'),
    },
    {
      label: 'Workspace Health',
      value: formatDashboardPercent(dashboardWorkspaceHealthPercent.value),
      copy: `${workspaceUserDirectory.value.length} members, ${postedJobs.value.length} jobs, and ${businessJobApplications.value.length} applications are active in the workspace.`,
      stat: `${workspaceUserDirectory.value.length + postedJobs.value.length + businessJobApplications.value.length} active records`,
      caption: 'Workspace readiness',
      tone: 'violet',
      ringStyle: buildDashboardRingStyle(dashboardWorkspaceHealthPercent.value, '#7c3aed', '#c4b5fd'),
    },
  ])
  const dashboardBarSeries = computed(() => {
    const totalApplicants = businessJobApplications.value.length
    const totalJobs = postedJobs.value.length
    const openJobs = postedJobsSummary.value.openCount
    const reviewCount = dashboardApplicantsUnderReviewCount.value
    const interviewCount = dashboardInterviewReadyCount.value
    const assignedAssessmentCount = dashboardAssignedAssessmentCount.value
    const assignedTrainingCount = dashboardAssignedTrainingCount.value

    return [
      {
        label: 'Job Post',
        value: formatDashboardPercent(totalJobs ? (openJobs / totalJobs) * 100 : 0),
        width: `${clampDashboardPercent(totalJobs ? (openJobs / totalJobs) * 100 : 0)}%`,
        detail: `${openJobs} of ${totalJobs || 0} open`,
        tone: 'emerald',
      },
      {
        label: 'Screening',
        value: formatDashboardPercent(totalApplicants ? (reviewCount / totalApplicants) * 100 : 0),
        width: `${clampDashboardPercent(totalApplicants ? (reviewCount / totalApplicants) * 100 : 0)}%`,
        detail: `${reviewCount} applicants in review`,
        tone: 'amber',
      },
      {
        label: 'Interview',
        value: formatDashboardPercent(totalApplicants ? (interviewCount / totalApplicants) * 100 : 0),
        width: `${clampDashboardPercent(totalApplicants ? (interviewCount / totalApplicants) * 100 : 0)}%`,
        detail: `${interviewCount} interview-ready`,
        tone: 'sky',
      },
      {
        label: 'Assessment',
        value: formatDashboardPercent(totalApplicants ? (assignedAssessmentCount / totalApplicants) * 100 : 0),
        width: `${clampDashboardPercent(totalApplicants ? (assignedAssessmentCount / totalApplicants) * 100 : 0)}%`,
        detail: `${assignedAssessmentCount} assigned templates`,
        tone: 'violet',
      },
      {
        label: 'Training',
        value: formatDashboardPercent(workspaceUserDirectory.value.length ? (assignedTrainingCount / workspaceUserDirectory.value.length) * 100 : 0),
        width: `${clampDashboardPercent(workspaceUserDirectory.value.length ? (assignedTrainingCount / workspaceUserDirectory.value.length) * 100 : 0)}%`,
        detail: `${assignedTrainingCount} members in training`,
        tone: 'teal',
      },
    ]
  })
  const dashboardDonutLegend = computed(() => {
    const sourceItems = [
      { label: 'Team Members', amount: workspaceUserDirectory.value.length, color: '#ef5da8' },
      { label: 'Posted Jobs', amount: postedJobs.value.length, color: '#198754' },
      { label: 'Pending', amount: dashboardPendingApplicantCount.value, color: '#f59e0b' },
      { label: 'Applicant Total', amount: businessJobApplications.value.length, color: '#29b4ff' },
    ]
    const totalAmount = sourceItems.reduce((sum, item) => sum + item.amount, 0)

    return sourceItems.map((item) => ({
      ...item,
      countLabel: `${item.amount} ${item.amount === 1 ? 'item' : 'items'}`,
      value: formatDashboardPercent(totalAmount ? (item.amount / totalAmount) * 100 : 0),
    }))
  })
  const dashboardDonutTotal = computed(() =>
    dashboardDonutLegend.value.reduce((sum, item) => sum + item.amount, 0),
  )
  const dashboardDonutStyle = computed(() => {
    const totalAmount = dashboardDonutTotal.value
    if (!totalAmount) {
      return {
        background: 'conic-gradient(#dbe5dd 0 100%)',
      }
    }

    let startPercent = 0
    const segments = dashboardDonutLegend.value.map((item, index) => {
      const percentage = totalAmount ? ((item.amount / totalAmount) * 100) : 0
      const endPercent = index === dashboardDonutLegend.value.length - 1 ? 100 : startPercent + percentage
      const segment = `${item.color} ${startPercent.toFixed(2)}% ${endPercent.toFixed(2)}%`
      startPercent = endPercent
      return segment
    })

    return {
      background: `conic-gradient(${segments.join(', ')})`,
    }
  })
  const dashboardSyncOverview = computed(() => {
    const jobsState = resolveDashboardSyncState(isPostedJobsLoading.value, postedJobsSyncMessage.value)
    const membersState = resolveDashboardSyncState(isWorkspaceUserDirectoryLoading.value, workspaceUserDirectorySyncMessage.value)
    const applicantsState = currentBusinessAccountIdentity.value ? 'live' : 'syncing'
    const templatesState = currentBusinessAccountIdentity.value ? 'live' : 'syncing'
    const assessmentCount = assessmentTemplateLibrary.value.length
    const trainingCount = trainingTemplateLibrary.value.length
    const items = [
      {
        label: 'Jobs',
        value: String(postedJobs.value.length),
        icon: 'bi bi-briefcase',
        state: jobsState,
        stateLabel: resolveDashboardSyncLabel(jobsState),
      },
      {
        label: 'Applicants',
        value: String(businessJobApplications.value.length),
        icon: 'bi bi-people',
        state: applicantsState,
        stateLabel: resolveDashboardSyncLabel(applicantsState),
      },
      {
        label: 'Members',
        value: String(workspaceUserDirectory.value.length),
        icon: 'bi bi-person-badge',
        state: membersState,
        stateLabel: resolveDashboardSyncLabel(membersState),
      },
      {
        label: 'Templates',
        value: String(assessmentCount + trainingCount),
        icon: 'bi bi-journal-check',
        state: templatesState,
        stateLabel: resolveDashboardSyncLabel(templatesState),
      },
    ]
    const issueMessage = postedJobsSyncMessage.value || workspaceUserDirectorySyncMessage.value
    const hasIssue = items.some((item) => item.state === 'issue')
    const isSyncing = !hasIssue && items.some((item) => item.state === 'syncing')

    return {
      eyebrow: 'Firebase Sync',
      title: hasIssue ? 'Workspace sync needs attention' : isSyncing ? 'Syncing business workspace' : 'Live Firebase workspace',
      copy: hasIssue
        ? issueMessage
        : 'Dashboard numbers update from your Firebase business collections for jobs, applicants, members, and templates.',
      badge: hasIssue ? 'Check Sync' : isSyncing ? 'Syncing' : 'Live',
      items,
    }
  })

  return {
    summaryCards,
    businessTrendChart,
    dashboardProgressCards,
    dashboardBarSeries,
    dashboardDonutLegend,
    dashboardDonutTotal,
    dashboardDonutStyle,
    dashboardSyncOverview,
  }
}

export const createDashboardBindings = (ctx) => computed(() => ({
  businessCategory: ctx.businessCategory.value,
  businessName: ctx.businessName.value,
  currentSection: ctx.currentSection.value,
  hasUnlockedBusinessWorkspace: ctx.hasUnlockedBusinessWorkspace.value,
  dashboardSyncOverview: ctx.dashboardSyncOverview.value,
  dashboardApplicantFeed: ctx.dashboardApplicantFeed.value,
  summaryCards: ctx.summaryCards.value,
  businessTrendChart: ctx.businessTrendChart.value,
  dashboardProgressCards: ctx.dashboardProgressCards.value,
  dashboardBarSeries: ctx.dashboardBarSeries.value,
  dashboardDonutLegend: ctx.dashboardDonutLegend.value,
  dashboardDonutStyle: ctx.dashboardDonutStyle.value,
  dashboardDonutTotal: ctx.dashboardDonutTotal.value,
}))
