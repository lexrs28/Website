import type { Metadata } from "next";
import { UonImageCard } from "@/components/uon-image-card";
import { compileStaticMdx, getAboutContent } from "@/lib/content/static";

export const metadata: Metadata = {
  title: "About",
  description:
    "Biography and research focus on blood donor behavior, intertemporal altruism, and donor retention."
};

export default async function AboutPage() {
  const about = await getAboutContent();
  const narrative = await compileStaticMdx(about.body);

  return (
    <div className="page-stack">
      <article className="prose">
        <h1>About</h1>
        {narrative}
      </article>
      <UonImageCard caption="Current academic position: University of Nottingham" />
    </div>
  );
}
