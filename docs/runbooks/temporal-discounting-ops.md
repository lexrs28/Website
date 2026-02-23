# Runbook: Temporal Discounting Operations

## Purpose
Operate the `/experiments/temporal-discounting` data-capture feature safely across preview and production.

## Environment Variables
Set these in Vercel project settings for Preview and Production:

- `DATABASE_URL`
- `TEMPORAL_DISCOUNTING_EXPORT_TOKEN`
- Optional: `TEMPORAL_DISCOUNTING_EXPERIMENT_SLUG` (default: `temporal-discounting-v1`)

Backward-compatible fallback is still supported:
- `DICTATOR_EXPORT_TOKEN`
- `DICTATOR_EXPERIMENT_SLUG`

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
- Route: `POST /api/experiments/temporal-discounting`
- Cookie: `td_session` (`httpOnly`, `sameSite=lax`, 1-year max age)
- Duplicate policy: one submission per browser session per experiment slug

## CSV Export API
- Route: `GET /api/experiments/temporal-discounting/export`
- Auth methods:
  - `Authorization: Bearer <TEMPORAL_DISCOUNTING_EXPORT_TOKEN>`
  - `?token=<TEMPORAL_DISCOUNTING_EXPORT_TOKEN>` fallback

Example:

```bash
curl -H "Authorization: Bearer $TEMPORAL_DISCOUNTING_EXPORT_TOKEN" \
  "https://<your-domain>/api/experiments/temporal-discounting/export" \
  -o temporal-discounting-responses.csv
```

## Verification Checklist
1. `npm run verify`
2. `npm run db:migrate:check`
3. Submit one response on `/experiments/temporal-discounting`
4. Confirm second submission in same browser shows duplicate message
5. Export CSV and inspect expected columns (`donation_timing` included)

## Token Rotation
1. Generate a new random token.
2. Update `TEMPORAL_DISCOUNTING_EXPORT_TOKEN` in Vercel environments.
3. Redeploy.
4. Retire old scripts or local env references.
