# Project Summary: Personal Academic Website

Last updated: February 23, 2026

## Overview

This project is a personal academic website built with Next.js and TypeScript. The behavioral hook is now a temporal discounting task (`/experiments/temporal-discounting`) that captures anonymous submissions into Postgres and supports token-protected CSV export.

## Objectives

- Present profile information across core pages with a personal-site-first framing.
- Maintain publication/blog content pipelines.
- Capture lightweight behavioral experiment data for exploratory idea testing.
- Keep quality and deployment controlled by CI + documented process.

## Scope Implemented

- App routes: `/`, `/about`, `/cv`, `/publications`, `/blog`, `/blog/[slug]`, `/contact`, `/experiments/temporal-discounting`
- Legacy redirects:
  - `/experiments/dictator-game` -> `/experiments/temporal-discounting`
  - `/projects` -> `/about`
- Homepage refresh:
  - first-authored findings block removed
  - single `Recent Publications` section (supplementary-material titles excluded)
- About and Contact pages now include University of Nottingham imagery (with attribution)
- Contact page now includes a UI-only contact form placeholder (backend intentionally deferred)
- Temporal discounting experiment:
  - client form with sooner/later donation choice + demographics
  - animated gift movement to sooner/later box based on selection
  - per-session duplicate prevention via cookie
  - Postgres persistence
  - CSV export endpoint with token auth
- Data contracts:
  - schema validation in `lib/experiments/temporal-discounting/schema.ts`
  - service/repository split for maintainability and testing
- QA stack:
  - lint, typecheck, tests, build via `npm run verify`

## Technical Architecture

- Framework: Next.js App Router
- Language: TypeScript
- Storage: Postgres (Vercel-integrated path)
- SQL client: `postgres`
- Migrations: SQL files + Node migration runner
- Validation: Zod
- Tests: Vitest (schema, service, API, sitemap, content loaders)

## Experiment Storage Strategy

- Historical dictator-game data is preserved.
- New table: `temporal_discounting_responses`
- Existing table retained as archive: `dictator_game_responses`

## Deployment Requirements

- Required env vars:
  - `DATABASE_URL`
  - `TEMPORAL_DISCOUNTING_EXPORT_TOKEN`
- Optional env var:
  - `TEMPORAL_DISCOUNTING_EXPERIMENT_SLUG`
- Backward-compatible env fallback:
  - `DICTATOR_EXPORT_TOKEN`
  - `DICTATOR_EXPERIMENT_SLUG`

## Key References

- Temporal-discounting runbook: `docs/runbooks/temporal-discounting-ops.md`
- Deprecated dictator runbook pointer: `docs/runbooks/dictator-game-ops.md`
- Merge policy runbook: `docs/runbooks/change-validation-and-merge-policy.md`
- PR checklist template: `.github/pull_request_template.md`
