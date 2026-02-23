# Runbook: Change Validation and Merge Policy

## Purpose
Prevent unstable commits from landing on `main` and standardize rollback-ready delivery.

## Policy
- `main` is PR-only.
- Required checks before merge:
  - `CI / validate`
  - Vercel preview/deploy status check (exact check name from repo settings)
- Require branch to be up-to-date before merge.
- Dismiss stale approvals when new commits are pushed.
- Default merge strategy: squash.

## Local Developer Flow
1. Create a feature branch from `main`.
2. Make changes.
3. Run:

```bash
npm run verify
```

4. Open PR using `.github/pull_request_template.md`.
5. Confirm all required checks are green.
6. Merge via squash.

## Solo Quick-Run Procedure
1. Sync local main:

```bash
git checkout main
git pull --ff-only
```

2. Create branch:

```bash
git switch -c feat/<short-change-name>
```

3. Edit files.
4. Run the single local gate:

```bash
npm run verify
```

5. Push and open PR:

```bash
git push -u origin feat/<short-change-name>
```

6. Merge your own PR after required checks are green.

## Validation Scope
`npm run verify` runs:
1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build`

## Test Strategy Guardrails
- Integration smoke tests may read real repo content but must not assume fixed slugs or counts.
- Fixture tests should assert edge cases using isolated directories under `tests/fixtures/`.
- New loader or schema logic must include at least one success case and one failure case.

## Content-Only Update Recipe
Use this for publication/blog edits that do not change app logic.

Note:
- `/projects` is not a public section; it redirects to `/about`.
- `content/static/projects.mdx` is retained only for internal content pipeline compatibility.

1. Choose one of the two update paths:
  - Manual file edit for:
    - `content/publications/*.mdx`
    - `content/blog/*.mdx`
    - `content/static/about.mdx`
    - `content/static/projects.mdx`
  - Local intake app at `http://localhost:3000/local-admin` with:
    - `CONTENT_PIPELINE_ENABLED=true`
    - `GITHUB_TOKEN` set in `.env.local`
2. If using manual edits, update files in:
  - `content/publications/*.mdx`
  - `content/blog/*.mdx`
  - `content/static/about.mdx`
  - `content/static/projects.mdx`
3. For homepage featured publications, set `highlight: true` in the publication frontmatter.
4. Run:

```bash
npm run verify
```

5. Open self-PR and merge when required checks pass.

## Rollback Procedure
1. If a regression merges, create a dedicated recovery branch from `main`.
2. Use `git revert` for offending commits in reverse order.
3. Re-apply intended behavior as small green commits.
4. Re-run `npm run verify`.
5. Merge rollback/recovery PR with required checks.

## Branch Protection Setup Checklist (GitHub UI)
1. Settings -> Branches -> Add rule for `main`.
2. Enable `Require a pull request before merging`.
3. Enable `Require status checks to pass before merging`.
4. Add required checks:
   - `CI / validate`
   - Vercel deployment check
5. Enable `Require branches to be up to date before merging`.
6. Enable `Dismiss stale pull request approvals when new commits are pushed`.
7. Restrict who can push to matching branches.
8. In merge options, keep squash merge enabled.
