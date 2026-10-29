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
| 1. Student UX | Landing, two paths, project context, shared profile, validation, state retention/back navigation, responsive UI | Both paths capture and review valid context | Core journeys, landing user-type choice and Build 10 visual/motion polish are implemented; refresh persistence and final mobile QA remain |
| 2. Project results | Curated catalogue, bounded GitHub README retrieval, Gemini → Groq → deterministic fallback, structured result cards | Both paths return useful results with honest basis/fallback labels | Code and server-side function deployment complete; Gemini key still needs adding to Supabase Secrets for live AI tailoring. No provider-backed journey verification yet. |
| 3. Conversion and referral | Visible CTA, approved official handoff or clearly labelled demo registration, unique email behavior, eligibility distinction, optional referral | Honest confirmation, deduplication and referral attribution | Schema and function deployed; live registration/referral journey still needs end-to-end verification. Official workshop destination is still missing. |
| 4. Growth dashboard | Server-side admin access, eligible/demo separation, daily/source/funnel/referral aggregates | Admin-only metrics match stored records | Schema and admin function deployed; admin allowlist entry and live sign-in/metrics verification remain. |
| 5. QA and deployment | Failure handling, mobile review, secrets/config review, deploy and demo setup | P0 journeys can be demonstrated reliably | Four functions deployed and active with JWT verification enabled. User will deploy the Vite app to Vercel. Remaining: add Gemini secret, configure production CORS/Auth URLs after receiving the domain, reconcile migration history, authorize admin allowlisting, complete live/mobile/failure checks and abuse/retention controls. |
| 6. Submission assets | Growth plan (max 5 slides/2 pages), real AI learning notes, 3-minute demo, reflections | Assessment assets are ready without unsupported claims | Not started: growth plan, genuine AI learning notes, 3-minute demo and reflections |

Sequence follows the 48-hour challenge plan. P1 features (CSV export, recommendation rerun, persistent saved/share page) only follow P0 acceptance.

## Current checkpoint and next build

**Build 11:** The shared interface now uses forest ink, signal lime and warm paper instead of the prior purple/lilac look. Navigation, CTAs, forms, cards, dashboard and footer use the same palette; focus and hover states remain visible. Build 10 routes and motion effects remain, with reduced-motion support.

**Build 12:** The local app now handles Supabase invite redirects, lets invitees set a password, and shows a recovery message for expired/used links. The app is on port 5173; the screenshot showed a redirect to port 3000.

**Build 13 setup checkpoint:** Supabase Authentication → URL Configuration has Site URL `http://localhost:5173` and Redirect URL `http://localhost:5173/**`, verified in the project dashboard. `.env.local` has non-empty `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` entries and remains ignored by Git. The existing Auth user is confirmed and has signed in, so no replacement invite is needed. Production URL redirects must be added when a deployment domain is chosen.

**Build 14:** Both database migration files have been applied via Supabase SQL Editor. Catalog verification found all five expected tables with RLS enabled and all four expected RPCs. The existing Auth account is confirmed; a replacement invitation was not sent. Dashboard-applied migrations do not automatically reconcile the CLI migration ledger; reconcile versions `202610290001` and `202610290002` as applied before using `supabase db push`.

**Build 15:** Deployed `demo-registration`, `project-admin`, `project-makeover` and `project-recommendations` to Supabase project `alaobrluwmzwtxesgdwl`; Supabase reports all four ACTIVE with `verify_jwt=true`. Set `ALLOWED_ORIGIN=http://localhost:5173` for local testing and `GEMINI_MODEL=gemini-3.8-flash`; the Gemini API key has not yet been added. Supabase CLI access is now active. The user’s production Vercel URL is not in this repository, so production CORS and Auth redirects still need that origin.

**Build 16:** The landing page collects Student/Developer before path entry; results now copy/share a complete text brief; the admin dashboard shows progress toward the 500 eligible-student goal and labels it self-reported/demo data. Production build verification passed with `npm run build`. Vercel deployment steps and required environment variables are documented in the README.

**Build 17 readiness checkpoint:** The user added `GEMINI_API_KEY` in Supabase Secrets. CLI confirms the secret name is configured without reading its value; all four Edge Functions are ACTIVE with JWT verification enabled. `npm run build` passed on 2026-10-29. The local `.env.local` has a non-empty `VITE_WORKSHOP_URL`; add the approved URL to Vercel separately if it is the intended destination. The GitHub repository is synchronized at `main`. The user can now deploy the Vite app to Vercel. Once the production URL exists, configure `ALLOWED_ORIGIN` and Supabase Auth URLs. Migration history reconciliation for `202610290001` and `202610290002` remains unresolved: the CLI lists both as absent remotely, and `migration repair` stalled while initializing the login role. Do not run `supabase db push` until reconciled. Keep frontend variables to the public/anon key; never expose a service-role/secret or Gemini key.

**Next:** User deploys the Vite app to Vercel and shares the resulting production URL. Then set the production origin in Supabase Edge Function configuration, update Supabase Auth Site URL/Redirect URLs, and run live acceptance on both project journeys, registration/referral, and authorized admin metrics. Complete abuse controls, retention/deletion policy and workshop destination confirmation before final submission assets.

## Still to complete

- `.env.local` contains non-empty Supabase URL and anon key values and is ignored by Git; restart Vite so it reloads them. They are enough for current browser calls, but do not deploy database/functions by themselves. Local Auth redirects are configured to port 5173; add deployed Vercel domains before production invites.
- All four Edge Functions are deployed and active with JWT verification enabled. Verify database RPCs and admin metrics against live records. The migrations are applied, but reconcile CLI migration history for versions `202610290001` and `202610290002` before future `db push` use.
- `GEMINI_API_KEY` is configured in Supabase Edge Functions → Secrets; `GEMINI_MODEL=gemini-3.8-flash` is configured. Set `ALLOWED_ORIGIN` to the Vercel production origin after it is known; it currently allows the local app origin. Add `VITE_WORKSHOP_URL` as a Vercel environment variable as well as local config if it is the approved destination. Supabase injects its project URL and keys into hosted functions.
- The user confirmed the Auth invitation, and Supabase reported it sent; the Auth user is visible in the project user list. Add that user UUID to `public.admin_users` only after explicit authorization for this access grant. Hosted Supabase provides project keys to Edge Functions; never put a secret key in frontend env.
- Gemini is configured in Supabase Secrets. Confirm the workshop URL is approved before treating its handoff as official; add the same URL as a Vercel environment variable for the deployed build.
- Add per-user/IP abuse controls and a data retention/deletion process. Validate Edge Function CORS against the deployed domain.
- Student/Developer is collected before path entry. Copyable project briefs and the admin `/500` goal indicator are implemented. Saved result pages and downloadable/image cards remain optional enhancements beyond copy/share text.
- Finish P1 date/source filters and CSV export, recommendation rerun and persistent share pages only if they remain within assessment time.
- Complete live P0 acceptance/failure checks and the assessment outputs (growth plan, real AI learning notes, 3-minute demo and reflection answers).
- The user will deploy the Vite app to Vercel. After deployment, use the production domain to configure Supabase Auth Site URL/redirects and the Edge Function `ALLOWED_ORIGIN`. Required Vercel values are documented in the README.
- The current workshop CTA opens the demo registration dialog unless `VITE_WORKSHOP_URL` is set. No course curriculum/content is in this repository; configure the approved workshop/course URL or provide approved materials before we present an in-site course page.
