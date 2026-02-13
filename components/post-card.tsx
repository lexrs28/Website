import Link from "next/link";
import type { BlogPostFrontmatter } from "@/lib/content/types";

export function PostCard({ post }: { post: BlogPostFrontmatter }) {
  return (
    <article className="card">
      <p className="meta">{new Date(post.date).toLocaleDateString()}</p>
      <h3>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p>{post.summary}</p>
      <p className="tags">{post.tags.join(" • ")}</p>
    </article>
  );
}
