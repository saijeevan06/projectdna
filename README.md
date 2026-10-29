# Project DNA

Project DNA helps students and developers take a practical next step with a project. The planned experience has two paths: improve an existing project or discover a project aligned with a target role. Results should be useful before the workshop registration prompt.

## Current checkpoint

**Build 01 — app foundation and journey entry**

- Responsive React + TypeScript + Vite application shell.
- Landing page explains the two starting paths and the free AI workshop.
- Choosing either path opens its first input screen.
- This is a front-end prototype. Inputs are not submitted or saved, and the workshop destination is a placeholder until an approved URL is provided.

## Run locally

```bash
npm install
npm run dev
```

Create a production bundle with `npm run build`.

## Project docs

- [Product requirements](docs/product-requirements.txt)
- [Technical requirements](docs/technical-requirements.txt)
- [Feature specification](docs/feature-specification.txt)
- [Build log and next checkpoint](docs/build-log.md)

## Product boundaries

- No full repository crawling or code execution.
- No provider or database secrets in the browser.
- Demo activity must be labeled and kept separate from verified registrations.
- A CTA click is not a completed registration. Do not claim an official registration without an approved integration or confirmation.
