# Runbook: Dictator Game Operations

## Purpose
Operate the `/experiments/dictator-game` data-capture feature safely across preview and production.

## Environment Variables
Set these in Vercel project settings for Preview and Production:

- `DATABASE_URL`
- `DICTATOR_EXPORT_TOKEN`
- Optional: `DICTATOR_EXPERIMENT_SLUG` (default: `dictator-game-v1`)

## Database Setup
1. Provision Vercel-integrated Postgres.
2. Confirm `DATABASE_URL` is available in local shell and Vercel env vars.
3. Run migrations locally against target DB:

```bash
npm run db:migrate
```

4. Optional check-only mode:

```bash
npm run db:migrate:check
```

## Submission API
- Route: `POST /api/experiments/dictator-game`
- Cookie: `dg_session` (`httpOnly`, `sameSite=lax`, 1-year max age)
- Duplicate policy: one submission per browser session per experiment slug

## CSV Export API
- Route: `GET /api/experiments/dictator-game/export`
- Auth methods:
  - `Authorization: Bearer <DICTATOR_EXPORT_TOKEN>`
  - `?token=<DICTATOR_EXPORT_TOKEN>` fallback

Example:

```bash
curl -H "Authorization: Bearer $DICTATOR_EXPORT_TOKEN" \
  "https://<your-domain>/api/experiments/dictator-game/export" \
  -o dictator-game-responses.csv
```

## Verification Checklist
1. `npm run verify`
2. `npm run db:migrate:check`
3. Submit one response on `/experiments/dictator-game`
4. Confirm second submission in same browser shows duplicate message
5. Export CSV and inspect expected columns

## Token Rotation
1. Generate a new random token.
2. Update `DICTATOR_EXPORT_TOKEN` in Vercel environments.
3. Redeploy.
4. Retire old scripts or local env references.
