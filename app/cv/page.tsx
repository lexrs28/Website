import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV",
  description: "Curriculum vitae, positions, education, and contact details."
};

export default function CvPage() {
  return (
    <div className="page-stack">
      <section className="prose">
        <h1>Curriculum Vitae</h1>
        <p>A full CV is available as a downloadable PDF placeholder while content is finalized.</p>
        <p>
          <a href="/cv-placeholder.pdf" download>
            Download CV (PDF)
          </a>
        </p>
      </section>

      <section>
        <h2>Current Position</h2>
        <p>Assistant Professor, Department of Computer Science</p>
      </section>

      <section>
        <h2>Education</h2>
        <ul>
          <li>PhD, Computer Science</li>
          <li>MSc, Human-Computer Interaction</li>
        </ul>
      </section>
    </div>
  );
}
