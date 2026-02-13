# Incident: Commit CI Regression on Main

Date: February 13, 2026
Status: Resolved with prevention controls in progress

## Summary
Two commits reached `main` with failing statuses because tests were coupled to mutable seeded content and direct pushes were allowed. A subsequent fix commit repaired the tests, but history showed red commit statuses and no formal prevention controls.

## Impact
- Temporary breakage in CI signal on `main`.
- Reduced confidence in deployment safety and merge hygiene.
- Additional follow-up time required to restore a clean operational baseline.

## Timeline
- `803d4cd` changed content and removed seeded blog fixtures while tests still depended on a specific slug and minimum post count.
- CI failed for `803d4cd`.
- `8c9c469` updated tests to stop hard-coding mutable fixture assumptions.
- CI recovered, but historical failing statuses remained visible.
- Recovery branch `fix-commit-regression-hardening` introduced explicit revert/re-apply commits and prevention controls.

## Root Cause
- Tests in `tests/content.test.ts` were written as fixture-dependent integration checks:
  - hard-coded slug expectation (`launching-an-academic-site`)
  - minimum blog fixture count assumption
- Process allowed direct push to `main`, so broken commits could land before branch-level checks blocked merge.

## Corrective Actions Completed
1. Revert/re-apply chain created to document explicit recovery steps.
2. Content loader APIs refactored to support deterministic fixture directories for test isolation.
3. Added fixture-based tests for empty directories, draft filtering, root-relative links, and invalid schema rejection.
4. Added `npm run verify` as a unified local pre-PR gate.
5. CI now runs the single `verify` gate.

## Prevention Controls
1. Protect `main` as PR-only.
2. Require `CI / validate` and Vercel deployment check to pass before merge.
3. Require branch up-to-date before merge and dismiss stale approvals.
4. Use PR checklist to enforce local `npm run verify` and rollback readiness.
5. Keep smoke tests content-agnostic; keep deterministic behavior in fixture tests.

## Follow-Up
- Complete GitHub branch protection and repository merge-settings updates.
- Run probation window:
  1. content-only PR
  2. code/test PR
- Close incident after both probation PRs pass with required checks.
