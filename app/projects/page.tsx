import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Current and past research projects."
};

export default function ProjectsPage() {
  return (
    <div className="page-stack">
      <h1>Projects</h1>
      <section className="card">
        <h2>Project Atlas</h2>
        <p>Interactive tools for studying how experts validate model outputs in operational settings.</p>
      </section>
      <section className="card">
        <h2>Open Methods Notebook</h2>
        <p>Reusable evaluation templates and transparent reporting practices for applied AI research.</p>
      </section>
      <section className="card">
        <h2>Collaborative Annotation Studio</h2>
        <p>A lightweight framework for reproducible, team-based qualitative annotation workflows.</p>
      </section>
    </div>
  );
}
