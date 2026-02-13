# Academic Website + Blog (Next.js + Vercel)

This project is a personal academic website and blog built with Next.js App Router and TypeScript.

## Features

- Academic profile pages: About, CV, Publications, Projects, Contact.
- Blog with MDX content in repo.
- Draft post filtering in production.
- SEO metadata, sitemap, robots, and RSS feed.
- Publication filtering by type and year.
- CI checks for lint, typecheck, test, and build.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

### Local Play Loop

Use this rapid iteration loop while developing:

```bash
npm run dev
npm run test
npm run build
```

## Content Authoring

- Blog posts: `content/blog/*.mdx`
- Publications: `content/publications/*.mdx`

### Blog frontmatter

```yaml
title: "Post title"
date: "2026-01-01"
summary: "Short summary"
tags: ["tag"]
draft: false
slug: "optional-custom-slug"
```

### Publication frontmatter

```yaml
title: "Paper title"
authors: ["Author One", "Author Two"]
venue: "Conference or Journal"
year: 2025
type: "conference"
links:
  doi: "https://doi.org/..."
  pdf: "https://..."
highlight: false
```

## Commands

- `npm run dev` - start local server.
- `npm run lint` - run ESLint.
- `npm run typecheck` - run TypeScript checks.
- `npm run test` - run test suite.
- `npm run build` - production build.

## Vercel Deployment

1. Push this repository to GitHub.
2. Import the repo in Vercel.
3. Keep default build settings for Next.js.
4. Deploy to temporary `*.vercel.app` domain.
5. Later, attach your custom domain in Vercel project settings.

### Protected Preview Before Custom Domain

1. In Vercel, open your project settings and enable deployment protection/password access for preview (or all) deployments.
2. Share the protected `*.vercel.app` URL only with selected testers.
3. Keep your custom domain for a later phase.

### Canonical URL Configuration

This app resolves `siteConfig.url` from environment values in this order:

1. `NEXT_PUBLIC_SITE_URL`
2. `VERCEL_URL`
3. fallback: `https://example-academic-site.vercel.app`

For local development, optionally set:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Notes

- Prefer setting `NEXT_PUBLIC_SITE_URL` for production canonical URL control.
- Replace `public/cv-placeholder.pdf` with your actual CV.
