# Academic Website (Next.js + TypeScript + Vercel)

Personal academic website with profile pages, publication index, optional MDX blog, and a behavioral experiment hook.

## Current Status (February 14, 2026)

- `main` is active and synced to GitHub (`git@github.com:lexrs28/Website.git`).
- Publication system is live with MDX metadata plus downloadable PDF/DOCX assets.
- Experiment route is available at `/experiments/dictator-game`.
- Local baseline check: `npm run verify`.

## Features

- Routes: `/`, `/about`, `/cv`, `/publications`, `/projects`, `/blog`, `/blog/[slug]`, `/contact`, `/experiments/dictator-game`
- Publication listing with filters by `type` and `year`
- Publication links: `doi`, `arxiv`, `pdf`, `docx`, `code`
- MDX content pipeline for blog and publications
- Dictator-game form with demographic capture and duplicate-session protection
- Token-protected CSV export endpoint
- SEO infrastructure: metadata, sitemap, robots, RSS
- CI quality gate: lint, typecheck, test, build

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Postgres (`postgres` package)
- `gray-matter`
- `zod`
- `next-mdx-remote` v6
- Vitest

## Repository Layout

```text
app/                  # Routes and page modules
components/           # UI components
content/              # MDX content sources
db/migrations/        # SQL migrations
docs/                 # Runbooks and incident notes
lib/                  # Content loaders, experiment services, and config
public/               # Static downloadable assets
tests/                # Vitest suites and fixtures
scripts/db/           # DB migration runner
```

## Experiment Data Flow

1. User submits on `/experiments/dictator-game`.
2. API validates payload and honeypot field.
3. Browser gets/uses `dg_session` cookie (one submission per session).
4. Submission is inserted into Postgres.
5. CSV export is available via `/api/experiments/dictator-game/export` with token auth.

## Environment Variables

Required:

```bash
DATABASE_URL=postgres://...
DICTATOR_EXPORT_TOKEN=<long-random-secret>
```

Optional:

```bash
DICTATOR_EXPERIMENT_SLUG=dictator-game-v1
NEXT_PUBLIC_SITE_URL=https://<your-domain-or-vercel-url>
```

## Commands

- `npm run dev` - local development server
- `npm run lint` - ESLint checks
- `npm run typecheck` - TypeScript checks
- `npm run test` - Vitest suite
- `npm run build` - production build
- `npm run verify` - local quality gate (`lint + typecheck + test + build`)
- `npm run db:migrate` - apply SQL migrations
- `npm run db:migrate:check` - show pending migrations (non-zero exit if pending)

## Delivery Policy

- `main` is PR-only.
- Required checks before merge:
  - `CI / validate`
  - Vercel preview/deploy check
- Required merge behavior:
  - branch up to date
  - stale approvals dismissed on new commits
  - squash merge preferred

## Deployment (Vercel)

1. Push feature branch and open PR.
2. Set env vars for Preview and Production in Vercel.
3. Run `npm run db:migrate` against target DB.
4. Verify preview routes:
  - `/experiments/dictator-game`
  - `/api/experiments/dictator-game/export` (with token)
5. Merge only after required checks pass.

## References

- Dictator-game ops runbook: `docs/runbooks/dictator-game-ops.md`
- Merge policy runbook: `docs/runbooks/change-validation-and-merge-policy.md`
- Incident reference: `docs/incidents/2026-02-13-commit-ci-regression.md`
