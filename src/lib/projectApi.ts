import type { Profile } from '../types'
import type { Makeover } from './makeover'

export class ProjectApiError extends Error {
  constructor(public code: string, message?: string) { super(message || code); this.name = 'ProjectApiError' }
}

export function isValidGitHubRepoUrl(value: string): boolean {
  try {
    const url = new URL(value)
    const parts = url.pathname.split('/').filter(Boolean)
    return url.protocol === 'https:' && url.hostname === 'github.com' && !url.username && !url.password && !url.port
      && parts.length === 2 && /^[A-Za-z0-9-]{1,39}$/.test(parts[0]) && /^[A-Za-z0-9_.-]{1,100}$/.test(parts[1].replace(/\.git$/i, ''))
  } catch { return false }
}

export function hasProjectFunctionConfig(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

export async function fetchGitHubMakeover(repoUrl: string, projectText: string, profile: Profile): Promise<Makeover> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) throw new ProjectApiError('SERVER_FUNCTION_NOT_CONFIGURED')
  let response: Response
  try {
    response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/project-makeover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      body: JSON.stringify({ repoUrl, projectText, profile }),
    })
  } catch { throw new ProjectApiError('FUNCTION_UNAVAILABLE') }
  const result = await response.json().catch(() => ({})) as { error?: string; makeover?: Makeover }
  if (!response.ok || !result.makeover) throw new ProjectApiError(result.error || 'FUNCTION_UNAVAILABLE')
  return result.makeover
}
