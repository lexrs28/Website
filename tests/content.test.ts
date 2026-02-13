import { describe, expect, it } from "vitest";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/content/blog";
import { getAllPublications } from "@/lib/content/publications";

describe("content loaders", () => {
  it("loads and validates blog posts", async () => {
    const posts = await getAllBlogPosts();
    expect(Array.isArray(posts)).toBe(true);
    for (const post of posts) {
      expect(post.title.length).toBeGreaterThan(0);
      expect(post.summary.length).toBeGreaterThan(0);
      expect(post.slug.length).toBeGreaterThan(0);
      expect(Number.isNaN(Date.parse(post.date))).toBe(false);
    }
  });

  it("loads single blog post by slug when present and returns null for missing slug", async () => {
    const missingPost = await getBlogPostBySlug("__missing-slug__");
    expect(missingPost).toBeNull();

    const posts = await getAllBlogPosts();
    if (posts.length === 0) {
      return;
    }

    const target = posts[0];
    const post = await getBlogPostBySlug(target.slug);
    expect(post?.frontmatter.slug).toBe(target.slug);
    expect((post?.frontmatter.title.length ?? 0)).toBeGreaterThan(0);
    expect((post?.content.length ?? 0)).toBeGreaterThan(0);
  });

  it("loads and validates publication entries", async () => {
    const publications = await getAllPublications();
    expect(Array.isArray(publications)).toBe(true);

    for (const item of publications) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.authors.length).toBeGreaterThan(0);
      expect(item.year).toBeGreaterThan(1900);
      expect(item.slug.length).toBeGreaterThan(0);
    }
  });
});
