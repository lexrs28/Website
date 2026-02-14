# Project Second Brain

Last updated: February 14, 2026

## Snapshot

- Goal: maintain and deploy a personal academic website with publication-first content and optional behavioral experiments.
- Current branch focus: `feat/dictator-game-capture`.
- Runtime objective: capture anonymous dictator-game responses with demographics into Postgres.

## New Capability: Dictator Game Capture

- Public route: `/experiments/dictator-game`
- Submission API: `POST /api/experiments/dictator-game`
- Export API: `GET /api/experiments/dictator-game/export`
- Data flow:
  1. user submits amount + demographics
  2. API validates payload + honeypot
  3. `dg_session` cookie identifies browser session
  4. response stored in Postgres (`dictator_game_responses`)
  5. CSV export available via token-protected endpoint

## Storage Design

- Tables:
  - `experiment_sessions`
  - `dictator_game_responses`
- Migration source:
  - `db/migrations/0001_dictator_game.sql`
- Migration runner:
  - `scripts/db/migrate.mjs`

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
  - `DICTATOR_EXPORT_TOKEN`
- Optional env var:
  - `DICTATOR_EXPERIMENT_SLUG`
- Export CSV intentionally excludes raw user-agent for lower re-identification risk.

## Key References

- Feature ops runbook: `docs/runbooks/dictator-game-ops.md`
- Merge policy runbook: `docs/runbooks/change-validation-and-merge-policy.md`
- Incident record: `docs/incidents/2026-02-13-commit-ci-regression.md`
