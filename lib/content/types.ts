export type BlogPostFrontmatter = {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  draft: boolean;
  slug: string;
};

export type BlogPost = {
  frontmatter: BlogPostFrontmatter;
  content: string;
};

export type PublicationType =
  | "journal"
  | "conference"
  | "preprint"
  | "thesis"
  | "workshop";

export type PublicationEntry = {
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: PublicationType;
  links: {
    doi?: string;
    arxiv?: string;
    pdf?: string;
    docx?: string;
    code?: string;
  };
  highlight: boolean;
  slug: string;
  content: string;
};
