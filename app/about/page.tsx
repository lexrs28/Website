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
        I am an academic researcher focused on cooperation and prosociality. My work focuses on behavioural economics and how prosocial choices overtime manifest. 
        This work strives to deliver real-world impact.
      </p>
      <p>
        My work bridges theory and application. If you're interested in working with me, please reach out via the contact page.
      </p>
    </article>
  );
}
