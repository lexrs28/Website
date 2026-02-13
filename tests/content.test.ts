import { describe, expect, it } from "vitest";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/content/blog";
import { getAllPublications } from "@/lib/content/publications";

describe("content loaders", () => {
  it("loads and validates blog posts", async () => {
    const posts = await getAllBlogPosts();
    expect(posts.length).toBeGreaterThanOrEqual(2);
    for (const post of posts) {
      expect(post.title.length).toBeGreaterThan(0);
      expect(post.summary.length).toBeGreaterThan(0);
      expect(post.slug.length).toBeGreaterThan(0);
      expect(Number.isNaN(Date.parse(post.date))).toBe(false);
    }
  });

  it("loads single blog post by slug", async () => {
    const post = await getBlogPostBySlug("launching-an-academic-site");
    expect(post?.frontmatter.title).toBe("Launching an Academic Site");
    expect(post?.content.length).toBeGreaterThan(0);
  });

  it("loads and validates publication entries", async () => {
    const publications = await getAllPublications();
    expect(publications.length).toBeGreaterThanOrEqual(4);

    for (const item of publications) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.authors.length).toBeGreaterThan(0);
      expect(item.year).toBeGreaterThan(1900);
      expect(item.slug.length).toBeGreaterThan(0);
    }
  });
});
