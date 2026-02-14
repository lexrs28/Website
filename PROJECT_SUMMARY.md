# Project Summary: Academic Website

Last updated: February 13, 2026

## Overview

This project is a personal academic website built with Next.js and TypeScript. It provides publication-first content management, optional blog publishing through MDX, and automated quality/deploy checks via GitHub + Vercel.

## Objectives

- Present academic profile information across core pages (`about`, `cv`, `projects`, `contact`).
- Maintain a structured publication archive with internal and external links.
- Support blog publishing from version-controlled MDX files.
- Keep release quality controlled by required checks and documented process.

## Scope Implemented

- App routes: `/`, `/about`, `/cv`, `/publications`, `/projects`, `/blog`, `/blog/[slug]`, `/contact`
- Content loaders with typed frontmatter validation
- Publication filters and DOI/arXiv/PDF/DOCX/code links
- SEO routes: sitemap, robots, RSS
- QA stack: lint, typecheck, tests, build
- Process controls:
  - `npm run verify`
  - PR template
  - incident and runbook docs

## Technical Architecture

- Framework: Next.js App Router
- Language: TypeScript
- Source of truth: MDX files under `content/`
- Parsing/validation: `gray-matter` + Zod
- Rendering: `next-mdx-remote` v6
- Test framework: Vitest with deterministic fixture suites
- Deployment target: Vercel

## Branch and Merge Policy

- `main` is PR-only.
- Required checks before merge:
  - `CI / validate`
  - Vercel preview/deploy check
- Branch must be up-to-date before merge.
- Stale approvals are dismissed when commits change.
- Squash merge is preferred.

## Current Health

Expected to pass:

- `npm run verify`

## Key References

- Incident: `docs/incidents/2026-02-13-commit-ci-regression.md`
- Runbook: `docs/runbooks/change-validation-and-merge-policy.md`
- PR checklist template: `.github/pull_request_template.md`
