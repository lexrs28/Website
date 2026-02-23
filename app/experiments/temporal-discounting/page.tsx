import type { Metadata } from "next";
import { TemporalDiscountingForm } from "@/components/temporal-discounting-form";

export const metadata: Metadata = {
  title: "Temporal Discounting Task",
  description:
    "Participate in a short temporal discounting task on donating sooner versus later, with anonymous demographic capture for exploratory research analysis."
};

export default function TemporalDiscountingPage() {
  return (
    <div className="page-stack">
      <section className="hero">
        <p className="eyebrow">Research Hook</p>
        <h1>Temporal Discounting Task</h1>
        <p>
          Choose whether you would prefer to donate to charity tomorrow or in 3 months, then share a few demographic
          details. This helps test intertemporal prosocial preferences in a lightweight format.
        </p>
      </section>

      <section className="card experiment-shell">
        <h2>Submit Your Response</h2>
        <TemporalDiscountingForm />
      </section>
    </div>
  );
}
