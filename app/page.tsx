import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getPublishedBlogPosts } from "@/lib/content/blog";
import { getAllPublications } from "@/lib/content/publications";

export default async function HomePage() {
  const [posts, publications] = await Promise.all([getPublishedBlogPosts(), getAllPublications()]);

  const latestPosts = posts.slice(0, 3);
  const selectedPapers = publications.filter((item) => item.highlight).slice(0, 3);

  return (
    <div className="page-stack">
      <section className="hero">
        <p className="eyebrow">Academic Website</p>
        <h1>Research, Publications, and Notes</h1>
        <p>
          I study human-centered systems, publish across AI and design, and share practical writing from active
          projects.
        </p>
      </section>

      <section>
        <div className="section-head">
          <h2>Selected Publications</h2>
          <Link href="/publications">View all</Link>
        </div>
        <ul className="stack-list">
          {selectedPapers.map((paper) => (
            <li key={paper.slug} className="card publication-card">
              <p className="meta">
                {paper.year} • {paper.type}
              </p>
              <h3>{paper.title}</h3>
              <p>{paper.authors.join(", ")}</p>
              <p>{paper.venue}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="section-head">
          <h2>Latest Posts</h2>
          <Link href="/blog">View all</Link>
        </div>
        <div className="grid posts-grid">
          {latestPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
