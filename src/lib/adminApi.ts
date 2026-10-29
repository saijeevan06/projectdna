import { hasProjectFunctionConfig } from './projectApi'

export type AdminMetrics = {
  registrations: { total: number; eligibleSelfReported: number; otherDemo: number }
  sources: { source: string; count: number }[]
  daily: { date: string; count: number }[]
  funnel: Record<string, number>
  referralRegistrations: number
}

function config() {
  const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon || !hasProjectFunctionConfig()) throw new Error('SUPABASE_NOT_CONFIGURED')
  return { url, anon }
}

export async function adminLogin(email: string, password: string): Promise<string> {
  const { url, anon } = config()
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  })
  const result = await response.json().catch(() => ({})) as { access_token?: string }
  if (!response.ok || !result.access_token) throw new Error('ADMIN_LOGIN_FAILED')
  return result.access_token
}

export async function fetchAdminMetrics(token: string): Promise<AdminMetrics> {
  const { url, anon } = config()
  const response = await fetch(`${url}/functions/v1/project-admin`, {
    method: 'POST', headers: { apikey: anon, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'metrics' }),
  })
  const result = await response.json().catch(() => ({})) as { metrics?: AdminMetrics }
  if (!response.ok || !result.metrics) throw new Error('ADMIN_METRICS_FAILED')
  return result.metrics
}
