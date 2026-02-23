import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { LocalContentAdmin } from "@/components/local-content-admin";
import { isLocalPageRequest } from "@/lib/content-intake/local-guard";

export const metadata: Metadata = {
  title: "Local Content Admin",
  description: "Localhost-only intake panel for content submission and PR creation.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function LocalAdminPage() {
  const headerStore = await headers();

  if (!isLocalPageRequest(headerStore)) {
    notFound();
  }

  return <LocalContentAdmin />;
}
