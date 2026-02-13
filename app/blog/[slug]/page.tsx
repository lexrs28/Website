import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileBlogMdx, getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/content/blog";
import { absoluteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found"
    };
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.summary,
    alternates: {
      canonical: absoluteUrl(`/blog/${post.frontmatter.slug}`)
    },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
      type: "article",
      url: absoluteUrl(`/blog/${post.frontmatter.slug}`)
    }
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const content = await compileBlogMdx(post.content);

  return (
    <article className="prose">
      <p className="meta">{new Date(post.frontmatter.date).toLocaleDateString()}</p>
      <h1>{post.frontmatter.title}</h1>
      <p>{post.frontmatter.summary}</p>
      <hr />
      {content}
    </article>
  );
}
