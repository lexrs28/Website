import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Biography, interests, and current academic focus."
};

export default function AboutPage() {
  return (
    <article className="prose">
      <h1>About</h1>
      <p>
        I am an academic researcher focused on human-centered machine learning, interpretability, and practical
        systems for real-world deployment.
      </p>
      <p>
        My work bridges empirical research and engineering practice, with a focus on how tools are actually used in
        high-stakes environments.
      </p>
    </article>
  );
}
