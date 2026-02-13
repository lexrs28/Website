import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import type { BlogPost, BlogPostFrontmatter } from "@/lib/content/types";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

const blogFrontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.string().date(),
  summary: z.string().min(1),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  slug: z.string().optional()
});

function comparePosts(a: BlogPostFrontmatter, b: BlogPostFrontmatter): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

async function readBlogFiles(): Promise<string[]> {
  const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name);
}

function coerceFrontmatter(fileName: string, data: unknown): BlogPostFrontmatter {
  const parsed = blogFrontmatterSchema.parse(data);
  const baseSlug = fileName.replace(/\.mdx$/, "");
  return {
    title: parsed.title,
    date: parsed.date,
    summary: parsed.summary,
    tags: parsed.tags,
    draft: parsed.draft,
    slug: parsed.slug ?? baseSlug
  };
}

export async function getAllBlogPosts(): Promise<BlogPostFrontmatter[]> {
  const files = await readBlogFiles();
  const posts = await Promise.all(
    files.map(async (fileName) => {
      const source = await fs.readFile(path.join(BLOG_DIR, fileName), "utf8");
      const { data } = matter(source);
      return coerceFrontmatter(fileName, data);
    })
  );

  return posts.sort(comparePosts);
}

export async function getPublishedBlogPosts(): Promise<BlogPostFrontmatter[]> {
  const posts = await getAllBlogPosts();
  return posts.filter((post) => !isProd() || !post.draft);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const files = await readBlogFiles();

  for (const fileName of files) {
    const source = await fs.readFile(path.join(BLOG_DIR, fileName), "utf8");
    const { data, content } = matter(source);
    const frontmatter = coerceFrontmatter(fileName, data);
    if (frontmatter.slug === slug) {
      if (isProd() && frontmatter.draft) {
        return null;
      }
      return { frontmatter, content };
    }
  }

  return null;
}

export async function compileBlogMdx(source: string) {
  const result = await compileMDX({
    source,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm]
      }
    }
  });

  return result.content;
}
