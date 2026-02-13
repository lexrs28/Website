import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("includes required static routes", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://example-academic-site.vercel.app/");
    expect(urls).toContain("https://example-academic-site.vercel.app/blog");
    expect(urls).toContain("https://example-academic-site.vercel.app/publications");
  });
});
