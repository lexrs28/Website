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
      <PublicationsList publications={publications} />
    </div>
  );
}
