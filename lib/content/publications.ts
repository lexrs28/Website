import fs from "node:fs/promises";
import type { Dirent } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { PublicationEntry } from "@/lib/content/types";

function isValidLink(value: string): boolean {
  if (value.startsWith("/")) {
    return true;
  }
  return z.string().url().safeParse(value).success;
}

const linkSchema = z.string().refine(isValidLink, {
  message: "Expected an absolute URL or a root-relative path"
});

const publicationSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.string()).min(1),
  venue: z.string().min(1),
  year: z.number().int().min(1900),
  type: z.enum(["journal", "conference", "preprint", "thesis", "workshop"]),
  links: z
    .object({
      doi: linkSchema.optional(),
      arxiv: linkSchema.optional(),
      pdf: linkSchema.optional(),
      docx: linkSchema.optional(),
      code: linkSchema.optional()
    })
    .default({}),
  highlight: z.boolean().default(false),
  draft: z.boolean().default(false),
  slug: z.string().optional()
});

function comparePublications(a: PublicationEntry, b: PublicationEntry): number {
  if (b.year !== a.year) {
    return b.year - a.year;
  }
  return a.title.localeCompare(b.title);
}

export type PublicationsContentLoaderOptions = {
  publicationsDir?: string;
  nodeEnv?: string;
};

function resolvePublicationsDir(publicationsDir?: string): string {
  return publicationsDir ?? path.join(process.cwd(), "content", "publications");
}

function isProd(nodeEnv?: string): boolean {
  return (nodeEnv ?? process.env.NODE_ENV) === "production";
}

export function createPublicationsContentLoader(
  options: PublicationsContentLoaderOptions = {}
): {
  getAllPublications: () => Promise<PublicationEntry[]>;
  getPublishedPublications: () => Promise<PublicationEntry[]>;
} {
  const publicationsDir = resolvePublicationsDir(options.publicationsDir);

  async function getAllPublications(): Promise<PublicationEntry[]> {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(publicationsDir, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw error;
    }
    const files = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
      .map((entry) => entry.name);

    const items = await Promise.all(
      files.map(async (fileName) => {
        const source = await fs.readFile(path.join(publicationsDir, fileName), "utf8");
        const { data, content } = matter(source);
        const parsed = publicationSchema.parse(data);
        return {
          ...parsed,
          slug: parsed.slug ?? fileName.replace(/\.mdx$/, ""),
          content
        } satisfies PublicationEntry;
      })
    );

    return items.sort(comparePublications);
  }

  async function getPublishedPublications(): Promise<PublicationEntry[]> {
    const items = await getAllPublications();
    return items.filter((item) => !isProd(options.nodeEnv) || !item.draft);
  }

  return {
    getAllPublications,
    getPublishedPublications
  };
}

const defaultPublicationsLoader = createPublicationsContentLoader();

export const getAllPublications = defaultPublicationsLoader.getAllPublications;
export const getPublishedPublications = defaultPublicationsLoader.getPublishedPublications;
