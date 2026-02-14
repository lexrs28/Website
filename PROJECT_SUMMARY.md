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
- Homepage identity/layout refresh:
  - personal name moved from header into hero box
  - streamlined header branding area with theme toggle retained
- Featured publication curation method:
  - controlled by publication `highlight` flags
  - deterministic priority for selected working papers on homepage
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

## Why These Homepage Changes

- improves first-screen visual hierarchy by placing identity in the hero
- makes featured-paper updates simpler for solo maintenance
- preserves operational safety through the existing protected-branch workflow

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
