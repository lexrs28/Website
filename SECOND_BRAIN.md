# Project Second Brain

Last updated: February 23, 2026

## Snapshot

- Goal: maintain and deploy a personal academic website with publication-first content and optional behavioral experiments.
- Current experiment objective: capture anonymous temporal-discounting responses with demographics into Postgres.
- Public positioning objective: personal page with academic elements (not a university-lab style projects site).

## Public UX Decisions

- Header no longer exposes a public `Projects` section.
- `/projects` exists only as a compatibility redirect to `/about`.
- Homepage no longer uses first-authored framing.
- Front-page publications now use a single `Recent Publications` section.
- Supplementary-material publication entries are excluded from homepage recent list.
- About and Contact pages include University of Nottingham visual context.

Reason:
- cleaner personal-page narrative
- less institutional sectioning overhead
- simpler top-level information architecture

## New Capability: Temporal Discounting Capture

- Public route: `/experiments/temporal-discounting`
- Submission API: `POST /api/experiments/temporal-discounting`
- Export API: `GET /api/experiments/temporal-discounting/export`
- Data flow:
  1. user selects sooner/later donation timing + demographics
  2. API validates payload + honeypot
  3. `td_session` cookie identifies browser session
  4. response stored in Postgres (`temporal_discounting_responses`)
  5. CSV export available via token-protected endpoint

## Compatibility Layer

- Legacy page route:
  - `/experiments/dictator-game` -> permanent redirect to temporal route
- Legacy API routes remain thin wrappers:
  - `POST /api/experiments/dictator-game`
  - `GET /api/experiments/dictator-game/export`
- Env var fallback retained:
  - `DICTATOR_EXPORT_TOKEN`
  - `DICTATOR_EXPERIMENT_SLUG`

## Storage Design

- Shared session table:
  - `experiment_sessions`
- Historical archive table (unchanged):
  - `dictator_game_responses`
- Active task table:
  - `temporal_discounting_responses`
- Migrations:
  - `db/migrations/0001_dictator_game.sql`
  - `db/migrations/0002_temporal_discounting.sql`

## Validation Baseline

```bash
npm run verify
```

Additional DB check:

```bash
npm run db:migrate:check
```

## Operational Notes

- Required env vars:
  - `DATABASE_URL`
  - `TEMPORAL_DISCOUNTING_EXPORT_TOKEN`
- Optional env var:
  - `TEMPORAL_DISCOUNTING_EXPERIMENT_SLUG`
- Contact form currently blocks real submission intentionally (UI placeholder only).
- Solo maintenance model stays PR-first (protected `main`) with a fast self-PR path:
  - branch
  - edit
  - `npm run verify`
  - push/open PR
  - merge when required checks pass

## Key References

- Feature ops runbook: `docs/runbooks/temporal-discounting-ops.md`
- Deprecated dictator runbook pointer: `docs/runbooks/dictator-game-ops.md`
- Merge policy runbook: `docs/runbooks/change-validation-and-merge-policy.md`
- Incident record: `docs/incidents/2026-02-13-commit-ci-regression.md`
