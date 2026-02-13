# Project Second Brain

Last updated: February 13, 2026

## Snapshot
- Goal: Academic website + blog using Next.js (TypeScript, App Router) and Vercel.
- Status: Core implementation scaffold is complete locally.
- Current blocker: Dependencies were not installed because npm registry was unreachable in this environment.

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
- Added tests:
  - `tests/content.test.ts`, `tests/rss.test.ts`, `tests/sitemap.test.ts`
- Added CI workflow:
  - `.github/workflows/ci.yml`
- Added project README and CV placeholder PDF.

## Immediate TODO
1. Run `npm install`.
2. Run checks:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`
3. Run locally with `npm run dev` and review pages/content.
4. Update personal details and links in `lib/site.ts`.
5. Replace `public/cv-placeholder.pdf` with real CV.
6. Push to GitHub and deploy on Vercel (`*.vercel.app`).

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

## Quick Resume Commands
```bash
npm install
npm run lint && npm run typecheck && npm run test && npm run build
npm run dev
```
