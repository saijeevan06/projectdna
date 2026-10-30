import { hasProjectFunctionConfig } from './projectApi'

export type RegistrationPath = 'improve' | 'discover' | 'unknown'
export type RegistrationDraft = {
  fullName: string
  email: string
  college: string
  userType: 'student' | 'developer'
  branch: string | null
  academicYear: string | null
  finalYearEngineering: boolean | null
  selectedProject: string
  consent: boolean
  path: RegistrationPath
  referralCode: string | null
}
export type DemoRegistrationStatus = 'saved' | 'duplicate'
export type DemoRegistrationResult = {
  status: DemoRegistrationStatus
  referralCode: string
  referralCount: number
  referralAttributed: boolean
}

function sessionId(): string {
  try {
    const stored = sessionStorage.getItem('project-dna-session')
    if (stored) return stored
    const created = crypto.randomUUID()
    sessionStorage.setItem('project-dna-session', created)
    return created
  } catch { return crypto.randomUUID() }
}

function sourceValue(): string {
  try {
    const raw = new URLSearchParams(window.location.search).get('utm_source') || ''
    return raw ? raw.replace(/[^A-Za-z0-9_.-]/g, '_').slice(0, 80) || 'direct_unknown' : 'direct_unknown'
  } catch { return 'direct_unknown' }
}

async function post(payload: Record<string, unknown>, keepalive = false): Promise<Response> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!hasProjectFunctionConfig() || !supabaseUrl || !anonKey) throw new Error('SUPABASE_NOT_CONFIGURED')
  return fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/demo-registration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    body: JSON.stringify({ ...payload, source: sourceValue(), sessionId: sessionId() }),
    keepalive,
  })
}

export async function trackProjectEvent(eventName: 'landing' | 'path_start' | 'result' | 'workshop_cta_click' | 'registration_form_start', path: RegistrationPath | 'unknown' = 'unknown'): Promise<void> {
  try {
    const response = await post({ eventName, path }, true)
    if (!response.ok) return
  } catch { /* Analytics must never block the project flow. */ }
}

export async function saveDemoRegistration(draft: RegistrationDraft): Promise<DemoRegistrationResult> {
  let response: Response
  try { response = await post({ ...draft, referralCode: incomingReferralCode() } as unknown as Record<string, unknown>) }
  catch { throw new Error('REGISTRATION_SERVICE_UNAVAILABLE') }
  const payload = await response.json().catch(() => ({})) as { status?: DemoRegistrationStatus; error?: string; referralCode?: string; referralCount?: number; referralAttributed?: boolean }
  if (!response.ok) throw new Error(payload.error || 'REGISTRATION_SAVE_FAILED')
  if ((payload.status !== 'saved' && payload.status !== 'duplicate') || typeof payload.referralCode !== 'string') throw new Error('REGISTRATION_SAVE_FAILED')
  try { localStorage.setItem('project-dna-own-referral', payload.referralCode) } catch { /* This code is non-sensitive and can be copied from the confirmation. */ }
  return { status: payload.status, referralCode: payload.referralCode, referralCount: Number(payload.referralCount) || 0, referralAttributed: payload.referralAttributed === true }
}

function incomingReferralCode(): string | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('ref')?.trim().toUpperCase() || ''
    if (/^[A-Z0-9]{12}$/.test(fromUrl)) {
      sessionStorage.setItem('project-dna-incoming-referral', fromUrl)
      return fromUrl
    }
    const saved = sessionStorage.getItem('project-dna-incoming-referral') || ''
    return /^[A-Z0-9]{12}$/.test(saved) ? saved : null
  } catch { return null }
}

export async function fetchReferralProgress(code: string): Promise<number> {
  if (!/^[A-Z0-9]{12}$/.test(code)) return 0
  const response = await post({ referralProgressCode: code })
  const payload = await response.json().catch(() => ({})) as { referralCount?: number }
  if (!response.ok) throw new Error('REFERRAL_PROGRESS_UNAVAILABLE')
  return Math.max(0, Math.min(3, Number(payload.referralCount) || 0))
}

