# Project DNA

Project DNA helps students and developers take a practical next step with a project. The planned experience has two paths: improve an existing project or discover a project aligned with a target role. Results should be useful before the workshop registration prompt.

## Current checkpoint

**Build 03 — curated Path B recommendations**

- Responsive React + TypeScript + Vite application shell.
- Landing page explains the two starting paths and the free AI workshop.
- Path A captures a GitHub URL or project description; Path B captures a target role.
- Both paths collect five profile answers: branch, experience, preferred technology, interests and available time.
- Path B returns three role/profile-matched catalogue projects with outcomes, technologies, difficulty, skills and a starter roadmap.
- Path A accepts a public GitHub repository or pasted README/description, then displays bounded template-based makeover guidance.
- Users can review/edit answers and see the deterministic catalogue output without AI providers. Data remains in browser memory only.
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
npx supabase functions deploy project-makeover
```

Then put the project URL and JWT-style anon key in `.env.local` using [.env.example](.env.example) as a template. The browser anon key is public by design; never add a service-role key or AI provider key to frontend environment variables.

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
