import type { Metadata } from "next";
import { UonImageCard } from "@/components/uon-image-card";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to contact Robert Smith for collaborations, speaking, and academic inquiries."
};

export default function ContactPage() {
  return (
    <div className="page-stack">
      <article className="prose">
        <h1>Contact</h1>
        <p>
          For collaborations, speaking invitations, or student supervision inquiries, use the form below.
        </p>
        <p>
          Include a short summary of your topic, timeline, and relevant links so I can respond efficiently.
        </p>
      </article>

      <section className="card contact-form-card" aria-labelledby="contact-form-heading">
        <h2 id="contact-form-heading">Send a message</h2>
        <form className="contact-form">
          <label>
            Name
            <input type="text" name="name" required autoComplete="name" />
          </label>

          <label>
            Email
            <input type="email" name="email" required autoComplete="email" />
          </label>

          <label>
            Subject
            <input type="text" name="subject" required />
          </label>

          <label>
            Message
            <textarea name="message" rows={6} required />
          </label>

          <button type="button">Send message (coming soon)</button>
        </form>
        <p className="meta">
          TODO: Connect this form to a backend endpoint and confirmation workflow.
        </p>
      </section>

      <UonImageCard caption="University of Nottingham" />
    </div>
  );
}
