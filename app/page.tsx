import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getPublishedBlogPosts } from "@/lib/content/blog";
import { getAllPublications } from "@/lib/content/publications";

const prioritizedFeaturedSlugs = [
  "intertemporal-altruism-temporal-preferences-prosocial-behavior",
  "who-starts-and-who-stays-behavioral-economic-correlates"
] as const;
const featuredOrder = new Map<string, number>(prioritizedFeaturedSlugs.map((slug, index) => [slug, index]));
const firstAuthoredHighlights = [
  {
    title: "Intertemporal Altruism",
    detail:
      "A pre-registered experiment (N=361, UK) found strong preference for helping sooner: 72% chose earlier volunteering appointments at one month and 77% at six months."
  },
  {
    title: "Who Starts and Who Stays?",
    detail:
      "Across a general population sample and NHS Blood and Transplant donor data (N=1,053 and N=2,806), altruism, trust, and risk tolerance were linked to donor status, while patience and altruism were linked to donor retention."
  }
] as const;

export default async function HomePage() {
  const [posts, publications] = await Promise.all([getPublishedBlogPosts(), getAllPublications()]);

  const latestPosts = posts.slice(0, 3);
  const selectedPapers = publications
    .filter((item) => item.highlight)
    .sort((a, b) => {
      const normalizedAPriority = featuredOrder.get(a.slug) ?? Number.POSITIVE_INFINITY;
      const normalizedBPriority = featuredOrder.get(b.slug) ?? Number.POSITIVE_INFINITY;

      if (normalizedAPriority !== normalizedBPriority) {
        return normalizedAPriority - normalizedBPriority;
      }

      if (b.year !== a.year) {
        return b.year - a.year;
      }

      return a.title.localeCompare(b.title);
    })
    .slice(0, 3);

  return (
    <div className="page-stack">
      <section className="hero">
        <p className="eyebrow">Academic Website</p>
        <p className="hero-name">Dr. Robert Smith</p>
        <h1>Research, Publications, and Notes</h1>
        <p>
          I study blood donor behavior and intertemporal altruism, with a focus on why people start donating, stay
          active, and choose to help now versus later.
        </p>
      </section>

      <section>
        <div className="section-head">
          <h2>First-Authored Findings</h2>
          <Link href="/about">More context</Link>
        </div>
        <ul className="stack-list">
          {firstAuthoredHighlights.map((item) => (
            <li key={item.title} className="card publication-card">
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </li>
          ))}
        </ul>
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

      <section className="card experiment-cta">
        <p className="eyebrow">Participate</p>
        <h2>Dictator Game Experiment</h2>
        <p>
          Contribute one anonymous response to a $100 split decision plus demographics. We use this as a lightweight
          data hook for testing behavioral ideas.
        </p>
        <p>
          <Link href="/experiments/dictator-game">Open the experiment</Link>
        </p>
      </section>
    </div>
  );
}
