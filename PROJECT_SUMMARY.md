# Project Summary: Academic Website

Last updated: February 14, 2026

## Overview

This project is a personal academic website built with Next.js and TypeScript. It now includes a behavioral experiment hook (`/experiments/dictator-game`) that captures anonymous submissions into Postgres and supports token-protected CSV export.

## Objectives

- Present academic profile information across core pages.
- Maintain publication/blog content pipelines.
- Capture lightweight behavioral experiment data for exploratory idea testing.
- Keep quality and deployment controlled by CI + documented process.

## Scope Implemented

- App routes: `/`, `/about`, `/cv`, `/publications`, `/projects`, `/blog`, `/blog/[slug]`, `/contact`, `/experiments/dictator-game`
- Dictator experiment:
  - client form with demographics and amount selection
  - per-session duplicate prevention via cookie
  - Postgres persistence
  - CSV export endpoint with token auth
- Data contracts:
  - schema validation in `lib/experiments/dictator/schema.ts`
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
- Tests: Vitest (schema, service, API, sitemap)

## Deployment Requirements

- Required env vars:
  - `DATABASE_URL`
  - `DICTATOR_EXPORT_TOKEN`
- Optional env var:
  - `DICTATOR_EXPERIMENT_SLUG`

## Key References

- Dictator runbook: `docs/runbooks/dictator-game-ops.md`
- Merge policy runbook: `docs/runbooks/change-validation-and-merge-policy.md`
- PR checklist template: `.github/pull_request_template.md`
