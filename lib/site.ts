const defaultSiteUrl = "https://example-academic-site.vercel.app";

function resolveSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (!envUrl) {
    return defaultSiteUrl;
  }

  const trimmed = envUrl.trim();
  if (!trimmed) {
    return defaultSiteUrl;
  }

  const prefixed = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `${trimmed.includes("localhost") ? "http" : "https"}://${trimmed}`;

  return prefixed.replace(/\/+$/, "");
}

export const siteConfig = {
  name: "Dr. Robert Smith",
  title: "Dr. Robert Smith | Research and Writing",
  description:
    "Academic website and blog with publications, projects, and essays on research and practice.",
  url: resolveSiteUrl(),
  author: "Robert Smith",
  email: "robert [at] example [dot] edu",
  social: {
    github: "https://github.com/",
    scholar: "https://scholar.google.com/"
  }
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}
