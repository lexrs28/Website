import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { PublicationEntry } from "@/lib/content/types";

const PUBLICATIONS_DIR = path.join(process.cwd(), "content", "publications");

const publicationSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.string()).min(1),
  venue: z.string().min(1),
  year: z.number().int().min(1900),
  type: z.enum(["journal", "conference", "preprint", "thesis", "workshop"]),
  links: z
    .object({
      doi: z.string().url().optional(),
      arxiv: z.string().url().optional(),
      pdf: z.string().url().optional(),
      code: z.string().url().optional()
    })
    .default({}),
  highlight: z.boolean().default(false),
  slug: z.string().optional()
});

function comparePublications(a: PublicationEntry, b: PublicationEntry): number {
  if (b.year !== a.year) {
    return b.year - a.year;
  }
  return a.title.localeCompare(b.title);
}

export async function getAllPublications(): Promise<PublicationEntry[]> {
  const entries = await fs.readdir(PUBLICATIONS_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name);

  const items = await Promise.all(
    files.map(async (fileName) => {
      const source = await fs.readFile(path.join(PUBLICATIONS_DIR, fileName), "utf8");
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
