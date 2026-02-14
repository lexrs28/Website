import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Biography and research focus on blood donor behavior, intertemporal altruism, and donor retention."
};

export default function AboutPage() {
  return (
    <article className="prose">
      <h1>About</h1>
      <p>
        I am an academic researcher studying prosocial decision-making, with a focus on blood donation behavior,
        donor retention, and intertemporal altruism.
      </p>
      <p>
        My first-authored publications examine who starts donating, who keeps donating, and when people prefer to
        help now versus later.
      </p>
      <h2>First-Authored Research Highlights</h2>
      <ul>
        <li>
          <strong>Intertemporal Altruism (2026, preprint):</strong> In a pre-registered online experiment with 361
          UK adults, most participants preferred earlier prosocial action, with 72% choosing earlier volunteering
          appointments at a one-month horizon and 77% at a six-month horizon.
        </li>
        <li>
          <strong>Who Starts and Who Stays? (2026, preprint):</strong> Using general population (N=1,053) and NHS
          Blood and Transplant donor data (N=2,806), I found that altruism, trust, and risk tolerance distinguish
          current donors from non-donors, while altruism and patience distinguish current from lapsed donors.
        </li>
      </ul>
      <h2>Applied Focus</h2>
      <p>
        I translate these findings into practical recommendations for recruitment and retention strategy, including
        trust-building messaging, risk perception framing, and appointment design that supports sustained donor
        commitment.
      </p>
    </article>
  );
}
