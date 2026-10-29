# Project DNA build log

Each build checkpoint records shipped behavior, known limits, documentation changes and the next planned slice. The Git commit for each checkpoint is named `checkpoint: build NN - ...`.

## Build 02 — shared profile intake and review

**Status:** Complete
**Scope:** Carry path-specific context into five shared profile questions and let the user review/edit the answers.

### Delivered

- Path A accepts a public GitHub URL or project description; at least one is required to proceed.
- Path B requires a target role.
- Both paths ask five shared questions: branch, experience, preferred technology, interests (multi-select), and time available, with the options supplied by the user.
- Required profile choices are validated in the browser; inputs persist while moving back and forth in the current page session.
- Review summary displays the project context/role plus all five profile answers and allows editing.
- Added [implementation roadmap](implementation-roadmap.md) with the end-to-end flow, scope boundaries, phase plan and current checkpoint.
- Updated README to describe current behavior and known limits.

### Verification

- `npm run build` completed successfully (TypeScript check and Vite production bundle).

### Limits carried forward

- State is in memory only; refresh loses answers and nothing is sent or stored.
- GitHub URL is not fetched, and project recommendations are not generated.
- Workshop destination remains a local placeholder. Registration, referral, analytics, backend and admin dashboard are not implemented.

### Checkpoint

- Git commit: `checkpoint: build 02 - shared profile intake and review`.

### Next build

- Build 03: curated Path B project recommendations matched to target role, time, technology and interests. Keep three recommendations available without AI providers.

## Build 03 — curated Path B recommendations

**Status:** Complete
**Scope:** Use the reviewed Path B profile to return three useful project ideas without depending on an AI service.

### Delivered

- Added a small curated catalogue spanning web, AI/NLP, computer vision, IoT, cybersecurity and analytics.
- Deterministic ranking uses target-role keyword overlap, chosen interests, preferred technology and available time.
- Exactly three recommendations are displayed, including problem, expected outcome, technologies, difficulty/time, skills and a starter roadmap.
- Results identify themselves as curated, so users are not led to believe an AI model or repository analysis produced them.
- Workshop information remains visible on results; no external registration URL has been configured.
- Updated README and implementation roadmap for the delivered Path B scope and next Path A build.

### Verification

- `npm run build` completed successfully (TypeScript check and Vite production bundle).

### Limits carried forward

- Path A remains a brief review only; GitHub retrieval, pasted README normalization and project makeover are not implemented.
- No AI providers, persistence, registration, referral or dashboard are connected.
- Catalogue size is intentionally small; recommendations are rule-ranked, not generated or guaranteed to fit every role.

### Checkpoint

- Git commit: `checkpoint: build 03 - curated Path B recommendations`.

### Next build

- Build 04: Path A bounded GitHub README retrieval with pasted description fallback and honest basis labeling. Keep provider orchestration server-side for the later Gemini/Groq/template fallback slice.

## Build 04 — Path A context and template makeover

**Status:** Complete
**Scope:** Add a safe Path A path from repository/text context to a structured, honestly labeled makeover result.

### Delivered

- HTTPS `github.com/{owner}/{repo}` validation rejects arbitrary hosts, extra path segments, embedded credentials and unsupported schemes before requests.
- Added a Supabase Edge Function that calls only GitHub's fixed README endpoint, does not follow redirects, uses a 7-second timeout, caps the upstream response at 40 KB and normalizes the text to 12,000 characters.
- Edge Function validates the profile and request size, returns typed GitHub errors, and never clones, traverses or executes repository content.
- Added a paste README/description fallback that preserves the profile and accepts up to 12,000 characters.
- Both GitHub and pasted context can produce structured deterministic makeover guidance: summary/basis, proposed opportunities, four enhancement ideas, technology suggestions, difficulty/time, roadmap, skills and a potential resume bullet.
- Results explicitly say that source code was not inspected and proposed features are not implemented. Template mode is visibly identified; AI provider integration remains future work.
- Added `.env.example` and Supabase function configuration. GitHub retrieval requires deployment and `VITE_SUPABASE_URL` plus a public anon/publishable key; local paste mode works without these settings.
- Updated README and implementation roadmap.

### Verification

