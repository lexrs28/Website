import { describe, expect, it } from "vitest";
import type { BlogPostFrontmatter } from "@/lib/content/types";
import { generateRssXml } from "@/lib/rss";

describe("rss generation", () => {
  it("creates valid rss structure for posts", () => {
    const posts: BlogPostFrontmatter[] = [
      {
        title: "Test Post",
        date: "2026-01-01",
        summary: "A short summary",
        tags: ["test"],
        draft: false,
        slug: "test-post"
      }
    ];

    const xml = generateRssXml(posts);
    expect(xml).toContain("<rss");
    expect(xml).toContain("<item>");
    expect(xml).toContain("test-post");
  });
});
