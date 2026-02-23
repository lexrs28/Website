import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const maxAssetSizeBytes = 10 * 1024 * 1024;

type PublicationType = "journal" | "conference" | "preprint" | "thesis" | "workshop";

type BlogData = {
  title: string;
  slug: string;
  date: string;
  summary: string;
  tags: string[];
  draft: boolean;
  body: string;
};

type PublicationData = {
  title: string;
  slug: string;
  authors: string[];
  venue: string;
  year: number;
  type: PublicationType;
  highlight: boolean;
  draft: boolean;
  links: {
    doi?: string;
    arxiv?: string;
    pdf?: string;
    docx?: string;
    code?: string;
  };
  body: string;
};

type AboutData = {
  body: string;
};

type ProjectsData = {
  cards: Array<{
    title: string;
    description: string;
  }>;
};

export type BlogSubmission =
  | {
      type: "blog";
      mode: "create";
      id?: string;
      autoMerge: boolean;
      data: BlogData;
    }
  | {
      type: "blog";
      mode: "edit";
      id: string;
      autoMerge: boolean;
      data: BlogData;
    };

export type PublicationSubmission =
  | {
      type: "publication";
      mode: "create";
      id?: string;
      autoMerge: boolean;
      data: PublicationData;
    }
  | {
      type: "publication";
      mode: "edit";
      id: string;
      autoMerge: boolean;
      data: PublicationData;
    };

export type AboutSubmission =
  | {
      type: "about";
      mode: "create";
      id?: "about";
      autoMerge: boolean;
      data: AboutData;
    }
  | {
      type: "about";
      mode: "edit";
      id: "about";
      autoMerge: boolean;
      data: AboutData;
    };

export type ProjectsSubmission =
  | {
      type: "projects";
      mode: "create";
      id?: "projects";
      autoMerge: boolean;
      data: ProjectsData;
    }
  | {
      type: "projects";
      mode: "edit";
      id: "projects";
      autoMerge: boolean;
      data: ProjectsData;
    };

export type ValidatedSubmission = BlogSubmission | PublicationSubmission | AboutSubmission | ProjectsSubmission;

export type ContentType = ValidatedSubmission["type"];
export type SubmissionMode = ValidatedSubmission["mode"];

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(slugPattern, "Slug must contain only lowercase letters, numbers, and hyphens");

function parseOptionalString(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function isValidLink(value: string): boolean {
  if (value.startsWith("/")) {
    return true;
  }

  return z.string().url().safeParse(value).success;
}

const optionalLinkSchema = z.preprocess(
  parseOptionalString,
  z
    .string()
    .refine(isValidLink, "Expected an absolute URL or a root-relative path")
    .optional()
);

const optionalStringSchema = z.preprocess(parseOptionalString, z.string().min(1).optional());

const publicationTypeSchema = z.enum(["journal", "conference", "preprint", "thesis", "workshop"]);

const blogDataSchema = z.object({
  title: z.string().trim().min(1),
  slug: slugSchema,
  date: z.string().date(),
  summary: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).default([]),
  draft: z.boolean().default(false),
  body: z.string().trim().min(1)
});

const publicationDataSchema = z.object({
  title: z.string().trim().min(1),
  slug: slugSchema,
  authors: z.array(z.string().trim().min(1)).min(1),
  venue: z.string().trim().min(1),
  year: z.number().int().min(1900),
  type: publicationTypeSchema,
  highlight: z.boolean().default(false),
  draft: z.boolean().default(false),
  links: z
    .object({
      doi: optionalLinkSchema,
      arxiv: optionalLinkSchema,
      pdf: optionalLinkSchema,
      docx: optionalLinkSchema,
      code: optionalLinkSchema
    })
    .default({}),
  body: z.string().trim().min(1)
});

const aboutDataSchema = z.object({
  body: z.string().trim().min(1)
});

const projectsDataSchema = z.object({
  cards: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1)
      })
    )
    .min(1)
});

const blogCreateSubmissionSchema = z.object({
  type: z.literal("blog"),
  mode: z.literal("create"),
  id: optionalStringSchema,
  autoMerge: z.boolean().default(true),
  data: blogDataSchema
});

const blogEditSubmissionSchema = z.object({
  type: z.literal("blog"),
  mode: z.literal("edit"),
  id: slugSchema,
  autoMerge: z.boolean().default(true),
  data: blogDataSchema
});

const publicationCreateSubmissionSchema = z.object({
  type: z.literal("publication"),
  mode: z.literal("create"),
  id: optionalStringSchema,
  autoMerge: z.boolean().default(true),
  data: publicationDataSchema
});

const publicationEditSubmissionSchema = z.object({
  type: z.literal("publication"),
  mode: z.literal("edit"),
  id: slugSchema,
  autoMerge: z.boolean().default(true),
  data: publicationDataSchema
});

const aboutCreateSubmissionSchema = z.object({
  type: z.literal("about"),
  mode: z.literal("create"),
  id: z.literal("about").optional(),
  autoMerge: z.boolean().default(true),
  data: aboutDataSchema
});

const aboutEditSubmissionSchema = z.object({
  type: z.literal("about"),
  mode: z.literal("edit"),
  id: z.literal("about"),
  autoMerge: z.boolean().default(true),
  data: aboutDataSchema
});

const projectsCreateSubmissionSchema = z.object({
  type: z.literal("projects"),
  mode: z.literal("create"),
  id: z.literal("projects").optional(),
  autoMerge: z.boolean().default(true),
  data: projectsDataSchema
});

const projectsEditSubmissionSchema = z.object({
  type: z.literal("projects"),
  mode: z.literal("edit"),
  id: z.literal("projects"),
  autoMerge: z.boolean().default(true),
  data: projectsDataSchema
});

const submissionSchema = z.union([
  blogCreateSubmissionSchema,
  blogEditSubmissionSchema,
  publicationCreateSubmissionSchema,
  publicationEditSubmissionSchema,
  aboutCreateSubmissionSchema,
  aboutEditSubmissionSchema,
  projectsCreateSubmissionSchema,
  projectsEditSubmissionSchema
]);

export function validateSubmissionPayload(payload: unknown): ValidatedSubmission {
  return submissionSchema.parse(payload) as ValidatedSubmission;
}

export function parseSubmissionPayload(payload: string): ValidatedSubmission {
  const parsed = JSON.parse(payload) as unknown;
  return validateSubmissionPayload(parsed);
}

export function assertEditSlugUnchanged(submission: ValidatedSubmission): void {
  if (submission.mode !== "edit") {
    return;
  }

  if (submission.type === "blog" || submission.type === "publication") {
    if (submission.id !== submission.data.slug) {
      throw new Error("Slug changes are not supported in edit mode");
    }
  }
}

export function validateUploadFile(file: File, type: "pdf" | "docx"): void {
  if (file.size > maxAssetSizeBytes) {
    throw new Error(`Uploaded ${type.toUpperCase()} file exceeds 10 MB limit`);
  }

  const normalizedName = file.name.trim().toLowerCase();
  if (!normalizedName.endsWith(`.${type}`)) {
    throw new Error(`Uploaded file must end with .${type}`);
  }
}

export const publicationTypes = publicationTypeSchema.options;
export const MAX_ASSET_SIZE_BYTES = maxAssetSizeBytes;
