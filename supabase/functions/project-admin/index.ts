const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const campaignId = Deno.env.get('CAMPAIGN_ID') || 'project-dna-workshop-2026'
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) }

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405)
  const authorization = request.headers.get('authorization') || ''
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1]
  const projectUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!bearer || !projectUrl || !anonKey || !serviceKey) return json({ error: 'UNAUTHORIZED' }, 401)
  try {
    const userResponse = await fetch(`${projectUrl.replace(/\/$/, '')}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${bearer}` } })
    if (!userResponse.ok) return json({ error: 'UNAUTHORIZED' }, 401)
    const user = await userResponse.json() as { id?: string }
    if (!user.id) return json({ error: 'UNAUTHORIZED' }, 401)
    const metricsResponse = await fetch(`${projectUrl.replace(/\/$/, '')}/rest/v1/rpc/admin_campaign_metrics`, {
      method: 'POST', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_user_id: user.id, p_campaign_id: campaignId }),
    })
    if (!metricsResponse.ok) return json({ error: 'ADMIN_ACCESS_DENIED' }, 403)
    return json({ metrics: await metricsResponse.json() })
  } catch { return json({ error: 'ADMIN_SERVICE_UNAVAILABLE' }, 503) }
})
