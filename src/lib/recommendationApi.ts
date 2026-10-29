import type { Profile } from '../types'
import { projectCatalogue } from '../data/projects'
import { hasProjectFunctionConfig } from './projectApi'

export type RecommendationProvider = 'gemini' | 'groq' | 'catalogue'
export type TailoredProject = { id: string; tailoredSummary?: string; roadmap: string[] }
export type RecommendationResult = { provider: RecommendationProvider; providerNote: string; projects: TailoredProject[] }

export async function fetchProjectRecommendations(targetRole: string, profile: Profile): Promise<RecommendationResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!hasProjectFunctionConfig() || !supabaseUrl || !anonKey) throw new Error('SUPABASE_NOT_CONFIGURED')
  let response: Response
  try {
    response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/project-recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      body: JSON.stringify({ targetRole, profile }),
    })
  } catch { throw new Error('FUNCTION_UNAVAILABLE') }
  const payload = await response.json().catch(() => ({})) as {
    error?: string
    provider?: string
    providerNote?: string
    recommendations?: { id?: string; tailoredSummary?: string; roadmap?: string[] }[]
  }
  if (!response.ok || !Array.isArray(payload.recommendations) || payload.recommendations.length !== 3) throw new Error('INVALID_RECOMMENDATIONS')
  if (!['gemini', 'groq', 'catalogue'].includes(String(payload.provider))) throw new Error('INVALID_PROVIDER')
  const projects: TailoredProject[] = []
  for (const candidate of payload.recommendations) {
    if (typeof candidate.id !== 'string' || !projectCatalogue.some((project) => project.id === candidate.id)
      || projects.some((project) => project.id === candidate.id) || !Array.isArray(candidate.roadmap) || candidate.roadmap.length !== 3
      || candidate.roadmap.some((step) => typeof step !== 'string' || step.length > 220)
      || (candidate.tailoredSummary !== undefined && (typeof candidate.tailoredSummary !== 'string' || candidate.tailoredSummary.length > 300))) {
      throw new Error('INVALID_RECOMMENDATIONS')
    }
    projects.push({ id: candidate.id, tailoredSummary: candidate.tailoredSummary, roadmap: candidate.roadmap })
  }
  return { provider: payload.provider as RecommendationProvider, providerNote: payload.providerNote || '', projects }
}
