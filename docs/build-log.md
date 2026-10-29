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
