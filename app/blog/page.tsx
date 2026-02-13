import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { getPublishedBlogPosts } from "@/lib/content/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Research notes, essays, and practical reflections."
};

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="page-stack">
      <h1>Blog</h1>
      <div className="grid posts-grid">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
