export type EditorContentType = "blog" | "publication" | "about" | "projects";
export type EditorMode = "create" | "edit";

export type OptionItem = {
  id: string;
  label: string;
};

export type BlogFormValues = {
  title: string;
  slug: string;
  date: string;
  summary: string;
  tags: string;
  draft: boolean;
  body: string;
};

export type PublicationFormValues = {
  title: string;
  slug: string;
  authors: string;
  venue: string;
  year: string;
  type: "journal" | "conference" | "preprint" | "thesis" | "workshop";
  highlight: boolean;
  draft: boolean;
  doi: string;
  arxiv: string;
  pdf: string;
  docx: string;
  code: string;
  body: string;
};

export type AboutFormValues = {
  body: string;
};

export type ProjectCardValue = {
  title: string;
  description: string;
};

export type ProjectsFormValues = {
  cards: ProjectCardValue[];
};
