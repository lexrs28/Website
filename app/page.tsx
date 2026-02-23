import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getPublishedBlogPosts } from "@/lib/content/blog";
import { getPublishedPublications } from "@/lib/content/publications";

export default async function HomePage() {
  const [posts, publications] = await Promise.all([getPublishedBlogPosts(), getPublishedPublications()]);

  const latestPosts = posts.slice(0, 3);
  const recentPublications = publications
    .filter((item) => !/supplementary materials/i.test(item.title))
    .slice(0, 3);

  return (
    <div className="page-stack">
      <section className="hero">
        <p className="eyebrow">Personal Academic Site</p>
        <p className="hero-name">Dr. Robert Smith</p>
        <h1>Research, Publications, and Notes</h1>
        <p>
          I study blood donor behavior and intertemporal altruism, with a focus on why people start donating, stay
          active, and choose to help now versus later.
        </p>
      </section>

      <section>
        <div className="section-head">
          <h2>Recent Publications</h2>
          <Link href="/publications">View all</Link>
        </div>
        <ul className="stack-list">
          {recentPublications.map((paper) => (
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

      <section className="card experiment-cta">
        <p className="eyebrow">Participate</p>
        <h2>Temporal Discounting Task</h2>
        <p>
          Contribute one anonymous response on whether to donate to charity tomorrow or in 3 months, plus demographics.
          We use this as a lightweight data hook for testing behavioral ideas.
        </p>
        <p>
          <Link href="/experiments/temporal-discounting">Open the experiment</Link>
        </p>
      </section>
    </div>
  );
}
