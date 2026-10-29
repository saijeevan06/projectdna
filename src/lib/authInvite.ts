export type InviteRedirect =
  | { kind: 'invite'; accessToken: string }
  | { kind: 'error'; code: string }
  | null

export function readInviteRedirect(hash: string): InviteRedirect {
  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
  const errorCode = params.get('error_code')
  if (errorCode) return { kind: 'error', code: errorCode }

  const accessToken = params.get('access_token')
  if (params.get('type') === 'invite' && accessToken) return { kind: 'invite', accessToken }
  return null
}

export function clearAuthRedirectHash(): void {
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
}

export async function setInvitedUserPassword(accessToken: string, password: string): Promise<void> {
  const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) throw new Error('SUPABASE_NOT_CONFIGURED')

  const response = await fetch(`${url}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  })

  if (!response.ok) throw new Error('INVITE_PASSWORD_UPDATE_FAILED')
}
