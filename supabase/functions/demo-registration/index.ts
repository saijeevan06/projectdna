const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const campaignId = Deno.env.get('CAMPAIGN_ID') || 'project-dna-workshop-2026'
const maxBodyBytes = 10_000
const events = new Set(['landing', 'path_start', 'result', 'workshop_cta_click', 'registration_form_start'])
const branches = new Set(['CSE', 'IT', 'AI/ML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other'])

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

async function readBody(request: Request): Promise<string> {
  const reader = request.body?.getReader()
  if (!reader) return ''
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBodyBytes) { await reader.cancel(); throw new Error('REQUEST_TOO_LARGE') }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return new TextDecoder().decode(bytes)
}

function validSource(value: unknown): string {
  if (typeof value !== 'string') return 'direct_unknown'
  const cleaned = value.trim().replace(/[^A-Za-z0-9_.-]/g, '_').slice(0, 80)
  return cleaned || 'direct_unknown'
}

function validSessionId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function databaseRpc(name: string, args: Record<string, unknown>) {
  const projectUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!projectUrl || !serviceKey) throw new Error('DATABASE_NOT_CONFIGURED')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 7000)
  try {
    const response = await fetch(`${projectUrl.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error('DATABASE_WRITE_FAILED')
    const text = await response.text()
    return text ? JSON.parse(text) : null
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_WRITE_FAILED') throw error
    throw new Error('DATABASE_WRITE_FAILED')
  } finally { clearTimeout(timer) }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405)
  if (Number(request.headers.get('content-length') || 0) > maxBodyBytes) return json({ error: 'REQUEST_TOO_LARGE' }, 413)
  let body: Record<string, unknown>
  try { body = JSON.parse(await readBody(request)) }
  catch (error) {
    return error instanceof Error && error.message === 'REQUEST_TOO_LARGE'
      ? json({ error: 'REQUEST_TOO_LARGE' }, 413)
      : json({ error: 'INVALID_JSON' }, 400)
  }
  if (!validSessionId(body.sessionId)) return json({ error: 'INVALID_SESSION' }, 422)
  const source = validSource(body.source)
  const path = body.path === 'improve' || body.path === 'discover' || body.path === 'unknown' ? body.path : 'unknown'

  if (typeof body.referralProgressCode === 'string') {
    const code = body.referralProgressCode.trim().toUpperCase()
    if (!/^[A-Z0-9]{12}$/.test(code)) return json({ referralCount: 0 })
    try {
      const count = await databaseRpc('get_referral_progress', { p_code: code, p_campaign_id: campaignId })
      return json({ referralCount: typeof count === 'number' ? count : 0 })
    } catch { return json({ error: 'REFERRAL_PROGRESS_UNAVAILABLE' }, 503) }
  }

  if (typeof body.eventName === 'string') {
    if (!events.has(body.eventName)) return json({ error: 'INVALID_EVENT' }, 422)
    try {
      await databaseRpc('record_project_event', { p_campaign_id: campaignId, p_session_id: body.sessionId, p_event_name: body.eventName, p_source: source, p_path: path })
      return json({ tracked: true })
    } catch { return json({ error: 'EVENT_STORE_UNAVAILABLE' }, 503) }
  }

  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const college = typeof body.college === 'string' ? body.college.trim() : ''
  const userType = body.userType
  const student = userType === 'student'
  const branch = student && typeof body.branch === 'string' && branches.has(body.branch) ? body.branch : null
  const finalYear = student && typeof body.finalYearEngineering === 'boolean' ? body.finalYearEngineering : null
  const selectedProject = typeof body.selectedProject === 'string' ? body.selectedProject.trim() : ''
  const referralCode = typeof body.referralCode === 'string' && /^[A-Za-z0-9]{12}$/.test(body.referralCode.trim()) ? body.referralCode.trim().toUpperCase() : null
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (fullName.length < 2 || fullName.length > 120 || !emailPattern.test(email) || email.length > 254
    || college.length < 2 || college.length > 180 || (!student && userType !== 'developer')
    || (student && (!branch || finalYear === null)) || selectedProject.length > 140 || body.consent !== true
    || !['improve', 'discover', 'unknown'].includes(path)) return json({ error: 'INVALID_REGISTRATION' }, 422)

  try {
    const status = await databaseRpc('register_demo_registration', {
      p_campaign_id: campaignId,
      p_full_name: fullName,
      p_email: email,
      p_college: college,
      p_user_type: userType,
      p_branch: branch,
      p_final_year_engineering: finalYear,
      p_selected_project: selectedProject,
      p_source: source,
      p_path: path,
      p_session_id: body.sessionId,
      p_consent: true,
      p_referral_code: referralCode,
    })
    if (!status || typeof status !== 'object' || !['saved', 'duplicate'].includes(String(status.status))) return json({ error: 'REGISTRATION_SAVE_FAILED' }, 503)
    return json({
      status: status.status,
      officialRegistration: false,
      mode: 'demo',
      referralCode: typeof status.referralCode === 'string' ? status.referralCode : '',
      referralCount: Number(status.referralCount) || 0,
      referralAttributed: status.referralAttributed === true,
    })
  } catch { return json({ error: 'REGISTRATION_SAVE_FAILED' }, 503) }
})
