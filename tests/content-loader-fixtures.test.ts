import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBlogContentLoader } from "@/lib/content/blog";
import { createPublicationsContentLoader } from "@/lib/content/publications";

const FIXTURES_ROOT = path.join(process.cwd(), "tests", "fixtures");

describe("content loader fixtures", () => {
  it("returns an empty blog list for an empty fixture directory", async () => {
    const loader = createBlogContentLoader({
      blogDir: path.join(FIXTURES_ROOT, "blog-empty")
    });

    const posts = await loader.getAllBlogPosts();

    expect(posts).toEqual([]);
    await expect(loader.getBlogPostBySlug("missing-slug")).resolves.toBeNull();
  });

  it("loads blog fixtures and filters drafts in production mode", async () => {
    const loader = createBlogContentLoader({
      blogDir: path.join(FIXTURES_ROOT, "blog"),
      nodeEnv: "production"
    });

    const posts = await loader.getAllBlogPosts();
    const published = await loader.getPublishedBlogPosts();

    expect(posts).toHaveLength(2);
    expect(posts.map((post) => post.slug)).toContain("alpha-post");
    expect(posts.map((post) => post.slug)).toContain("draft-fixture");
    expect(published.map((post) => post.slug)).toEqual(["alpha-post"]);
  });

  it("loads publication fixtures with root-relative asset links", async () => {
    const loader = createPublicationsContentLoader({
      publicationsDir: path.join(FIXTURES_ROOT, "publications"),
      nodeEnv: "production"
    });

    const publications = await loader.getAllPublications();
    const published = await loader.getPublishedPublications();

    expect(publications).toHaveLength(3);
    expect(published).toHaveLength(2);
    expect(published.map((item) => item.slug)).not.toContain("paper-draft");
    const journal = publications.find((item) => item.slug === "paper-a");
    expect(journal?.links.pdf).toBe("/publications/fixture-journal-paper.pdf");
    expect(journal?.links.docx).toBe("/publications/fixture-journal-paper.docx");
  });

  it("rejects invalid publication links", async () => {
    const loader = createPublicationsContentLoader({
      publicationsDir: path.join(FIXTURES_ROOT, "publications-invalid")
    });

    await expect(loader.getAllPublications()).rejects.toThrow(
      "Expected an absolute URL or a root-relative path"
    );
  });
});
