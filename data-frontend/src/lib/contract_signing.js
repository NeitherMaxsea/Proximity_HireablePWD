import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { auth, cloudFunctions, db } from '@/firebase'

export const CONTRACT_SIGNING_COLLECTION = 'contract_signing'

const text = (value) => String(value || '').trim()
const normalizeEmail = (value) => String(value || '').trim().toLowerCase()
const nowIso = () => new Date().toISOString()
const timestampText = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  if (value instanceof Date) return value.toISOString()
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000).toISOString()
  return text(value)
}
const stripUndefined = (value) => {
  if (Array.isArray(value)) return value.map(stripUndefined)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, stripUndefined(entry)]),
  )
}
const waitForAuthReady = () =>
  typeof auth.authStateReady === 'function' ? auth.authStateReady() : Promise.resolve()
const uniqueTextValues = (values = []) => [...new Set(values.map((value) => text(value)).filter(Boolean))]
const uniqueEmailValues = (values = []) => [...new Set(values.map((value) => normalizeEmail(value)).filter(Boolean))]
const resolveAuthorizedUserIds = (fallbackValues = []) =>
  uniqueTextValues([text(auth.currentUser?.uid), ...fallbackValues])
const resolveAuthorizedEmails = (fallbackValues = []) =>
  uniqueEmailValues([normalizeEmail(auth.currentUser?.email), ...fallbackValues])
const parseContractActivityTime = (record = {}) =>
  Math.max(
    Date.parse(String(record?.updatedAt || record?.updated_at || '').trim()) || 0,
    Date.parse(String(record?.businessSignedAt || record?.business_signed_at || '').trim()) || 0,
    Date.parse(String(record?.applicantSignedAt || record?.applicant_signed_at || '').trim()) || 0,
    Date.parse(String(record?.sentAt || record?.sent_at || '').trim()) || 0,
    Date.parse(String(record?.createdAt || record?.created_at || '').trim()) || 0,
  )
const sortContractRows = (rows = []) =>
  [...rows].sort((left, right) => parseContractActivityTime(right) - parseContractActivityTime(left))

const buildContractId = ({ workspaceOwnerId, applicationId }) => {
  const normalizedWorkspaceOwnerId = text(workspaceOwnerId).replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()
  const normalizedApplicationId = text(applicationId).replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()
  return `${normalizedWorkspaceOwnerId}__${normalizedApplicationId}`
}

export const normalizeContractSigningRecord = (record = {}) => ({
  id: text(record.id),
  workspaceOwnerId: text(record.workspaceOwnerId || record.workspace_owner_id),
  workspaceOwnerName: text(record.workspaceOwnerName || record.workspace_owner_name || record.businessName || record.business_name),
  workspaceOwnerEmail: normalizeEmail(record.workspaceOwnerEmail || record.workspace_owner_email),
  applicationId: text(record.applicationId || record.application_id),
  applicantId: text(record.applicantId || record.applicant_id),
  applicantName: text(record.applicantName || record.applicant_name),
  applicantEmail: normalizeEmail(record.applicantEmail || record.applicant_email),
  jobId: text(record.jobId || record.job_id),
  jobTitle: text(record.jobTitle || record.job_title),
  companyName: text(record.companyName || record.company_name || record.businessName || record.business_name),
  businessName: text(record.businessName || record.business_name || record.companyName || record.company_name),
  status: text(record.status || 'sent') || 'sent',
  contractTitle: text(record.contractTitle || record.contract_title || 'Employment Contract') || 'Employment Contract',
  contractBody: text(record.contractBody || record.contract_body),
  salaryOffer: text(record.salaryOffer || record.salary_offer),
  employmentType: text(record.employmentType || record.employment_type),
  startDate: text(record.startDate || record.start_date),
  notes: text(record.notes),
  sentAt: timestampText(record.sentAt || record.sent_at),
  applicantViewedAt: timestampText(record.applicantViewedAt || record.applicant_viewed_at),
  applicantSignatureName: text(record.applicantSignatureName || record.applicant_signature_name),
  applicantSignatureDataUrl: text(record.applicantSignatureDataUrl || record.applicant_signature_data_url),
  applicantSignedAt: timestampText(record.applicantSignedAt || record.applicant_signed_at),
  applicantConsentAccepted: record.applicantConsentAccepted === true || record.applicant_consent_accepted === true,
  businessSignatureName: text(record.businessSignatureName || record.business_signature_name),
  businessSignatureDataUrl: text(record.businessSignatureDataUrl || record.business_signature_data_url),
  businessSignedAt: timestampText(record.businessSignedAt || record.business_signed_at),
  signatureProvider: text(record.signatureProvider || record.signature_provider),
  signatureMode: text(record.signatureMode || record.signature_mode),
  providerEnvelopeId: text(record.providerEnvelopeId || record.provider_envelope_id),
  providerStatus: text(record.providerStatus || record.provider_status),
  providerApplicantStatus: text(record.providerApplicantStatus || record.provider_applicant_status),
  providerBusinessStatus: text(record.providerBusinessStatus || record.provider_business_status),
  providerLastSyncedAt: timestampText(record.providerLastSyncedAt || record.provider_last_synced_at),
  completedAt: timestampText(record.completedAt || record.completed_at),
  createdAt: timestampText(record.createdAt || record.created_at),
  updatedAt: timestampText(record.updatedAt || record.updated_at),
})

