import type { BlogPostFrontmatter } from "@/lib/content/types";
import { absoluteUrl, siteConfig } from "@/lib/site";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateRssXml(posts: BlogPostFrontmatter[]): string {
  const items = posts
    .map((post) => {
      const link = absoluteUrl(`/blog/${post.slug}`);
      const pubDate = new Date(post.date).toUTCString();
      return `<item><title>${escapeXml(post.title)}</title><link>${link}</link><guid>${link}</guid><pubDate>${pubDate}</pubDate><description>${escapeXml(post.summary)}</description></item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(siteConfig.title)}</title><link>${siteConfig.url}</link><description>${escapeXml(siteConfig.description)}</description>${items}</channel></rss>`;
}
