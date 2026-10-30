# Project DNA

Project DNA helps students and developers take a practical next step with a project. The planned experience has two paths: improve an existing project or discover a project aligned with a target role. Results should be useful before the workshop registration prompt.

## Current checkpoint

**Build 19 — In-app workshop registration and 3-friend referral flow**

- Responsive React + TypeScript + Vite application shell.
- Landing page explains the two starting paths and the free AI workshop.
- Landing first asks whether the visitor is a Student or Developer, then enables the two project paths.
- Path A captures a GitHub URL or project description; Path B captures a target role.
- Both paths collect five profile answers: branch, experience, preferred technology, interests and available time.
- Path B returns three role/profile-matched catalogue projects with outcomes, technologies, difficulty, skills and a starter roadmap.
- Path A accepts a public GitHub repository or pasted README/description, then returns a Gemini or Groq makeover when configured, with a deterministic template fallback.
- Path B selects three role/profile-matched curated projects; the server can tailor their summaries and roadmaps with Gemini/Groq while preserving catalogue content.
- Path B keeps its local curated-card fallback when the server function or providers are unavailable.
- Result-page and footer workshop CTAs open a dedicated in-app registration page; they never redirect to a channel or external URL.
- The registration page collects name, email, college, user type, and (for students) branch, academic year and final-year eligibility, plus explicit workshop-registration confirmation and consent. A successful demo registration opens a prominent 3-friend referral step.
- Both makeover and recommendation results offer a copyable project brief.
- Demo registration normalizes email, prevents duplicates per campaign and records self-reported student eligibility separately from official registrations.
- Basic funnel events capture landing, path start, results, CTA clicks, registration form starts and saved demo registrations with source/path/session identifiers.
- Demo registrants can optionally share a referral link; valid referrals are counted in aggregate and never required.
- Admins sign in through Supabase Auth and an active-user allowlist to view aggregate demo counts, self-reported eligibility, sources, daily activity, funnel and referral totals. No identities are returned.
- The admin view shows progress toward 500 eligible student demo registrations and labels eligibility as self-reported.
- Gemini is configured as the server-side AI provider through the Supabase `GEMINI_API_KEY` secret; no provider key is part of the frontend build.
- Path B offers selectable role suggestions across software/product, AI/data, infrastructure/security and core engineering, while retaining free-text roles.
- Landing now has section navigation, direct hash routes for both journeys, featured role shortcuts, a moving interest strip, scroll progress, and reduced-motion-aware reveal animations.
- Replaced the generic purple/lilac palette with forest ink, signal lime and warm paper; updated navigation, forms, buttons, result cards, dashboard, modal and footer colors for one visual system.
- Added stronger focus states and contrast on the path cards.
- Added an invitation callback screen that handles Supabase invite redirects, lets the invitee set a password using the short-lived access token, and explains expired or already-used links.
- Users can review/edit answers; profile and project context remain session-scoped and are not saved.
- GitHub retrieval runs only through the Supabase Edge Function. Without Supabase configuration, the preview asks for pasted project text and uses the local deterministic template. Workshop registration is recorded in the Project DNA prototype; there is no integration to NxtWave's official enrollment system yet.

## Run locally

```bash
npm install
npm run dev
```

GitHub README retrieval, project generation, demo registration and admin metrics run through four Supabase Edge Functions. They are currently deployed to project `alaobrluwmzwtxesgdwl`. To redeploy after local changes:

```bash
npx supabase@latest functions deploy demo-registration project-admin project-makeover project-recommendations --project-ref alaobrluwmzwtxesgdwl --use-api
```

Keep JWT verification enabled. Supabase CLI authentication is required for deployment. Database migrations were applied through the Dashboard SQL Editor; reconcile their migration history before using `db push`.

