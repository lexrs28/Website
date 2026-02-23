import path from "node:path";
import { describe, expect, it } from "vitest";
import { createStaticContentLoader } from "@/lib/content/static";

const FIXTURES_ROOT = path.join(process.cwd(), "tests", "fixtures");

describe("static content loader", () => {
  it("loads about and projects content from fixture files", async () => {
    const loader = createStaticContentLoader({
      staticDir: path.join(FIXTURES_ROOT, "static")
    });

    const about = await loader.getAboutContent();
    const projects = await loader.getProjectsContent();

    expect(about.body).toContain("Fixture about body");
    expect(projects.cards).toHaveLength(2);
    expect(projects.cards[0]?.title).toBe("Fixture Project A");
  });

  it("falls back to defaults when static files are missing", async () => {
    const loader = createStaticContentLoader({
      staticDir: path.join(FIXTURES_ROOT, "static-missing")
    });

    const about = await loader.getAboutContent();
    const projects = await loader.getProjectsContent();

    expect(about.body.length).toBeGreaterThan(0);
    expect(projects.cards.length).toBeGreaterThan(0);
  });
});
