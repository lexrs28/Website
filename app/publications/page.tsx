import type { Metadata } from "next";
import { PublicationsList } from "@/components/publications-list";
import { getPublishedPublications } from "@/lib/content/publications";

export const metadata: Metadata = {
  title: "Publications",
  description: "Journal articles, conference papers, preprints, and scholarly work."
};

export default async function PublicationsPage() {
  const publications = await getPublishedPublications();

  return (
    <div className="page-stack">
      <h1>Publications</h1>
      <p>
        Recent publications on blood donor behavior, intertemporal altruism, and behavioral-economic predictors of
        donor initiation and retention.
      </p>
      <PublicationsList publications={publications} />
    </div>
  );
}
