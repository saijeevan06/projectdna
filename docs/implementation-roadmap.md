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
| 1. Student UX | Landing, two paths, project context, shared profile, validation, state retention/back navigation, responsive UI | Both paths capture and review valid context | Core journeys and Build 10 landing polish are implemented; user type is collected during demo registration, not upfront; refresh persistence and final mobile QA remain |
| 2. Project results | Curated catalogue, bounded GitHub README retrieval, Gemini → Groq → deterministic fallback, structured result cards | Both paths return useful results with honest basis/fallback labels | Implementation complete — Path B catalogue plus Path A and Path B server-side Gemini/Groq/template paths shipped in Build 06; live provider configuration still needs credentials |
| 3. Conversion and referral | Visible CTA, approved official handoff or clearly labelled demo registration, unique email behavior, eligibility distinction, optional referral | Honest confirmation, deduplication and referral attribution | Implemented for demo records in Build 08; live Supabase validation pending |
| 4. Growth dashboard | Server-side admin access, eligible/demo separation, daily/source/funnel/referral aggregates | Admin-only metrics match stored records | Implemented in Build 08; live Supabase setup and admin allowlisting pending |
| 5. QA and deployment | Failure handling, mobile review, secrets/config review, deploy and demo setup | P0 journeys can be demonstrated reliably | Pending: configure local values, migrate Supabase API-key usage, apply migrations/deploy functions, add abuse and retention controls, then verify against live Supabase |
| 6. Submission assets | Growth plan (max 5 slides/2 pages), real AI learning notes, 3-minute demo, reflections | Assessment assets are ready without unsupported claims | Not started: growth plan, genuine AI learning notes, 3-minute demo and reflections |

Sequence follows the 48-hour challenge plan. P1 features (CSV export, recommendation rerun, persistent saved/share page) only follow P0 acceptance.

## Current checkpoint and next build

**Build 11:** The shared interface now uses forest ink, signal lime and warm paper instead of the prior purple/lilac look. Navigation, CTAs, forms, cards, dashboard and footer use the same palette; focus and hover states remain visible. Build 10 routes and motion effects remain, with reduced-motion support.

**Build 12:** The local app now handles Supabase invite redirects, lets invitees set a password, and shows a recovery message for expired/used links. The app is on port 5173; the screenshot shows a redirect to port 3000. Supabase URL settings have not been changed and the expired invite has not been resent.

**Next:** Build 13 — complete Supabase setup. In Authentication → URL Configuration, set Site URL to `http://localhost:5173` and add `http://localhost:5173/**` to Redirect URLs; send a fresh invite because the old token expired. Then apply migrations, deploy functions and verify live behavior. The CLI install/check did not complete and no Supabase connector is available in this Codex workspace, so hosted database setup remains pending. Add the invited Auth UUID to the admin allowlist after migrations, then migrate to publishable-key auth before switching away from the legacy key.

## Still to complete

- `.env.local` contains the corrected URL and anon key and is ignored by Git; restart Vite so it reloads them. They are enough for current browser calls, but do not deploy database/functions by themselves. Local Auth invitation redirects also require the Site URL and allowlist above.
- Link the Supabase project with its project reference, apply the two SQL migrations, deploy all four functions and verify the database RPCs/admin metrics against live records.
- The user confirmed the Auth invitation, and Supabase reported it sent; the Auth user is visible in the project user list. Add that user UUID to `public.admin_users` after migrations create the table. Hosted Supabase provides the current legacy service-role variable to Edge Functions; never put it in frontend env.
- Add Gemini/Groq secrets only if live AI tailoring is desired. Add the approved workshop URL before representing that path as official; otherwise the CTA correctly remains demo-only.
- Add per-user/IP abuse controls and a data retention/deletion process. Validate Edge Function CORS against the deployed domain.
- Close specification gaps: shareable/downloadable result cards and an admin `/500` goal indicator are not implemented. Student/developer is currently asked during demo registration rather than before choosing a path; decide whether to move it earlier.
- Finish P1 date/source filters and CSV export, recommendation rerun and persistent share pages only if they remain within assessment time.
- Complete live P0 acceptance/failure checks and the assessment outputs (growth plan, real AI learning notes, 3-minute demo and reflection answers).
- The current workshop CTA opens the demo registration dialog unless `VITE_WORKSHOP_URL` is set. No course curriculum/content is in this repository; configure the approved workshop/course URL or provide approved materials before we present an in-site course page.
