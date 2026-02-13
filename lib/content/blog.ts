import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import type { BlogPost, BlogPostFrontmatter } from "@/lib/content/types";

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

export type BlogContentLoaderOptions = {
  blogDir?: string;
  nodeEnv?: string;
};

function resolveBlogDir(blogDir?: string): string {
  return blogDir ?? path.join(process.cwd(), "content", "blog");
}

function isProd(nodeEnv?: string): boolean {
  return (nodeEnv ?? process.env.NODE_ENV) === "production";
}

async function readBlogFiles(blogDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(blogDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
      .map((entry) => entry.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
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

export function createBlogContentLoader(
  options: BlogContentLoaderOptions = {}
): {
  getAllBlogPosts: () => Promise<BlogPostFrontmatter[]>;
  getPublishedBlogPosts: () => Promise<BlogPostFrontmatter[]>;
  getBlogPostBySlug: (slug: string) => Promise<BlogPost | null>;
} {
  const blogDir = resolveBlogDir(options.blogDir);

  async function getAllBlogPosts(): Promise<BlogPostFrontmatter[]> {
    const files = await readBlogFiles(blogDir);
    const posts = await Promise.all(
      files.map(async (fileName) => {
        const source = await fs.readFile(path.join(blogDir, fileName), "utf8");
        const { data } = matter(source);
        return coerceFrontmatter(fileName, data);
      })
    );

    return posts.sort(comparePosts);
  }

  async function getPublishedBlogPosts(): Promise<BlogPostFrontmatter[]> {
    const posts = await getAllBlogPosts();
    return posts.filter((post) => !isProd(options.nodeEnv) || !post.draft);
  }

  async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const files = await readBlogFiles(blogDir);

    for (const fileName of files) {
      const source = await fs.readFile(path.join(blogDir, fileName), "utf8");
      const { data, content } = matter(source);
      const frontmatter = coerceFrontmatter(fileName, data);
      if (frontmatter.slug === slug) {
        if (isProd(options.nodeEnv) && frontmatter.draft) {
          return null;
        }
        return { frontmatter, content };
      }
    }

    return null;
  }

  return {
    getAllBlogPosts,
    getPublishedBlogPosts,
    getBlogPostBySlug
  };
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

const defaultBlogLoader = createBlogContentLoader();

export const getAllBlogPosts = defaultBlogLoader.getAllBlogPosts;
export const getPublishedBlogPosts = defaultBlogLoader.getPublishedBlogPosts;
export const getBlogPostBySlug = defaultBlogLoader.getBlogPostBySlug;
