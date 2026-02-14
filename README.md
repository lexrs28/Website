# Academic Website (Next.js + TypeScript + Vercel)

Personal academic website with profile pages, publication index, optional MDX blog, and Vercel-ready deployment.

## Current Status (February 13, 2026)

- `main` is active and synced to GitHub (`git@github.com:lexrs28/Website.git`).
- Publication system is live with MDX metadata plus downloadable PDF/DOCX assets.
- Blog system is implemented, but `content/blog/` currently has no post files.
- Local baseline check: `npm run verify`.

## Features

- Routes: `/`, `/about`, `/cv`, `/publications`, `/projects`, `/blog`, `/blog/[slug]`, `/contact`
- Publication listing with filters by `type` and `year`
- Publication links: `doi`, `arxiv`, `pdf`, `docx`, `code`
- MDX content pipeline for blog and publications
- SEO infrastructure: metadata, sitemap, robots, RSS
- CI quality gate: lint, typecheck, test, build

## Tech Stack

- Next.js App Router
- TypeScript
- React
- `gray-matter`
- `zod`
- `next-mdx-remote` v6
- Vitest

## Repository Layout

```text
app/                  # Routes and page modules
components/           # UI components
content/              # MDX content sources
  blog/               # Blog posts (.mdx)
  publications/       # Publication metadata entries (.mdx)
lib/                  # Content loaders and site config
docs/                 # Runbooks and incident notes
public/               # Static downloadable assets
tests/                # Vitest suites and fixtures
```

## Content Authoring

### Blog posts

Path: `content/blog/*.mdx`

```yaml
---
title: "Post title"
date: "2026-01-01"
summary: "Short summary"
tags: ["tag"]
draft: false
slug: "optional-custom-slug"
---
```

### Publication entries

Path: `content/publications/*.mdx`

```yaml
---
title: "Paper title"
authors: ["Author One", "Author Two"]
venue: "Journal or Conference"
year: 2026
type: "journal"
links:
  doi: "https://doi.org/..."
  arxiv: "https://arxiv.org/abs/..."
  pdf: "/publications/example.pdf"
  docx: "/publications/example.docx"
  code: "https://github.com/org/repo"
highlight: false
---
```

Notes:
- Publication links accept absolute URLs and root-relative paths.
- Files in `public/publications/` are served as `/publications/<filename>`.

## Commands

- `npm run dev` - local development server
- `npm run lint` - ESLint checks
- `npm run typecheck` - TypeScript checks
- `npm run test` - Vitest suite
- `npm run build` - production build
- `npm run verify` - required local quality gate (`lint + typecheck + test + build`)

## Delivery Policy

- `main` is PR-only.
- Required checks before merge:
  - `CI / validate`
  - Vercel preview/deploy check
- Required merge behavior:
  - branch up to date
  - stale approvals dismissed on new commits
  - squash merge preferred

Detailed policy and setup steps:
- `docs/runbooks/change-validation-and-merge-policy.md`

Incident reference:
- `docs/incidents/2026-02-13-commit-ci-regression.md`

## Deployment (Vercel)

1. Push branch and open PR.
2. Merge only after required checks pass.
3. Configure:

```bash
NEXT_PUBLIC_SITE_URL=https://<your-domain-or-vercel-url>
```

Site URL resolution in `lib/site.ts`:
1. `NEXT_PUBLIC_SITE_URL`
2. `VERCEL_URL`
3. `https://example-academic-site.vercel.app`
