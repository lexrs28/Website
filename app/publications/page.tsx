import type { Metadata } from "next";
import { PublicationsList } from "@/components/publications-list";
import { getAllPublications } from "@/lib/content/publications";

export const metadata: Metadata = {
  title: "Publications",
  description: "Journal articles, conference papers, preprints, and scholarly work."
};

export default async function PublicationsPage() {
  const publications = await getAllPublications();

  return (
    <div className="page-stack">
      <h1>Publications</h1>
      <p>
        This work centers on first-authored studies of blood donor behavior, including intertemporal altruism and
        behavioral-economic predictors of donor initiation and retention.
      </p>
      <PublicationsList publications={publications} />
    </div>
  );
}