Put the project URL and the legacy JWT-style `anon` key in `.env.local` using [.env.example](.env.example) as a template. This code currently sends the anon key as a bearer token, so do not substitute a new `sb_publishable_...` key until function auth wiring is migrated. Supabase says legacy `anon` and `service_role` keys are being deprecated by the end of 2026; migration is the next backend build. Never add a service-role/secret key or AI provider key to frontend variables. Workshop CTAs always open the in-app registration page; the demo record is not an official NxtWave enrollment. Restart Vite after editing `.env.local`.

For local Auth invitations, this Vite app runs at `http://localhost:5173`. In Supabase Authentication → URL Configuration, set the Site URL to `http://localhost:5173` and add `http://localhost:5173/**` to Redirect URLs. The Dashboard invite uses the Site URL by default; a link sent while the Site URL pointed to `localhost:3000` will fail because this app is not listening there. Invite links are one-time and expire according to the project’s email OTP expiry; after fixing the URL, send a fresh invitation.

Hosted Supabase Edge Functions provide `SUPABASE_URL` and the legacy `SUPABASE_SERVICE_ROLE_KEY` at runtime. Do not copy the service-role key into `.env.local` or the browser. To allow dashboard access, create a Supabase Auth user, then add its Auth UUID through the SQL editor:

```sql
insert into public.admin_users (user_id, is_active)
values ('AUTH_USER_UUID', true)
on conflict (user_id) do update set is_active = true;
```

The schema migrations are applied to the live Supabase project, and all four Edge Functions are active with JWT verification enabled. The Gemini API key is configured in Supabase Secrets. Registration and referral now run through an in-app page, and the `academic_year` field is stored by the registration RPC. End-to-end registration/referral/admin journeys still need a live review. The first two migrations, originally applied outside the CLI, are not yet reconciled into CLI migration history; do that before any `supabase db push`.

`GEMINI_API_KEY` is configured as a Supabase Edge Function secret; never place it in `.env.local`, a `VITE_` variable, or the browser. `GEMINI_MODEL` is explicitly set to `gemini-3.8-flash`; it is also the code default. A Groq key is optional fallback configuration. When provider keys are absent or calls fail, curated/template results remain available. A local-only variable-name template is at [supabase/functions/.env.example](supabase/functions/.env.example); copy it to `supabase/functions/.env` only for local Edge Function development and never commit populated secrets.

`ALLOWED_ORIGIN` is currently `http://localhost:5173` for local verification. After Vercel has a production URL, update this Edge Function secret to that exact origin before using the deployed site. `CAMPAIGN_ID` defaults in the function code to `project-dna-workshop-2026`.

### Vercel deployment handoff

The project is a Vite single-page app. Import the repository into Vercel with the Vite preset, build command `npm run build`, and output directory `dist`. Add these environment variables for Production (and Preview if you want preview deployments to call Supabase):

- `VITE_SUPABASE_URL` — the Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` — the legacy JWT-style anon key currently used in the Authorization bearer header.
Do not add `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` or any Supabase secret key to Vercel frontend variables. Workshop CTAs no longer read `VITE_WORKSHOP_URL`; remove any old YouTube value from Vercel settings to avoid confusion. Once Vercel gives you the production domain, set that exact HTTPS origin as the Supabase Edge Function `ALLOWED_ORIGIN` and add the production URL to Supabase Authentication → URL Configuration → Site URL and Redirect URLs. The current allowed origin is local development only.

Create a production bundle with `npm run build`.

## Project docs

- [Product requirements](docs/product-requirements.txt)
- [Technical requirements](docs/technical-requirements.txt)
- [Feature specification](docs/feature-specification.txt)
- [Build log and next checkpoint](docs/build-log.md)
- [Implementation roadmap and current flow](docs/implementation-roadmap.md)
- [Submission pack: tests, AI worklog draft and video script](docs/submission-pack.md)
- [Two-page growth plan PDF](output/pdf/Project-DNA-Growth-Plan.pdf)

## Product boundaries

- No full repository crawling or code execution.
- No provider or database secrets in the browser.
- Demo activity must be labeled and kept separate from verified registrations.
- A CTA click is not a completed registration. Do not claim an official registration without an approved integration or confirmation.
