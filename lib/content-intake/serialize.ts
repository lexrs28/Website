import matter from "gray-matter";
import type {
  AboutSubmission,
  BlogSubmission,
  ProjectsSubmission,
  PublicationSubmission,
  ValidatedSubmission
} from "@/lib/content-intake/validate";

function ensureTerminalNewline(value: string): string {
  return value.endsWith("\n") ? value : `${value}\n`;
}

function pruneUndefined<T extends Record<string, string | undefined>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === "string")) as Partial<T>;
}

export function serializeBlogMdx(data: BlogSubmission["data"]): string {
  return matter.stringify(ensureTerminalNewline(data.body), {
    title: data.title,
    date: data.date,
    summary: data.summary,
    tags: data.tags,
    draft: data.draft,
    slug: data.slug
  });
}

export function serializePublicationMdx(data: PublicationSubmission["data"]): string {
  return matter.stringify(ensureTerminalNewline(data.body), {
    title: data.title,
    authors: data.authors,
    venue: data.venue,
    year: data.year,
    type: data.type,
    links: pruneUndefined({
      doi: data.links.doi,
      arxiv: data.links.arxiv,
      pdf: data.links.pdf,
      docx: data.links.docx,
      code: data.links.code
    }),
    highlight: data.highlight,
    draft: data.draft,
    slug: data.slug
  });
}

export function serializeAboutMdx(data: AboutSubmission["data"]): string {
  return matter.stringify(ensureTerminalNewline(data.body), {
    title: "About Narrative"
  });
}

export function serializeProjectsMdx(data: ProjectsSubmission["data"]): string {
  return matter.stringify("", {
    cards: data.cards
  });
}

export function serializeSubmission(submission: ValidatedSubmission): string {
  switch (submission.type) {
    case "blog":
      return serializeBlogMdx(submission.data);
    case "publication":
      return serializePublicationMdx(submission.data);
    case "about":
      return serializeAboutMdx(submission.data);
    case "projects":
      return serializeProjectsMdx(submission.data);
    default: {
      const exhaustiveCheck: never = submission;
      throw new Error(`Unsupported submission type: ${String(exhaustiveCheck)}`);
    }
  }
}
