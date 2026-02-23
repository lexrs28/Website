import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { ContentType } from "@/lib/content-intake/validate";

export const BLOG_CONTENT_DIR = path.join("content", "blog");
export const PUBLICATIONS_CONTENT_DIR = path.join("content", "publications");
export const STATIC_CONTENT_DIR = path.join("content", "static");
export const PUBLICATIONS_ASSET_DIR = path.join("public", "publications");

export type ResolvedRepoPath = {
  absolutePath: string;
  relativePath: string;
};

function mdxRelativePath(directory: string, slug: string): string {
  return path.join(directory, `${slug}.mdx`);
}

async function readDirectoryEntries(directoryPath: string): Promise<string[]> {
  try {
    return await fs.readdir(directoryPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function findMdxBySlug(repoRoot: string, directory: string, slug: string): Promise<ResolvedRepoPath | null> {
  const absoluteDirectory = path.join(repoRoot, directory);
  const entries = await readDirectoryEntries(absoluteDirectory);

  for (const fileName of entries) {
    if (!fileName.endsWith(".mdx")) {
      continue;
    }

    const relativePath = path.join(directory, fileName);
    const absolutePath = path.join(repoRoot, relativePath);
    const source = await fs.readFile(absolutePath, "utf8");
    const parsed = matter(source);
    const frontmatterSlug = typeof parsed.data.slug === "string" ? parsed.data.slug.trim() : undefined;
    const fileSlug = fileName.replace(/\.mdx$/, "");

    if (frontmatterSlug === slug || fileSlug === slug) {
      return {
        absolutePath,
        relativePath
      };
    }
  }

  return null;
}

export function blogRelativePathForSlug(slug: string): string {
  return mdxRelativePath(BLOG_CONTENT_DIR, slug);
}

export function publicationRelativePathForSlug(slug: string): string {
  return mdxRelativePath(PUBLICATIONS_CONTENT_DIR, slug);
}

export function aboutRelativePath(): string {
  return path.join(STATIC_CONTENT_DIR, "about.mdx");
}

export function projectsRelativePath(): string {
  return path.join(STATIC_CONTENT_DIR, "projects.mdx");
}

export function publicationPdfAssetRelativePath(slug: string): string {
  return path.join(PUBLICATIONS_ASSET_DIR, `${slug}.pdf`);
}

export function publicationDocxAssetRelativePath(slug: string): string {
  return path.join(PUBLICATIONS_ASSET_DIR, `${slug}.docx`);
}

export async function findBlogFileBySlug(repoRoot: string, slug: string): Promise<ResolvedRepoPath | null> {
  return findMdxBySlug(repoRoot, BLOG_CONTENT_DIR, slug);
}

export async function findPublicationFileBySlug(repoRoot: string, slug: string): Promise<ResolvedRepoPath | null> {
  return findMdxBySlug(repoRoot, PUBLICATIONS_CONTENT_DIR, slug);
}

export function staticContentRelativePath(type: Extract<ContentType, "about" | "projects">): string {
  return type === "about" ? aboutRelativePath() : projectsRelativePath();
}

export async function pathExists(repoRoot: string, relativePath: string): Promise<boolean> {
  try {
    await fs.access(path.join(repoRoot, relativePath));
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }

    throw error;
  }
}
