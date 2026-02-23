import { describe, expect, it } from "vitest";
import {
  assertEditSlugUnchanged,
  parseSubmissionPayload,
  validateSubmissionPayload,
  validateUploadFile
} from "@/lib/content-intake/validate";

describe("content intake validation", () => {
  it("accepts a valid blog create payload", () => {
    const payload = validateSubmissionPayload({
      type: "blog",
      mode: "create",
      autoMerge: true,
      data: {
        title: "Post",
        slug: "post",
        date: "2026-02-16",
        summary: "Summary",
        tags: ["one", "two"],
        draft: false,
        body: "Body"
      }
    });

    expect(payload.type).toBe("blog");
    expect(payload.mode).toBe("create");
  });

  it("rejects publication links that are not absolute or root-relative", () => {
    expect(() =>
      validateSubmissionPayload({
        type: "publication",
        mode: "create",
        autoMerge: true,
        data: {
          title: "Paper",
          slug: "paper",
          authors: ["Author"],
          venue: "Venue",
          year: 2026,
          type: "journal",
          highlight: false,
          draft: false,
          links: {
            pdf: "bad-link"
          },
          body: "Body"
        }
      })
    ).toThrow("Expected an absolute URL or a root-relative path");
  });

  it("rejects slug change attempts in edit mode", () => {
    const payload = validateSubmissionPayload({
      type: "blog",
      mode: "edit",
      id: "old-slug",
      autoMerge: false,
      data: {
        title: "Post",
        slug: "new-slug",
        date: "2026-02-16",
        summary: "Summary",
        tags: [],
        draft: false,
        body: "Body"
      }
    });

    expect(() => assertEditSlugUnchanged(payload)).toThrow("Slug changes are not supported in edit mode");
  });

  it("parses payload JSON and validates upload constraints", () => {
    const payload = parseSubmissionPayload(
      JSON.stringify({
        type: "about",
        mode: "edit",
        id: "about",
        autoMerge: true,
        data: {
          body: "About body"
        }
      })
    );

    expect(payload.type).toBe("about");

    const pdf = new File([new Uint8Array([1, 2, 3])], "test.pdf", { type: "application/pdf" });
    expect(() => validateUploadFile(pdf, "pdf")).not.toThrow();

    const wrongExtension = new File([new Uint8Array([1, 2, 3])], "test.txt", { type: "text/plain" });
    expect(() => validateUploadFile(wrongExtension, "docx")).toThrow("Uploaded file must end with .docx");
  });
});
