# Project Second Brain

Last updated: February 13, 2026

## Snapshot
- Goal: Academic website + blog using Next.js (TypeScript, App Router) and Vercel.
- Status: Core implementation is complete and validated locally.
- Deployment status: GitHub sync is working (`main` pushed); Vercel project setup is in progress.
- Current blocker: None in codebase. Remaining work is Vercel UI configuration and final deploy verification.

## What Is Done
- Built full app structure with routes:
  - `/`, `/about`, `/cv`, `/publications`, `/projects`, `/blog`, `/blog/[slug]`, `/contact`
- Added SEO/feed infrastructure:
  - `app/sitemap.ts`, `app/robots.ts`, `app/rss.xml/route.ts`
  - Root metadata in `app/layout.tsx`
- Added typed content layer:
  - Blog/publication frontmatter validation via Zod
  - Loaders in `lib/content/blog.ts` and `lib/content/publications.ts`
- Added reusable components and global styling.
- Added starter MDX content:
  - Blog posts in `content/blog/`
  - Publication entries in `content/publications/`
- Added light/dark theme support:
  - Theme toggle component in `components/theme-toggle.tsx`
  - Header integration in `components/site-header.tsx`
  - Global theme tokens and styles in `app/globals.css`
  - Root `data-theme` initialization in `app/layout.tsx`
- Added tests:
  - `tests/content.test.ts`, `tests/rss.test.ts`, `tests/sitemap.test.ts`
- Added CI workflow:
  - `.github/workflows/ci.yml`
- Added project README and CV placeholder PDF.
- Fixed sitemap root route handling in `app/sitemap.ts`.
- Added environment-aware canonical URL resolution in `lib/site.ts`:
  - `NEXT_PUBLIC_SITE_URL` -> `VERCEL_URL` -> fallback URL
- Fixed GitHub auth workflow by switching repo remote to SSH:
  - `origin = git@github.com:lexrs28/Website.git`
- Applied security hotfix:
  - Upgraded `next-mdx-remote` from `5.0.0` to `6.0.0`
  - Hotfix merged to `main` and pushed to GitHub

## Validation Status
- `npm run typecheck`: passing
- `npm run test`: passing (all current tests)
- `npm run build`: passing

## Immediate TODO
1. In Vercel, import GitHub repo `lexrs28/Website`.
2. Deploy with default Next.js settings.
3. Enable deployment protection/password for preview (or all deployments).
4. Set `NEXT_PUBLIC_SITE_URL` in Vercel project env vars.
5. Redeploy and verify:
   - `/`
   - `/blog`
   - `/blog/launching-an-academic-site` (or another post)
   - `/rss.xml`
   - `/sitemap.xml`
6. Replace `public/cv-placeholder.pdf` with real CV.
7. Replace placeholder personal details/links in `lib/site.ts`.

## Near-Term TODO (Phase 2)
- Improve publication UX polish (filters/sorting refinements if needed).
- Accessibility pass (keyboard, heading flow, contrast review).
- Performance pass (image/font optimization and static rendering review).
- Final content QA and launch checklist.

## Decisions Locked
- Next.js + Vercel, TypeScript, App Router.
- In-repo MDX content model.
- Git push to `main` drives deployment.
- v1 includes SEO + RSS + sitemap only (no analytics/newsletter yet).
- Two-phase rollout.
- GitHub authentication for this machine uses SSH (not HTTPS password).
- `next-mdx-remote` must stay at v6+ for Vercel security compliance.

## Quick Resume Commands
```bash
npm run lint && npm run typecheck && npm run test && npm run build
npm run dev
git status -sb
git pull --ff-only
```
