import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { z } from "zod";

const defaultAboutBody = `I am an academic researcher studying prosocial decision-making, with a focus on blood donation behavior,
donor retention, and intertemporal altruism.

My recent publications examine who starts donating, who keeps donating, and when people prefer to
help now versus later.

## Recent Research Highlights

- **Intertemporal Altruism (2026, preprint):** In a pre-registered online experiment with 361 UK adults, most
  participants preferred earlier prosocial action, with 72% choosing earlier volunteering appointments at a
  one-month horizon and 77% at a six-month horizon.
- **Who Starts and Who Stays? (2026, preprint):** Using general population (N=1,053) and NHS Blood and Transplant
  donor data (N=2,806), I found that altruism, trust, and risk tolerance distinguish current donors from non-donors,
  while altruism and patience distinguish current from lapsed donors.

## Applied Focus

I translate these findings into practical recommendations for recruitment and retention strategy, including
trust-building messaging, risk perception framing, and appointment design that supports sustained donor commitment.`;

const defaultProjectCards = [
  {
    title: "Intertemporal Altruism",
    description:
      "Experimental work on how people value the timing of helping behaviors. This project tests when participants prefer to donate blood or volunteer, and how incentive framing changes willingness to reschedule prosocial actions."
  },
  {
    title: "Behavioral-Economic Correlates of Donor Status",
    description:
      "Quantitative analysis of altruism, trust, risk tolerance, and patience to explain donor initiation and retention. The work combines general population and NHS Blood and Transplant donor samples to isolate predictors of current versus lapsed donor status."
  },
  {
    title: "Preference Measurement for Donor Science",
    description:
      "Methodological work on integrating behavioral tasks and self-reports to measure altruism, patience, risk, and trust in donor populations. This stream supports cleaner donor segmentation and more targeted recruitment and retention strategy."
  }
] as const;

const projectsFrontmatterSchema = z.object({
  cards: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1)
      })
    )
    .min(1)
});

export type AboutContent = {
  body: string;
};

export type ProjectsContent = {
  cards: Array<{
    title: string;
    description: string;
  }>;
};

export type StaticContentLoaderOptions = {
  staticDir?: string;
};

function resolveStaticDir(staticDir?: string): string {
  return staticDir ?? path.join(process.cwd(), "content", "static");
}

async function readStaticSource(staticDir: string, fileName: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(staticDir, fileName), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export function createStaticContentLoader(
  options: StaticContentLoaderOptions = {}
): {
  getAboutContent: () => Promise<AboutContent>;
  getProjectsContent: () => Promise<ProjectsContent>;
} {
  const staticDir = resolveStaticDir(options.staticDir);

  async function getAboutContent(): Promise<AboutContent> {
    const source = await readStaticSource(staticDir, "about.mdx");
    if (!source) {
      return { body: defaultAboutBody };
    }

    const { content } = matter(source);
    return {
      body: content.trim() || defaultAboutBody
    };
  }

  async function getProjectsContent(): Promise<ProjectsContent> {
    const source = await readStaticSource(staticDir, "projects.mdx");
    if (!source) {
      return {
        cards: defaultProjectCards.map((item) => ({
          title: item.title,
          description: item.description
        }))
      };
    }

    const { data } = matter(source);
    const parsed = projectsFrontmatterSchema.parse(data);

    return {
      cards: parsed.cards
    };
  }

  return {
    getAboutContent,
    getProjectsContent
  };
}

export async function compileStaticMdx(source: string) {
  const result = await compileMDX({
    source,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm]
      }
    }
  });

  return result.content;
}

const defaultStaticLoader = createStaticContentLoader();

export const getAboutContent = defaultStaticLoader.getAboutContent;
export const getProjectsContent = defaultStaticLoader.getProjectsContent;