const buildContractPayload = (record = {}, { includeCompletion = true } = {}) => {
  const normalized = normalizeContractSigningRecord(record)
  const completedAt = includeCompletion
    ? normalized.completedAt || (normalized.status === 'completed' ? nowIso() : '')
    : normalized.completedAt

  return stripUndefined({
    workspace_owner_id: normalized.workspaceOwnerId,
    workspace_owner_name: normalized.workspaceOwnerName,
    workspace_owner_email: normalized.workspaceOwnerEmail,
    application_id: normalized.applicationId,
    applicant_id: normalized.applicantId,
    applicant_name: normalized.applicantName,
    applicant_email: normalized.applicantEmail,
    job_id: normalized.jobId,
    job_title: normalized.jobTitle,
    company_name: normalized.companyName,
    business_name: normalized.businessName,
    status: normalized.status,
    contract_title: normalized.contractTitle,
    contract_body: normalized.contractBody,
    salary_offer: normalized.salaryOffer,
    employment_type: normalized.employmentType,
    start_date: normalized.startDate,
    notes: normalized.notes,
    sent_at: normalized.sentAt,
    applicant_viewed_at: normalized.applicantViewedAt,
    applicant_signature_name: normalized.applicantSignatureName,
    applicant_signature_data_url: normalized.applicantSignatureDataUrl,
    applicant_signed_at: normalized.applicantSignedAt,
    applicant_consent_accepted: normalized.applicantConsentAccepted,
    business_signature_name: normalized.businessSignatureName,
    business_signature_data_url: normalized.businessSignatureDataUrl,
    business_signed_at: normalized.businessSignedAt,
    signature_provider: normalized.signatureProvider,
    signature_mode: normalized.signatureMode,
    provider_envelope_id: normalized.providerEnvelopeId,
    provider_status: normalized.providerStatus,
    provider_applicant_status: normalized.providerApplicantStatus,
    provider_business_status: normalized.providerBusinessStatus,
    provider_last_synced_at: normalized.providerLastSyncedAt || undefined,
    completed_at: completedAt || undefined,
    created_at: normalized.createdAt || nowIso(),
    created_at_server: normalized.createdAt ? undefined : serverTimestamp(),
    updated_at: nowIso(),
    updated_at_server: serverTimestamp(),
  })
}

export const saveBusinessContractRecord = async (payload = {}) => {
  await waitForAuthReady()

  const normalized = normalizeContractSigningRecord({
    ...payload,
    workspaceOwnerId: payload?.workspaceOwnerId || payload?.workspace_owner_id || auth.currentUser?.uid,
    workspaceOwnerEmail: payload?.workspaceOwnerEmail || payload?.workspace_owner_email || auth.currentUser?.email,
  })

  if (!normalized.workspaceOwnerId || !normalized.applicationId || !normalized.applicantId || !normalized.jobId) {
    throw new Error('Missing business, application, applicant, or job details for the contract.')
  }

  const documentId = text(payload.id) || buildContractId(normalized)
  const docRef = doc(db, CONTRACT_SIGNING_COLLECTION, documentId)
  const nextStatus = normalized.status || 'sent'
  const nextSentAt = normalized.sentAt || nowIso()

  await setDoc(docRef, buildContractPayload({
    ...normalized,
    id: documentId,
    status: nextStatus,
    sentAt: nextSentAt,
  }), { merge: true })

  return {
    ...normalized,
    id: documentId,
    status: nextStatus,
    sentAt: nextSentAt,
  }
}

export const markApplicantContractViewed = async (contractId) => {
  await waitForAuthReady()

  const normalizedContractId = text(contractId)
  if (!normalizedContractId) return null

  const viewedAt = nowIso()
  await setDoc(doc(db, CONTRACT_SIGNING_COLLECTION, normalizedContractId), {
    applicant_viewed_at: viewedAt,
    updated_at: viewedAt,
    updated_at_server: serverTimestamp(),
  }, { merge: true })

  return viewedAt
}

