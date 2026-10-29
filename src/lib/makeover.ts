import type { Profile } from '../types'

export type Makeover = {
  title: string
  summary: string
  opportunities: string[]
  enhancements: { title: string; detail: string }[]
  technologies: string[]
  difficulty: string
  estimatedTime: string
  roadmap: string[]
  skills: string[]
  resumeBullet: string
  basis: string
  disclaimer: string
  mode: 'template'
}

export function normalizeProjectText(value: string): string {
  return value.replace(/^\uFEFF/, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ').replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, 12000)
}

export function buildMakeover(text: string, profile: Profile, basis: string, fallbackTitle = 'Your project'): Makeover {
  const context = normalizeProjectText(text)
  const heading = context.match(/^#{1,3}\s+(.+)$/m)?.[1]?.trim()
  const title = (heading || fallbackTitle).replace(/[*_`]/g, '').slice(0, 100) || 'Your project'
  const summary = context.split(/\n\s*\n/).map((part) => part.replace(/^#{1,6}\s+/gm, '').replace(/[`*_>#]/g, '').trim()).find((part) => part.length > 35)?.slice(0, 260)
    || 'A project described from the context you shared. Add a clearer problem and intended users as you develop it.'
  const focus = profile.interests[0] || 'Web development'
  const secondFocus = profile.interests.find((item) => item !== focus) || 'Data analytics'
  const tech = profile.technology === 'No preference'
    ? (focus === 'AI' || focus === 'ML' || focus === 'NLP' || focus === 'Computer vision' ? 'Python' : 'JavaScript')
    : profile.technology
  const difficulty = profile.experience === 'Beginner' ? 'Beginner-friendly' : profile.experience === 'Advanced' ? 'Advanced' : 'Intermediate'
  const enhancements = [
    { title: `${focus} feature`, detail: `Prototype one small ${focus.toLowerCase()} capability that supports the project's stated purpose. Treat it as a proposal until you build and validate it.` },
    { title: 'Clear user feedback', detail: 'Add a focused interface state that explains what happened, what the user can do next, and how to recover from an error.' },
    { title: `${secondFocus} insight`, detail: `Explore a lightweight ${secondFocus.toLowerCase()} view or workflow using only data the project is allowed to collect.` },
    { title: 'Responsible AI boundary', detail: 'If you add a model, show its limits, let a person review important outputs, and avoid presenting suggestions as verified facts.' },
  ]
  return {
    title,
    summary,
    opportunities: [
      'This suggestion is based only on the README or description provided; it does not establish which features the code already has.',
      'A useful next step is to define one target user and a simple success measure before expanding scope.',
    ],
    enhancements,
    technologies: [tech, ...(focus === 'AI' || focus === 'ML' || focus === 'NLP' || focus === 'Computer vision' ? ['A small model/API behind a server-side boundary'] : ['A lightweight UI or API layer'])],
    difficulty,
    estimatedTime: profile.time,
    roadmap: [
      'Write down the target user, the problem, and what a successful first version should do.',
      `Build one small ${focus.toLowerCase()} improvement with ${tech}; keep the first version within your ${profile.time.toLowerCase()} time window.`,
      'Try it with sample data, review edge cases, and document what works and what remains uncertain.',
    ],
    skills: [tech, focus, 'Problem framing', 'Responsible feature design'],
    resumeBullet: `Proposed a ${focus.toLowerCase()}-focused extension for ${title}, outlining a ${profile.time.toLowerCase()} implementation plan using ${tech}. Update this bullet only after completing and measuring the work.`,
    basis,
    disclaimer: 'These are proposed ideas based on the material you shared. No source code was inspected, and no suggested feature has been implemented.',
    mode: 'template',
  }
}
