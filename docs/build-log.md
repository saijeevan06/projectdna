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
