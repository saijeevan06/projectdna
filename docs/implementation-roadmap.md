# Project DNA implementation roadmap

This roadmap translates the supplied PRD, TRD and Feature Specification into build checkpoints. The source documents remain preserved in this folder. After each build, update this roadmap and `build-log.md`, then create a Git checkpoint.

## Product in one sentence

Project DNA gives students and developers role-aware project guidance first, then offers a transparent route to the NxtWave AI workshop, with optional sharing and basic campaign measurement.

## Scope and guardrails

- Two journeys: improve an existing project (Path A) and discover role-aligned projects (Path B).
- Show the main project value before registration.
- Path A reads only bounded public GitHub metadata/README; offer pasted description as a fallback. Never clone, crawl or execute repository code.
- Path B starts from a small curated catalogue; AI tailors explanations when available. Curated output remains available if providers fail.
- Gemini primary, Groq secondary, deterministic templates last. Keys and provider calls stay server-side.
- Workshop CTA click is not a registration. Use demo labels until an approved official URL/integration exists.
- Count only unique, eligible final-year engineering students toward the campaign target; keep demo and non-eligible records separate.
- Referrals are optional and expose aggregate progress only.
- Do not add leaderboard/rewards, full repository analysis, outreach, or complex analytics to the MVP.

## User flow we are building

```text
Landing
  → choose Improve my project OR Find a project
  → path context (GitHub/description OR target role)
  → five shared profile questions
  → review answers
  → project makeover OR three role-aligned recommendations
  → visible workshop CTA
  → approved official handoff OR clearly labelled demo registration
  → optional referral link
  → basic admin funnel/dashboard
```

### The five shared profile questions

1. Branch: CSE, IT, AI/ML, ECE, EEE, Mechanical, Civil or Other.
2. Experience: Beginner, Intermediate or Advanced.
3. Preferred technology: Python, Java, C++, JavaScript or No preference.
4. Interests (multi-select): Web development, AI, ML, Computer vision, NLP, IoT, Cybersecurity, Data analytics or Core engineering.
5. Time available: 1 day, 1 week or 1 month.

Path B retains a separate target-role prompt because recommendations are meant to match the role the user wants. Path A retains project context. These are journey-specific context prompts, not additions to the five shared profile questions.

## Planned phases

| Phase | Build scope | Exit condition | Status |
| --- | --- | --- | --- |
| 0. Scaffold | React/TypeScript/Vite app, route shell, docs, local run and initial screen | App launches and production bundle builds | Complete — Build 01 |
| 1. Student UX | Landing, two paths, project context, shared profile, validation, state retention/back navigation, responsive UI | Both paths capture and review valid context | In progress — Build 02 delivered the core profile/review slice; validation and persistence still need hardening |
| 2. Project results | Curated catalogue, bounded GitHub README retrieval, Gemini → Groq → deterministic fallback, structured result cards | Both paths return useful results with honest basis/fallback labels | In progress — Path B catalogue and template-based Path A makeover shipped in Build 04; Gemini/Groq fallback remains |
| 3. Conversion and referral | Visible CTA, approved official handoff or clearly labelled demo registration, unique email behavior, eligibility distinction, optional referral | Honest confirmation, deduplication and referral attribution | Planned; requires approved destination for real registration claims |
| 4. Growth dashboard | Server-side admin access, eligible/demo separation, daily/source/funnel/referral aggregates | Admin-only metrics match stored records | Planned |
| 5. QA and deployment | Failure handling, mobile review, secrets/config review, deploy and demo setup | P0 journeys can be demonstrated reliably | Planned |
| 6. Submission assets | Growth plan (max 5 slides/2 pages), real AI learning notes, 3-minute demo, reflections | Assessment assets are ready without unsupported claims | Planned |

Sequence follows the 48-hour challenge plan. P1 features (CSV export, recommendation rerun, persistent saved/share page) only follow P0 acceptance.

## Current checkpoint and next build

**Build 04:** Path A accepts a public GitHub URL or pasted project text and returns a clearly labeled template makeover. With a configured Supabase Edge Function, the server validates the URL and reads one bounded README; without it, the UI directs the user to paste context and uses a local template. No AI provider is connected, and inputs remain in browser memory.

**Next:** Build 05 — connect Gemini → Groq → deterministic template fallback behind server-side validation, returning the existing structured makeover shape. Add provider keys only as Supabase secrets. Then continue with registration/CTA, referrals and dashboard.
