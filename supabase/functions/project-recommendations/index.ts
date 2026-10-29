import { recommendProjects, type ProjectIdea } from '../_shared/catalog.ts'
import { generateRecommendationsWithFallback } from '../_shared/ai.ts'
import type { Profile } from '../_shared/makeover.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const maxBodyBytes = 10_000
const allowedBranches = ['CSE', 'IT', 'AI/ML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other']
const allowedExperience = ['Beginner', 'Intermediate', 'Advanced']
const allowedTechnology = ['Python', 'Java', 'C++', 'JavaScript', 'No preference']
const allowedInterests = ['Web development', 'AI', 'ML', 'Computer vision', 'NLP', 'IoT', 'Cybersecurity', 'Data analytics', 'Core engineering']
const allowedTime = ['1 day', '1 week', '1 month']

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
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

function publicProject(project: ProjectIdea, tailoring?: { summary: string; roadmap: string[] }) {
  return {
    id: project.id,
    title: project.title,
    problem: project.problem,
    outcome: project.outcome,
    technologies: project.technologies,
    difficulty: project.difficulty,
    time: project.time,
    interests: project.interests,
    roles: project.roles,
    skills: project.skills,
    roadmap: tailoring?.roadmap || project.roadmap,
    ...(tailoring ? { tailoredSummary: tailoring.summary } : {}),
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405)
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > maxBodyBytes) return json({ error: 'REQUEST_TOO_LARGE' }, 413)
  let body: Record<string, unknown>
  try { body = JSON.parse(await readBody(request)) }
  catch (error) {
    return error instanceof Error && error.message === 'REQUEST_TOO_LARGE'
      ? json({ error: 'REQUEST_TOO_LARGE' }, 413)
      : json({ error: 'INVALID_JSON' }, 400)
  }
  const role = typeof body.targetRole === 'string' ? body.targetRole.trim() : ''
  if (!role || role.length > 100 || !validProfile(body.profile)) return json({ error: 'INVALID_REQUEST' }, 422)

  const profile = body.profile
  const shortlist = recommendProjects(profile, role)
  const tailored = await generateRecommendationsWithFallback(role, profile, shortlist)
  const recommendations = shortlist.map((project, index) => publicProject(project, tailored?.recommendations[index]))
  return json({
    recommendations,
    provider: tailored?.provider || 'catalogue',
    providerNote: tailored
      ? `${tailored.provider === 'gemini' ? 'Gemini' : 'Groq'} tailored the summaries and roadmaps; catalogue projects were preserved.`
      : 'Curated catalogue matches; no valid AI provider result was available.',
  })
})