export const signApplicantContractRecord = async (contractId, payload = {}) => {
  await waitForAuthReady()

  const normalizedContractId = text(contractId)
  const applicantSignatureName = text(payload?.applicantSignatureName || payload?.applicant_signature_name)
  const applicantSignatureDataUrl = text(payload?.applicantSignatureDataUrl || payload?.applicant_signature_data_url)
  const applicantConsentAccepted = payload?.applicantConsentAccepted === true || payload?.applicant_consent_accepted === true

  if (!normalizedContractId) {
    throw new Error('Missing contract ID for applicant signing.')
  }
  if (!applicantSignatureName) {
    throw new Error('Enter the applicant signer name before submitting the contract.')
  }
  if (!applicantSignatureDataUrl) {
    throw new Error('Draw the applicant signature before submitting the contract.')
  }
  if (!applicantConsentAccepted) {
    throw new Error('Confirm applicant consent before signing the contract.')
  }

  const signedAt = nowIso()
  await setDoc(doc(db, CONTRACT_SIGNING_COLLECTION, normalizedContractId), {
    status: 'applicant_signed',
    applicant_signature_name: applicantSignatureName,
    applicant_signature_data_url: applicantSignatureDataUrl,
    applicant_consent_accepted: true,
    applicant_signed_at: signedAt,
    applicant_viewed_at: text(payload?.applicantViewedAt || payload?.applicant_viewed_at) || signedAt,
    updated_at: signedAt,
    updated_at_server: serverTimestamp(),
  }, { merge: true })

  return {
    id: normalizedContractId,
    status: 'applicant_signed',
    applicantSignatureName,
    applicantSignatureDataUrl,
    applicantSignedAt: signedAt,
  }
}

export const signBusinessContractRecord = async (contractId, payload = {}) => {
  await waitForAuthReady()

  const normalizedContractId = text(contractId)
  const businessSignatureName = text(payload?.businessSignatureName || payload?.business_signature_name)
  const businessSignatureDataUrl = text(payload?.businessSignatureDataUrl || payload?.business_signature_data_url)

  if (!normalizedContractId) {
    throw new Error('Missing contract ID for business signing.')
  }
  if (!businessSignatureName) {
    throw new Error('Enter the business signer name before completing the contract.')
  }
  if (!businessSignatureDataUrl) {
    throw new Error('Draw the business signature before completing the contract.')
  }

  const signedAt = nowIso()
  await setDoc(doc(db, CONTRACT_SIGNING_COLLECTION, normalizedContractId), {
    status: 'completed',
    business_signature_name: businessSignatureName,
    business_signature_data_url: businessSignatureDataUrl,
    business_signed_at: signedAt,
    completed_at: signedAt,
    updated_at: signedAt,
    updated_at_server: serverTimestamp(),
  }, { merge: true })

  return {
    id: normalizedContractId,
    status: 'completed',
    businessSignatureName,
    businessSignatureDataUrl,
    businessSignedAt: signedAt,
    completedAt: signedAt,
  }
}

export const createContractSigningProviderSession = async ({ contractId, actorRole, returnUrl } = {}) => {
  await waitForAuthReady()

  const callable = httpsCallable(cloudFunctions, 'createContractSigningProviderSession')
  const response = await callable({
    contractId: text(contractId),
    actorRole: text(actorRole).toLowerCase(),
    returnUrl: text(returnUrl),
  })

  return response?.data || null
}

export const syncContractSigningProviderStatus = async (contractId) => {
  await waitForAuthReady()

  const callable = httpsCallable(cloudFunctions, 'syncContractSigningProviderStatus')
  const response = await callable({
    contractId: text(contractId),
  })

  return response?.data || null
}