- `npm run build` completed successfully (TypeScript check and Vite production bundle).
- GitHub API README behavior and Supabase Edge Function deployment flow were checked against their official documentation: [GitHub REST README endpoint](https://docs.github.com/en/rest/repos/contents?apiversion=2022-11-28), [Supabase Edge Function deployment](https://supabase.com/docs/guides/functions/deploy).

### Limits carried forward

- A Supabase project is not configured in this workspace, so GitHub URL retrieval cannot run in the current local preview; the paste fallback and deterministic makeover do work locally.
- The Supabase Edge Function source is not deployed or checked with a local Deno runtime in this workspace; configure a Supabase project and deploy it before demonstrating the GitHub URL path.
- Gemini/Groq, database persistence, registration, referrals, analytics and dashboard are not implemented.
- Function-level abuse rate limiting is still needed before public deployment. The Edge Function uses a strict GitHub host allowlist, request/context caps and timeout, but no per-user database-backed quota yet.

### Checkpoint

- Git commit: `checkpoint: build 04 - Path A context and template makeover`.

### Next build

- Build 05: add the Gemini → Groq → template provider chain behind the Edge Function, with schema validation and bounded provider timeouts. Keep all model credentials in Supabase secrets.

## Build 05 — Gemini/Groq provider chain

**Status:** Complete
**Scope:** Add server-side model tailoring to Path A with bounded failover, strict local validation and an always-available deterministic result.

### Delivered

- Gemini is the primary adapter; Groq is attempted once if Gemini is unavailable or returns a failed/invalid response; deterministic templates are used when neither produces a valid result or no provider keys are configured.
- Gemini uses JSON-schema output; Groq uses JSON mode with the same explicit response shape. Both responses are parsed and validated in the Edge Function for required fields, string lengths, list sizes and difficulty enum before return.
- The server sets `basis`, time estimate, provider identity and disclaimer. The UI labels the actual source as Gemini, Groq or template.
- Prompts treat README/description content as untrusted data and ask for proposals only, no assertions about unseen code, and no fabricated metrics or completed work.
- Each configured provider attempt logs only its name, status, sanitized error class and elapsed time; it does not log keys or project text.
- Provider keys are read from Supabase secrets (`GEMINI_API_KEY`, `GROQ_API_KEY`). Model identifiers are configurable (`GEMINI_MODEL`, `GROQ_MODEL`). No provider key is added to the frontend or repository.
- Pasted Path A context calls the same server function when configured; local preview keeps a deterministic template path.
- Updated README and implementation roadmap.

### Verification

- `npm run build` completed successfully for the React/TypeScript frontend.
- Provider API shapes and structured-output behavior were checked against current official documentation: [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/generate-content/structured-output), [Groq structured outputs](https://console.groq.com/docs/structured-outputs), [Groq model deprecations](https://console.groq.com/docs/deprecations).

### Limits carried forward

- No Supabase project, Deno runtime or provider secrets are configured here. The Edge Function is not deployed or typechecked in a live Supabase runtime, and Gemini/Groq success/failure behavior has not been exercised against provider accounts.
- Path B still uses its deterministic three-card catalogue and is not AI-tailored yet.
- Registration, referral, campaign event storage and admin dashboard remain unimplemented.

### Checkpoint

- Git commit: `checkpoint: build 05 - Gemini Groq provider chain`.

### Next build

- Build 06: tailor Path B's curated three-card shortlist through the provider adapter while keeping the deterministic cards as fallback; then exercise the live provider chain after Supabase secrets are configured.

## Build 06 — AI-tailored Path B catalogue

**Status:** Complete
**Scope:** Tailor Path B's three deterministic catalogue matches without letting model output replace or invent the projects.

### Delivered

- Moved the curated project catalogue and deterministic ranking into a shared module consumed by both the browser and Supabase functions.
- Added a `project-recommendations` Edge Function that validates the role/profile, ranks the catalogue, and selects exactly three projects before any provider call.
- Reuses the server-only Gemini → Groq provider adapters. The model may tailor only one short summary and a three-step roadmap per shortlisted project. The server keeps catalogue IDs, titles, problem, outcome, technologies, difficulty, time and skills unchanged.
- Added local validation for exactly three ordered summaries/roadmaps, string sizes and IDs. Invalid or missing provider output returns the curated descriptions/roadmaps.
- The browser calls the Edge Function only when configured. If it is absent or errors, it presents the same local catalogue suggestions and explains their source.
- Added Supabase JWT verification configuration for the new function and updated README, roadmap and build log.

### Verification

- `npm run build` completed successfully for the React/TypeScript frontend.
- Provider API contracts were reviewed against official docs: [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/generate-content/structured-output), [Groq structured outputs](https://console.groq.com/docs/structured-outputs), [Groq model deprecations](https://console.groq.com/docs/deprecations).

### Limits carried forward

- No Supabase project, Deno runtime or provider secrets are configured here. The Edge Function and live provider/fallback responses are not deployed or exercised in this workspace.
- Path B's curated local results work without AI; Path A also has its local template fallback.
- Per-user/IP rate limiting is still required before public deployment of either model-backed Edge Function.
- Registration, official workshop handoff, demo capture, referrals, campaign event storage and admin dashboard remain unimplemented.

### Checkpoint

- Git commit: `checkpoint: build 06 - AI-tailored Path B catalogue`.

### Next build

- Build 07: workshop conversion flow with honest official handoff vs clearly labeled demo capture. Continue with unique registration handling, optional referrals and the basic admin funnel.

## Build 11 — forest-and-lime visual redesign

**Status:** Complete locally; Supabase integration remains pending.
**Scope:** Replace the generic purple theme with a distinctive visual system and clarify current backend/course blockers.

### Delivered

- Replaced the palette with forest ink, signal lime and warm paper across landing, navigation, CTAs, sections, cards, forms, modal, dashboard and footer.
- Improved path-card contrast and keyboard focus outlines; retained scroll reveals, marquee, hover motion and reduced-motion behavior.
- Found the URL and anon key values reversed in `.env.local`; swapped them into their expected variables without printing either value. The local file remains Git-ignored.
- Audited AI configuration: provider code is in `supabase/functions/_shared/ai.ts`; Gemini/Groq API keys and model IDs are Edge Function settings, never browser keys.
- Clarified that registration remains demo-only without an approved workshop/course URL; course curriculum/content is not in this repository.

### Verification and blockers

- `npm run build` completed successfully.
- Supabase CLI was not available globally; the temporary `npx` CLI check stalled without output and was stopped. No Supabase connector tools are exposed in this workspace, so migrations were not applied.
- After the user confirmed the exact recipient and purpose, the Supabase dashboard confirmed the Auth invitation was sent and the new Auth user appeared in the users list. The Auth UUID is available there for the later admin allowlist step. No migrations are applied, so the allowlist table is not available yet.
- Lovable editing tools are not available to this task; the redesign was made in the local project code.

### Checkpoint

- Git commit: `checkpoint: build 11 - forest and lime visual redesign`.

### Next build

- Build 12: authenticate a usable Supabase CLI/MCP connection, review and apply migrations, deploy functions, add the invited Auth user UUID to the admin allowlist, and migrate API-key usage.

## Build 10 — interactive landing experience

**Status:** Complete; live deployment remains pending.
**Scope:** Make the first visit more explorable through clear routes, active CTAs, scroll-linked sections and restrained motion.

### Delivered

- Reworked hero messaging and primary/secondary entry actions while retaining both existing project paths.
- Added How it works and Explore roles navigation, project-guidance sections, featured role shortcuts, final CTA and a scrolling interest strip.
- Added shareable `#improve` and `#discover` entry routes and browser Back support for returning to the landing page.
- Added reading progress, gentle entrance/hover motion and reduced-motion handling.
- Created a local `.env.local` from the example with blank values; it is ignored by Git so the user can paste their own URL and anon key without sharing them.
- Corrected README setup notes: current hosted Supabase functions provide `SUPABASE_URL` and legacy service-role environment values automatically; only model provider secrets need optional manual setup for AI.
- Audited the PRD, TRD and feature spec against current implementation and recorded outstanding integration, quality and submission work in the roadmap.

### Verification

- `npm run build` completed successfully.
- Browser smoke check confirmed `#discover` opens Path B and Back returns to `#home`.
- Mobile viewport check found no horizontal overflow.
- Supabase was not deployed or modified through an external connector in this workspace.

### Checkpoint

- Git commit: `checkpoint: build 10 - interactive landing experience`.

### Next build

- Build 11: migrate legacy anon-key bearer calls to the current publishable-key / function auth pattern, then deploy and validate the connected Supabase project.

## Build 09 — guided role selection

**Status:** Complete.
**Scope:** Help Path B users select a useful target role without limiting them to a fixed list.

### Delivered

- Added role suggestions grouped into Software & product, AI & data, Infrastructure & security, and Core engineering.
- Selecting a suggestion fills the existing target-role field and continues through the current role-matched recommendation flow.
- Free-text roles remain supported, so suggestions do not constrain the user.
- Updated README and roadmap. Supabase connection work remains pending credentials; current frontend function calls use the legacy JWT-style anon key and need migration before switching to a new publishable key.

### Verification

- `npm run build` completed successfully (TypeScript check and Vite production bundle).
- `git diff --check` passed.

### Checkpoint

- Git commit: `checkpoint: build 09 - guided role selection`.

### Next build

- Build 10: migrate Supabase browser/function auth to publishable keys, connect the project, validate migrations and admin access, then address deployment safeguards.

## Build 08 — referrals and admin metrics

**Status:** Implemented; live Supabase setup pending.
**Scope:** Add optional referral attribution and aggregate progress, plus an allowlisted admin dashboard without exposing registration identities.

### Delivered

- Added migration to issue unique referral codes to existing and new demo registrations.
- Referral URLs are captured from `?ref=` and attributed only to a new unique registration. Invalid codes and self-referrals do not block signup; duplicates do not count again.
- Confirmation offers copy/WhatsApp sharing and an optional aggregate progress check. The invite is never required.
- Added an Auth-protected `project-admin` Edge Function. It validates the user token, then checks the active `admin_users` allowlist before returning aggregate metrics.
- Added admin UI for demo totals, self-reported eligibility/other totals, source counts, 14-day daily registrations, funnel events and referral totals. No PII is returned by the dashboard RPC.
- Browser access token stays in app memory. Service-role and model keys stay in Edge Function secrets. README documents deployment and admin allowlisting.

### Verification

- `npm run build` completed successfully (TypeScript check and Vite production bundle).
- Migration and Edge Function paths were reviewed but not applied/executed against a live Supabase project.

### Limits carried forward

- Supabase credentials are not configured, so remote auth/database paths are unverified.
- Public deployment still needs abuse rate limits and a documented retention/deletion process.

### Checkpoint

- Git commit: `checkpoint: build 08 - referrals and admin metrics`.

### Next build

- Build 09: connect and validate Supabase, inspect mobile behavior, add abuse controls and retention handling, and prepare deployment/demo operations.

## Build 07 — workshop conversion and demo registration

**Status:** Complete
**Scope:** Put an honest workshop next step on both result pages, distinguish official handoff from demo capture, and store demo registrations with deduplication and a minimal funnel.

### Delivered

- Results show a workshop action. If `VITE_WORKSHOP_URL` is configured with an HTTPS destination, the action opens that page and tracks only the click. It does not claim registration completion.
- Without an official URL, the action opens a plainly labeled demo-registration dialog. It requests no details in local preview when Supabase isn't configured.
- Added demo capture for name, email, college, student/developer type, student branch/final-year self-report, selected project, and explicit consent.
- Added `demo_registrations` and `project_events` migration. Email is normalized and unique per campaign; the database marks eligibility only as self-reported. Demo table remains separate from any official registration data and has no public read policy.
- Added `demo-registration` Edge Function with bounded request size, field/enum validation, service-role-only database RPC, generic errors, and no PII/provider key logging.
- Captures landing, path start, result, workshop click, registration form start and saved registration events, with source (`utm_source` or `direct_unknown`), path and short-lived session UUID. CTA clicks are not saved as registrations.
- Path B cards can be selected and the choice carries into demo registration.
- Added migration/deployment instructions and updated README and roadmap.

### Verification

- `npm run build` completed successfully (frontend TypeScript check and Vite production bundle).
- The local preview responds with HTTP 200.

### Limits carried forward

- No Supabase project or approved official workshop URL is configured in this workspace; the migration/function are not deployed, and remote registration/event writes are not exercised here.
- Demo rows are internal prototype records, not NxtWave signups. Final-year eligibility is self-reported, not verified.
- Per-user abuse rate limiting, referral codes, admin dashboard, and a deletion/retention process still need completion before public deployment.

### Checkpoint

- Git commit: `checkpoint: build 07 - workshop conversion and demo registration`.

### Next build

- Build 08: optional referral codes with aggregate progress, and an admin-only view of demo eligible/non-eligible counts plus event funnel/source aggregates.

## Build 01 — app foundation and journey entry

**Status:** Complete
**Scope:** Establish a runnable frontend and make both product paths visible from the landing page.

### Delivered

- React, TypeScript and Vite project scaffold.
- Responsive Project DNA landing page with “I have a project” and “I need an idea” entry points.
- Path A opens an initial GitHub URL / project description input.
- Path B opens an initial target-role / interests input.
- Workshop messaging is visible in the header and footer.
- Original PRD, TRD and feature specification are preserved under `docs/`.
- README captures setup, current capability and product boundaries.

### Verification

- `npm install --no-audit --no-fund` completed successfully.
- `npm run build` completed successfully (TypeScript check and Vite production bundle).

### Limits carried forward

- Inputs are visual only: there is no validation, persistence or next-step submission yet.
- Workshop CTA is a local placeholder; no approved registration destination was included.
- No backend, AI provider, GitHub retrieval, database, analytics or authentication is connected.
- No actual signup or campaign activity has occurred.

### Checkpoint

- Git commit: `checkpoint: build 01 - app foundation and journey entry`.

### Next build

Implement the shared profile/context step and working client-side form state for both paths, including student/developer and role/time inputs. Keep data in memory only until the persistence and privacy approach is implemented.
