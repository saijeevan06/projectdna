import { buildMakeover, normalizeProjectText, type Profile } from '../_shared/makeover.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const maxBodyBytes = 50_000
const maxReadmeBytes = 40_000
const allowedBranches = ['CSE', 'IT', 'AI/ML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other']
const allowedExperience = ['Beginner', 'Intermediate', 'Advanced']
const allowedTechnology = ['Python', 'Java', 'C++', 'JavaScript', 'No preference']
const allowedInterests = ['Web development', 'AI', 'ML', 'Computer vision', 'NLP', 'IoT', 'Cybersecurity', 'Data analytics', 'Core engineering']
const allowedTime = ['1 day', '1 week', '1 month']

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

function parseGitHubUrl(raw: string): { owner: string; repo: string } | null {
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password || url.port) return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length !== 2 || !/^[A-Za-z0-9-]{1,39}$/.test(parts[0]) || !/^[A-Za-z0-9_.-]{1,100}$/.test(parts[1].replace(/\.git$/i, ''))) return null
    return { owner: parts[0], repo: parts[1].replace(/\.git$/i, '') }
  } catch { return null }
}

function validProfile(value: unknown): value is Profile {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return typeof p.branch === 'string' && allowedBranches.includes(p.branch)
    && typeof p.experience === 'string' && allowedExperience.includes(p.experience)
    && typeof p.technology === 'string' && allowedTechnology.includes(p.technology)
    && Array.isArray(p.interests) && p.interests.length > 0 && p.interests.length <= allowedInterests.length
    && p.interests.every((item) => typeof item === 'string' && allowedInterests.includes(item))
    && typeof p.time === 'string' && allowedTime.includes(p.time)
}

async function readLimited(response: Response, cap: number): Promise<string> {
  const reader = response.body?.getReader()
  if (!reader) return ''
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > cap) { await reader.cancel(); throw new Error('README_TOO_LARGE') }
    chunks.push(value)
  }
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

async function readRequestLimited(request: Request, cap: number): Promise<string> {
  const reader = request.body?.getReader()
  if (!reader) return ''
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > cap) { await reader.cancel(); throw new Error('REQUEST_TOO_LARGE') }
    chunks.push(value)
  }
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

async function fetchReadme(owner: string, repo: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 7000)
  try {
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`, {
      headers: { Accept: 'application/vnd.github.raw+json', 'User-Agent': 'Project-DNA-Prototype' },
      signal: controller.signal,
      redirect: 'manual',
    })
    if (response.status >= 300 && response.status < 400) throw new Error('README_UNAVAILABLE')
    if (response.status === 404) throw new Error('REPO_PRIVATE_OR_UNAVAILABLE')
    if (response.status === 403 || response.status === 429) throw new Error('GITHUB_RATE_LIMIT')
    if (!response.ok) throw new Error('README_UNAVAILABLE')
    const text = normalizeProjectText(await readLimited(response, maxReadmeBytes))
    if (!text) throw new Error('README_UNAVAILABLE')
    return text
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('FETCH_TIMEOUT')
    throw error
  } finally { clearTimeout(timer) }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405)
  const declaredLength = Number(request.headers.get('content-length') || 0)
  if (declaredLength > maxBodyBytes) return json({ error: 'REQUEST_TOO_LARGE' }, 413)
  let body: Record<string, unknown>
  try {
    const raw = await readRequestLimited(request, maxBodyBytes)
    body = JSON.parse(raw)
  } catch (error) {
    if (error instanceof Error && error.message === 'REQUEST_TOO_LARGE') return json({ error: 'REQUEST_TOO_LARGE' }, 413)
    return json({ error: 'INVALID_JSON' }, 400)
  }
  if (!validProfile(body.profile)) return json({ error: 'INVALID_PROFILE' }, 422)

  const repoUrl = typeof body.repoUrl === 'string' ? body.repoUrl.trim() : ''
  let context = typeof body.projectText === 'string' ? normalizeProjectText(body.projectText) : ''
  let basis = 'Based on the README/project description you provided.'
  let fallbackTitle = 'Your project'
  if (repoUrl) {
    const parsed = parseGitHubUrl(repoUrl)
    if (!parsed) return json({ error: 'INVALID_GITHUB_URL' }, 422)
    try {
      context = await fetchReadme(parsed.owner, parsed.repo)
      basis = `Based on the public GitHub README for ${parsed.owner}/${parsed.repo}.`
      fallbackTitle = parsed.repo
    } catch (error) {
      const code = error instanceof Error ? error.message : 'README_UNAVAILABLE'
      return json({ error: code }, code === 'FETCH_TIMEOUT' ? 504 : code === 'GITHUB_RATE_LIMIT' ? 429 : 422)
    }
  }
  const userNote = typeof body.projectText === 'string' ? normalizeProjectText(body.projectText) : ''
  if (repoUrl && userNote && context) context = `${context}\n\nUser note: ${userNote}`.slice(0, 12000)
  if (!context) return json({ error: 'EMPTY_CONTEXT' }, 422)
  return json({ makeover: buildMakeover(context, body.profile, basis, fallbackTitle) })
})
