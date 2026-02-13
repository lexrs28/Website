import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Robert Smith for collaborations, speaking, and academic inquiries."
};

export default function ContactPage() {
  return (
    <article className="prose">
      <h1>Contact</h1>
      <p>
        For collaborations, speaking invitations, or student supervision inquiries, email: <strong>{siteConfig.email}</strong>
      </p>
      <p>
        Include a short summary of your topic, timeline, and relevant links so I can respond efficiently.
      </p>
    </article>
  );
}
