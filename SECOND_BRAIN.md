# Project Second Brain

Last updated: February 13, 2026

## Snapshot

- Goal: maintain and deploy a personal academic website with publication-first content and optional blog content.
- Runtime status: app is stable on the recovery branch with explicit revert/re-apply history.
- Git policy target: `main` is PR-only with required CI + Vercel checks.

## Recent Incident and Recovery

- Incident: broken commit statuses landed on `main` due to fixture-coupled tests and direct push workflow.
- Recovery sequence executed:
  1. Revert `8c9c469`
  2. Revert `803d4cd`
  3. Re-apply content/docx commit
  4. Re-apply dynamic fixture test fix
- Reference: `docs/incidents/2026-02-13-commit-ci-regression.md`

## Technical Hardening Added

- Loader testability improvements:
  - `createBlogContentLoader({ blogDir, nodeEnv })`
  - `createPublicationsContentLoader({ publicationsDir })`
- Fixture-driven content tests in `tests/content-loader-fixtures.test.ts`.
- Fixture directories:
  - `tests/fixtures/blog/`
  - `tests/fixtures/blog-empty/`
  - `tests/fixtures/publications/`
  - `tests/fixtures/publications-invalid/`
- Existing `tests/content.test.ts` retained as smoke coverage with no hard-coded slug/count assumptions.

## Validation Baseline

Required local gate:

```bash
npm run verify
```

`verify` runs lint, typecheck, test, and build.

## Process Controls

- CI workflow uses `CI / validate` as the merge gate.
- PR template enforces:
  - local `npm run verify`
  - rollback plan
  - green CI + Vercel checks
- Reference runbook: `docs/runbooks/change-validation-and-merge-policy.md`

## Next Actions

1. Enable/confirm branch protection settings for `main` in GitHub.
2. Verify Vercel check context name in required checks list.
3. Run probation PR window:
   - content-only PR
   - code/test PR
4. Replace placeholder profile details in `lib/site.ts` and `public/cv-placeholder.pdf`.
