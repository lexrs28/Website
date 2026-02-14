import type { Metadata } from "next";
import { DictatorGameForm } from "@/components/dictator-game-form";

export const metadata: Metadata = {
  title: "Dictator Game Experiment",
  description:
    "Participate in a short dictator game and submit anonymous demographics for exploratory research analysis."
};

export default function DictatorGamePage() {
  return (
    <div className="page-stack">
      <section className="hero">
        <p className="eyebrow">Research Hook</p>
        <h1>Dictator Game</h1>
        <p>
          Imagine you receive $100 and can give any amount in $5 steps to an anonymous participant. Record your
          decision and a few demographic details. This helps test miscellaneous behavioral ideas quickly.
        </p>
      </section>

      <section className="card experiment-shell">
        <h2>Submit Your Response</h2>
        <DictatorGameForm />
      </section>
    </div>
  );
}