export const subscribeToBusinessContracts = (workspaceOwnerOptions, handleNext, handleError) => {
  const options = workspaceOwnerOptions && typeof workspaceOwnerOptions === 'object'
    ? workspaceOwnerOptions
    : { workspaceOwnerId: workspaceOwnerOptions }
  const workspaceOwnerIds = resolveAuthorizedUserIds([
    ...(Array.isArray(options?.workspaceOwnerIds) ? options.workspaceOwnerIds : []),
    options?.workspaceOwnerId,
    options?.ownerId,
  ])
  const workspaceOwnerEmails = resolveAuthorizedEmails([
    ...(Array.isArray(options?.workspaceOwnerEmails) ? options.workspaceOwnerEmails : []),
    options?.workspaceOwnerEmail,
    options?.ownerEmail,
  ])

  if (!workspaceOwnerIds.length && !workspaceOwnerEmails.length) {
    if (typeof handleNext === 'function') handleNext([])
    return () => {}
  }

  const recordsBySource = new Map()
  const stopHandlers = []
  const emitRows = () => {
    const mergedRows = new Map()

    recordsBySource.forEach((sourceRows) => {
      sourceRows.forEach((record, recordId) => {
        const currentRecord = mergedRows.get(recordId)
        if (!currentRecord || parseContractActivityTime(record) >= parseContractActivityTime(currentRecord)) {
          mergedRows.set(recordId, record)
        }
      })
    })

    if (typeof handleNext === 'function') handleNext(sortContractRows([...mergedRows.values()]))
  }
  const syncSnapshot = (sourceKey, snapshot) => {
    const nextRows = new Map()

    snapshot.docs.forEach((entry) => {
      nextRows.set(entry.id, normalizeContractSigningRecord({
        id: entry.id,
        ...entry.data(),
      }))
    })

    recordsBySource.set(sourceKey, nextRows)
    emitRows()
  }

  workspaceOwnerIds.forEach((ownerId) => {
    const sourceKey = `workspace-owner:${ownerId}`
    stopHandlers.push(onSnapshot(
      query(
        collection(db, CONTRACT_SIGNING_COLLECTION),
        where('workspace_owner_id', '==', ownerId),
      ),
      (snapshot) => syncSnapshot(sourceKey, snapshot),
      (error) => {
        if (typeof handleError === 'function') handleError(error)
      },
    ))
  })

  workspaceOwnerEmails.forEach((ownerEmail) => {
    const sourceKey = `workspace-owner-email:${ownerEmail}`
    stopHandlers.push(onSnapshot(
      query(
        collection(db, CONTRACT_SIGNING_COLLECTION),
        where('workspace_owner_email', '==', ownerEmail),
      ),
      (snapshot) => syncSnapshot(sourceKey, snapshot),
      (error) => {
        if (typeof handleError === 'function') handleError(error)
      },
    ))
  })

  return () => {
    stopHandlers.forEach((stop) => {
      if (typeof stop === 'function') stop()
    })
  }
}

export const subscribeToApplicantContracts = (options = {}, handleNext, handleError) => {
  const normalizedApplicantId = text(options?.applicantId)
  const normalizedApplicantEmail = normalizeEmail(options?.applicantEmail)
  const normalizedApplicationIds = uniqueTextValues(Array.isArray(options?.applicationIds) ? options.applicationIds : [])

  if (!normalizedApplicantId && !normalizedApplicantEmail && !normalizedApplicationIds.length) {
    if (typeof handleNext === 'function') handleNext([])
    return () => {}
  }

  const recordsByKey = new Map()
  const emitRecords = () => {
    const mergedRecords = new Map()

    recordsByKey.forEach((record) => {
      const recordKey = text(record?.id) || text(record?.applicationId)
      if (!recordKey) return

      const existingRecord = mergedRecords.get(recordKey)
      if (!existingRecord || parseContractActivityTime(record) >= parseContractActivityTime(existingRecord)) {
        mergedRecords.set(recordKey, record)
      }
    })

    if (typeof handleNext === 'function') handleNext(sortContractRows([...mergedRecords.values()]))
  }

  const syncSnapshot = (sourceKey, snapshot) => {
    const activeKeys = new Set()

    snapshot.docs.forEach((entry) => {
      const record = normalizeContractSigningRecord({
        id: entry.id,
        ...entry.data(),
      })
      const compositeKey = `${sourceKey}:${entry.id}`
      activeKeys.add(compositeKey)
      recordsByKey.set(compositeKey, record)
    })

    for (const key of [...recordsByKey.keys()]) {
      if (key.startsWith(`${sourceKey}:`) && !activeKeys.has(key)) {
        recordsByKey.delete(key)
      }
    }

    emitRecords()
  }

  const stopHandlers = []

  if (normalizedApplicantId) {
    stopHandlers.push(onSnapshot(
      query(collection(db, CONTRACT_SIGNING_COLLECTION), where('applicant_id', '==', normalizedApplicantId)),
      (snapshot) => syncSnapshot('applicant-id', snapshot),
      (error) => {
        if (typeof handleError === 'function') handleError(error)
      },
    ))
  }

  if (normalizedApplicantEmail) {
    stopHandlers.push(onSnapshot(
      query(collection(db, CONTRACT_SIGNING_COLLECTION), where('applicant_email', '==', normalizedApplicantEmail)),
      (snapshot) => syncSnapshot('applicant-email', snapshot),
      (error) => {
        if (typeof handleError === 'function') handleError(error)
      },
    ))
  }

  normalizedApplicationIds.forEach((applicationId) => {
    stopHandlers.push(onSnapshot(
      query(collection(db, CONTRACT_SIGNING_COLLECTION), where('application_id', '==', applicationId)),
      (snapshot) => syncSnapshot(`application-id:${applicationId}`, snapshot),
      (error) => {
        if (typeof handleError === 'function') handleError(error)
      },
    ))
  })

  return () => {
    stopHandlers.forEach((stop) => {
      if (typeof stop === 'function') stop()
    })
  }
}
