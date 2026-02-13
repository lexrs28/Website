import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/content/blog";
import { siteConfig } from "@/lib/site";

const staticRoutes = ["/", "/about", "/cv", "/publications", "/projects", "/blog", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedBlogPosts();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.7
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "monthly",
    priority: 0.6
  }));

  return [...staticEntries, ...postEntries];
}
