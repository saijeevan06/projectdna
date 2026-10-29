# Project DNA build log

Each build checkpoint records shipped behavior, known limits, documentation changes and the next planned slice. The Git commit for each checkpoint is named `checkpoint: build NN - ...`.

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

### Limits carried forward

- Inputs are visual only: there is no validation, persistence or next-step submission yet.
- Workshop CTA is a local placeholder; no approved registration destination was included.
- No backend, AI provider, GitHub retrieval, database, analytics or authentication is connected.
- No actual signup or campaign activity has occurred.

### Checkpoint

- Git commit: `checkpoint: build 01 - app foundation and journey entry` (created after the production bundle succeeds).

### Next build

Implement the shared profile/context step and working client-side form state for both paths, including student/developer and role/time inputs. Keep data in memory only until the persistence and privacy approach is implemented.
