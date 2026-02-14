import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Current and past research projects on blood donor behavior and prosocial decision-making."
};

export default function ProjectsPage() {
  return (
    <div className="page-stack">
      <h1>Projects</h1>
      <section className="card">
        <h2>Intertemporal Altruism</h2>
        <p>
          Experimental work on how people value the timing of helping behaviors. This project tests when participants
          prefer to donate blood or volunteer, and how incentive framing changes willingness to reschedule prosocial
          actions.
        </p>
      </section>
      <section className="card">
        <h2>Behavioral-Economic Correlates of Donor Status</h2>
        <p>
          Quantitative analysis of altruism, trust, risk tolerance, and patience to explain donor initiation and
          retention. The work combines general population and NHS Blood and Transplant donor samples to isolate
          predictors of current versus lapsed donor status.
        </p>
      </section>
      <section className="card">
        <h2>Preference Measurement for Donor Science</h2>
        <p>
          Methodological work on integrating behavioral tasks and self-reports to measure altruism, patience, risk,
          and trust in donor populations. This stream supports cleaner donor segmentation and more targeted
          recruitment and retention strategy.
        </p>
      </section>
    </div>
  );
}
