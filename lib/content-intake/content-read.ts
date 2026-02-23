import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { getAllBlogPosts } from "@/lib/content/blog";
import { getAllPublications } from "@/lib/content/publications";
import {
  aboutRelativePath,
  findBlogFileBySlug,
  findPublicationFileBySlug,
  projectsRelativePath
} from "@/lib/content-intake/paths";
import type { ContentType } from "@/lib/content-intake/validate";

export type ContentOption = {
  id: string;
  label: string;
};

export async function listContentOptions(type: ContentType): Promise<ContentOption[]> {
  switch (type) {
    case "blog": {
      const posts = await getAllBlogPosts();
      return posts.map((post) => ({
        id: post.slug,
        label: `${post.title} (${post.slug})`
      }));
    }
    case "publication": {
      const publications = await getAllPublications();
      return publications.map((publication) => ({
        id: publication.slug,
        label: `${publication.title} (${publication.slug})`
      }));
    }
    case "about":
      return [{ id: "about", label: "About narrative" }];
    case "projects":
      return [{ id: "projects", label: "Projects cards" }];
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`Unsupported content type: ${String(exhaustiveCheck)}`);
    }
  }
}

async function readSourceFromRelativePath(repoRoot: string, relativePath: string): Promise<string> {
  const absolutePath = path.join(repoRoot, relativePath);
  return fs.readFile(absolutePath, "utf8");
}

export async function getBlogItem(repoRoot: string, slug: string): Promise<{
  id: string;
  data: {
    title: string;
    slug: string;
    date: string;
    summary: string;
    tags: string[];
    draft: boolean;
    body: string;
  };
} | null> {
  const target = await findBlogFileBySlug(repoRoot, slug);
  if (!target) {
    return null;
  }

  const source = await readSourceFromRelativePath(repoRoot, target.relativePath);
  const parsed = matter(source);

  return {
    id: slug,
    data: {
      title: String(parsed.data.title ?? ""),
      slug: String(parsed.data.slug ?? slug),
      date: String(parsed.data.date ?? ""),
      summary: String(parsed.data.summary ?? ""),
      tags: Array.isArray(parsed.data.tags)
        ? parsed.data.tags.map((item) => String(item)).filter((item) => item.trim().length > 0)
        : [],
      draft: Boolean(parsed.data.draft),
      body: parsed.content.trim()
    }
  };
}

export async function getPublicationItem(repoRoot: string, slug: string): Promise<{
  id: string;
  data: {
    title: string;
    slug: string;
    authors: string[];
    venue: string;
    year: number;
    type: string;
    highlight: boolean;
    draft: boolean;
    links: {
      doi?: string;
      arxiv?: string;
      pdf?: string;
      docx?: string;
      code?: string;
    };
    body: string;
  };
} | null> {
  const target = await findPublicationFileBySlug(repoRoot, slug);
  if (!target) {
    return null;
  }

  const source = await readSourceFromRelativePath(repoRoot, target.relativePath);
  const parsed = matter(source);
  const rawLinks = typeof parsed.data.links === "object" && parsed.data.links !== null ? parsed.data.links : {};

  return {
    id: slug,
    data: {
      title: String(parsed.data.title ?? ""),
      slug: String(parsed.data.slug ?? slug),
      authors: Array.isArray(parsed.data.authors)
        ? parsed.data.authors.map((item) => String(item)).filter((item) => item.trim().length > 0)
        : [],
      venue: String(parsed.data.venue ?? ""),
      year: Number(parsed.data.year ?? 0),
      type: String(parsed.data.type ?? ""),
      highlight: Boolean(parsed.data.highlight),
      draft: Boolean(parsed.data.draft),
      links: {
        doi: typeof rawLinks.doi === "string" ? rawLinks.doi : undefined,
        arxiv: typeof rawLinks.arxiv === "string" ? rawLinks.arxiv : undefined,
        pdf: typeof rawLinks.pdf === "string" ? rawLinks.pdf : undefined,
        docx: typeof rawLinks.docx === "string" ? rawLinks.docx : undefined,
        code: typeof rawLinks.code === "string" ? rawLinks.code : undefined
      },
      body: parsed.content.trim()
    }
  };
}

export async function getAboutItem(repoRoot: string): Promise<{
  id: "about";
  data: {
    body: string;
  };
}> {
  const source = await readSourceFromRelativePath(repoRoot, aboutRelativePath());
  const parsed = matter(source);
  return {
    id: "about",
    data: {
      body: parsed.content.trim()
    }
  };
}

export async function getProjectsItem(repoRoot: string): Promise<{
  id: "projects";
  data: {
    cards: Array<{
      title: string;
      description: string;
    }>;
  };
}> {
  const source = await readSourceFromRelativePath(repoRoot, projectsRelativePath());
  const parsed = matter(source);
  const cards = Array.isArray(parsed.data.cards)
    ? parsed.data.cards
        .map((card) => {
          if (!card || typeof card !== "object") {
            return null;
          }

          const title = typeof card.title === "string" ? card.title.trim() : "";
          const description = typeof card.description === "string" ? card.description.trim() : "";

          if (!title || !description) {
            return null;
          }

          return {
            title,
            description
          };
        })
        .filter((card): card is { title: string; description: string } => card !== null)
    : [];

  return {
    id: "projects",
    data: {
      cards
    }
  };
}

export async function getContentItem(repoRoot: string, type: ContentType, id: string): Promise<{ id: string; data: unknown } | null> {
  switch (type) {
    case "blog":
      return getBlogItem(repoRoot, id);
    case "publication":
      return getPublicationItem(repoRoot, id);
    case "about":
      return id === "about" ? getAboutItem(repoRoot) : null;
    case "projects":
      return id === "projects" ? getProjectsItem(repoRoot) : null;
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`Unsupported content type: ${String(exhaustiveCheck)}`);
    }
  }
}
