# Project DNA

Project DNA helps students and developers take a practical next step with a project. The planned experience has two paths: improve an existing project or discover a project aligned with a target role. Results should be useful before the workshop registration prompt.

## Current checkpoint

**Build 12 — Auth invitation recovery**

- Responsive React + TypeScript + Vite application shell.
- Landing page explains the two starting paths and the free AI workshop.
- Path A captures a GitHub URL or project description; Path B captures a target role.
- Both paths collect five profile answers: branch, experience, preferred technology, interests and available time.
- Path B returns three role/profile-matched catalogue projects with outcomes, technologies, difficulty, skills and a starter roadmap.
- Path A accepts a public GitHub repository or pasted README/description, then returns a Gemini or Groq makeover when configured, with a deterministic template fallback.
- Path B selects three role/profile-matched curated projects; the server can tailor their summaries and roadmaps with Gemini/Groq while preserving catalogue content.
- Path B keeps its local curated-card fallback when the server function or providers are unavailable.
- Result pages offer an optional official workshop handoff or a clearly labeled internal demo registration.
- Demo registration normalizes email, prevents duplicates per campaign and records self-reported student eligibility separately from official registrations.
- Basic funnel events capture landing, path start, results, CTA clicks, registration form starts and saved demo registrations with source/path/session identifiers.
- Demo registrants can optionally share a referral link; valid referrals are counted in aggregate and never required.
- Admins sign in through Supabase Auth and an active-user allowlist to view aggregate demo counts, self-reported eligibility, sources, daily activity, funnel and referral totals. No identities are returned.
- Path B offers selectable role suggestions across software/product, AI/data, infrastructure/security and core engineering, while retaining free-text roles.
- Landing now has section navigation, direct hash routes for both journeys, featured role shortcuts, a moving interest strip, scroll progress, and reduced-motion-aware reveal animations.
- Replaced the generic purple/lilac palette with forest ink, signal lime and warm paper; updated navigation, forms, buttons, result cards, dashboard, modal and footer colors for one visual system.
- Added stronger focus states and contrast on the path cards.
- Added an invitation callback screen that handles Supabase invite redirects, lets the invitee set a password using the short-lived access token, and explains expired or already-used links.
- Users can review/edit answers; profile and project context remain session-scoped and are not saved.
- GitHub retrieval runs only through the Supabase Edge Function. Without Supabase configuration, the preview asks for pasted project text and uses the local deterministic template. The workshop destination remains a placeholder until an approved URL is provided.

## Run locally

```bash
npm install
npm run dev
```

To enable GitHub README retrieval, configure a Supabase project and deploy the Edge Function:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_ID
npx supabase db push
npx supabase functions deploy project-makeover
npx supabase functions deploy project-recommendations
npx supabase functions deploy demo-registration
npx supabase functions deploy project-admin
```

Put the project URL and the legacy JWT-style `anon` key in `.env.local` using [.env.example](.env.example) as a template. This code currently sends the anon key as a bearer token, so do not substitute a new `sb_publishable_...` key until function auth wiring is migrated. Supabase says legacy `anon` and `service_role` keys are being deprecated by the end of 2026; migration is the next backend build. Never add a service-role/secret key or AI provider key to frontend variables. Set `VITE_WORKSHOP_URL` only when an approved official workshop URL is available; without it, the result CTA opens the demo capture flow. Restart Vite after editing `.env.local`.

For local Auth invitations, this Vite app runs at `http://localhost:5173`. In Supabase Authentication → URL Configuration, set the Site URL to `http://localhost:5173` and add `http://localhost:5173/**` to Redirect URLs. The Dashboard invite uses the Site URL by default; a link sent while the Site URL pointed to `localhost:3000` will fail because this app is not listening there. Invite links are one-time and expire according to the project’s email OTP expiry; after fixing the URL, send a fresh invitation.

Hosted Supabase Edge Functions provide `SUPABASE_URL` and the legacy `SUPABASE_SERVICE_ROLE_KEY` at runtime. Do not copy the service-role key into `.env.local` or the browser. To allow dashboard access, create a Supabase Auth user, then add its Auth UUID through the SQL editor:

```sql
insert into public.admin_users (user_id, is_active)
values ('AUTH_USER_UUID', true)
on conflict (user_id) do update set is_active = true;
```

Apply migrations before deploying functions. The referral and admin paths require a live Supabase project and have not been exercised by the local preview.

To enable AI tailoring, add `GEMINI_API_KEY` and/or `GROQ_API_KEY` in the Supabase project's Edge Function secrets. Both paths use Gemini first, then Groq, then deterministic catalogue/template results. Model IDs are configurable with `GEMINI_MODEL` and `GROQ_MODEL`; defaults are `gemini-3.8-flash` and `openai/gpt-oss-120b`. If provider secrets are absent, curated results remain available.

Create a production bundle with `npm run build`.

## Project docs

- [Product requirements](docs/product-requirements.txt)
- [Technical requirements](docs/technical-requirements.txt)
- [Feature specification](docs/feature-specification.txt)
- [Build log and next checkpoint](docs/build-log.md)
- [Implementation roadmap and current flow](docs/implementation-roadmap.md)

## Product boundaries

- No full repository crawling or code execution.
- No provider or database secrets in the browser.
- Demo activity must be labeled and kept separate from verified registrations.
- A CTA click is not a completed registration. Do not claim an official registration without an approved integration or confirmation.
