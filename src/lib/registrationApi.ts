import { hasProjectFunctionConfig } from './projectApi'

export type RegistrationPath = 'improve' | 'discover' | 'unknown'
export type RegistrationDraft = {
  fullName: string
  email: string
  college: string
  userType: 'student' | 'developer'
  branch: string | null
  finalYearEngineering: boolean | null
  selectedProject: string
  consent: boolean
  path: RegistrationPath
}
export type DemoRegistrationStatus = 'saved' | 'duplicate'

export function getWorkshopUrl(): string {
  const value = import.meta.env.VITE_WORKSHOP_URL?.trim() || ''
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : ''
  } catch { return '' }
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

export async function saveDemoRegistration(draft: RegistrationDraft): Promise<DemoRegistrationStatus> {
  let response: Response
  try { response = await post(draft as unknown as Record<string, unknown>) }
  catch { throw new Error('REGISTRATION_SERVICE_UNAVAILABLE') }
  const payload = await response.json().catch(() => ({})) as { status?: DemoRegistrationStatus; error?: string }
  if (!response.ok) throw new Error(payload.error || 'REGISTRATION_SAVE_FAILED')
  if (payload.status !== 'saved' && payload.status !== 'duplicate') throw new Error('REGISTRATION_SAVE_FAILED')
  return payload.status
}

