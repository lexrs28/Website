# Personal Academic Website (Next.js + TypeScript + Vercel)

Personal website with academic content, publication indexing, optional MDX blog, and a behavioral experiment hook.

## Current Status (February 23, 2026)

- `main` is active and synced to GitHub (`git@github.com:lexrs28/Website.git`).
- Publication system is live with MDX metadata plus downloadable PDF/DOCX assets.
- Localhost-only content intake route is available at `/local-admin` (feature-flag gated).
- Canonical experiment route is `/experiments/temporal-discounting`.
- Legacy experiment route `/experiments/dictator-game` permanently redirects.
- Local baseline check: `npm run verify`.

## Features

- Routes: `/`, `/about`, `/cv`, `/publications`, `/blog`, `/blog/[slug]`, `/contact`, `/experiments/temporal-discounting`, `/local-admin` (localhost-only)
- Legacy route redirects:
  - `/experiments/dictator-game` -> `/experiments/temporal-discounting`
  - `/projects` -> `/about`
- Homepage section for `Recent Publications` plus latest blog posts
- Publication listing with filters by `type` and `year`
- Publication links: `doi`, `arxiv`, `pdf`, `docx`, `code`
- MDX content pipeline for blog, publications, and selected static sections (`about`, internal `projects` content source)
- Local intake API (`/api/local-content/*`) for create/edit submissions that open PRs
- Temporal discounting form with demographic capture and duplicate-session protection
- Token-protected CSV export endpoint
- About and Contact pages include University of Nottingham imagery with attribution
- Contact page shows a UI-only form placeholder (backend integration intentionally deferred)
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

1. User submits on `/experiments/temporal-discounting`.
2. API validates payload and honeypot field.
3. Browser gets/uses `td_session` cookie (one submission per session).
4. Submission is inserted into Postgres (`temporal_discounting_responses`).
5. CSV export is available via `/api/experiments/temporal-discounting/export` with token auth.

Legacy compatibility endpoints remain available:
- `POST /api/experiments/dictator-game` (wrapper)
- `GET /api/experiments/dictator-game/export` (wrapper)

## Environment Variables

Required:

```bash
DATABASE_URL=postgres://...
TEMPORAL_DISCOUNTING_EXPORT_TOKEN=<long-random-secret>
```

Optional:

```bash
TEMPORAL_DISCOUNTING_EXPERIMENT_SLUG=temporal-discounting-v1
NEXT_PUBLIC_SITE_URL=https://<your-domain-or-vercel-url>
```

Backward-compatibility fallback is supported:
- `DICTATOR_EXPORT_TOKEN` (if temporal token is unset)
- `DICTATOR_EXPERIMENT_SLUG` (if temporal slug is unset)

Local content intake (required only for `/local-admin`):

```bash
CONTENT_PIPELINE_ENABLED=true
GITHUB_TOKEN=<fine-grained PAT with repo contents + pull request write>
CONTENT_PIPELINE_BASE_BRANCH=main # optional, defaults to main
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

## Local Content Intake Flow

1. Set `CONTENT_PIPELINE_ENABLED=true` and `GITHUB_TOKEN` in `.env.local`.
2. Start the app:

```bash
npm run dev
```

3. Open `http://localhost:3000/local-admin`.
4. Choose content type (`blog`, `publication`, `about`, `projects`) and mode (`create` or `edit`).
5. Submit one item to create one PR targeting `main`.
6. Leave Auto-merge on (default) to enable squash auto-merge after required checks pass, or disable per submission.

Notes:
- Access is restricted to localhost requests and returns `404` when disabled or non-local.
- Publication uploads accept `.pdf` and `.docx` up to 10MB each; uploaded files are committed under `public/publications/`.
- `projects` content type is retained for internal content management, even though `/projects` is not a public section.

## Homepage Curation

- Homepage recent publications are sourced from published items in `content/publications/*.mdx`.
- Supplementary-material entries are intentionally excluded from the homepage list.
- Detailed filtering and full list access remain on `/publications`.

Why this approach:
- content curation stays simple (frontmatter-driven)
- homepage editing remains low-friction
- no API or database changes are required for publication ordering updates

## Solo Maintenance Quick Flow

1. Sync `main`:

```bash
git checkout main
git pull --ff-only
```

2. Create a branch:

```bash
git switch -c feat/<short-change-name>
```

3. Make edits.
4. Run local gate:

```bash
npm run verify
```

5. Push and open your PR:

```bash
git push -u origin feat/<short-change-name>
```

6. Merge your own PR after required checks pass (`CI / validate` + Vercel preview).

Why this workflow:
- keeps solo updates fast
- preserves CI/deploy safety
- keeps rollback straightforward via `git revert`

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
  - `/experiments/temporal-discounting`
  - `/api/experiments/temporal-discounting/export` (with token)
5. Merge only after required checks pass.

## References

- Temporal-discounting ops runbook: `docs/runbooks/temporal-discounting-ops.md`
- Deprecated dictator runbook pointer: `docs/runbooks/dictator-game-ops.md`
- Merge policy runbook: `docs/runbooks/change-validation-and-merge-policy.md`
- Incident reference: `docs/incidents/2026-02-13-commit-ci-regression.md`
