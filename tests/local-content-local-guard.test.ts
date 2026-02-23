import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { isLocalApiRequest, isLocalPageRequest } from "@/lib/content-intake/local-guard";

describe("local content guard", () => {
  it("allows localhost requests when content pipeline flag is enabled", () => {
    process.env.CONTENT_PIPELINE_ENABLED = "true";

    const request = new NextRequest("http://localhost:3000/api/local-content/options?type=blog");
    const headers = new Headers({ host: "localhost:3000" });

    expect(isLocalApiRequest(request)).toBe(true);
    expect(isLocalPageRequest(headers)).toBe(true);
  });

  it("rejects non-local hostnames", () => {
    process.env.CONTENT_PIPELINE_ENABLED = "true";

    const request = new NextRequest("http://example.com/api/local-content/options?type=blog", {
      headers: {
        host: "example.com"
      }
    });

    const headers = new Headers({ host: "example.com" });

    expect(isLocalApiRequest(request)).toBe(false);
    expect(isLocalPageRequest(headers)).toBe(false);
  });

  it("rejects all requests when content pipeline flag is disabled", () => {
    delete process.env.CONTENT_PIPELINE_ENABLED;

    const request = new NextRequest("http://localhost:3000/api/local-content/options?type=blog");
    const headers = new Headers({ host: "localhost:3000" });

    expect(isLocalApiRequest(request)).toBe(false);
    expect(isLocalPageRequest(headers)).toBe(false);
  });
});
