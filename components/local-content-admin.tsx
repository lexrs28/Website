"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AboutForm } from "@/components/local-content/about-form";
import { BlogForm } from "@/components/local-content/blog-form";
import { ProjectsForm } from "@/components/local-content/projects-form";
import { PublicationForm } from "@/components/local-content/publication-form";
import type {
  AboutFormValues,
  BlogFormValues,
  EditorContentType,
  EditorMode,
  OptionItem,
  ProjectsFormValues,
  PublicationFormValues
} from "@/components/local-content/types";

const contentTypeLabels: Record<EditorContentType, string> = {
  blog: "Blog",
  publication: "Publication",
  about: "About",
  projects: "Projects"
};

const defaultBlogValues: BlogFormValues = {
  title: "",
  slug: "",
  date: "",
  summary: "",
  tags: "",
  draft: false,
  body: ""
};

const defaultPublicationValues: PublicationFormValues = {
  title: "",
  slug: "",
  authors: "",
  venue: "",
  year: String(new Date().getFullYear()),
  type: "journal",
  highlight: false,
  draft: false,
  doi: "",
  arxiv: "",
  pdf: "",
  docx: "",
  code: "",
  body: ""
};

const defaultAboutValues: AboutFormValues = {
  body: ""
};

const defaultProjectsValues: ProjectsFormValues = {
  cards: [{ title: "", description: "" }]
};

type SubmitSuccess = {
  pullRequestUrl: string;
  branchName: string;
  pullRequestNumber: number;
};

export function LocalContentAdmin() {
  const [contentType, setContentType] = useState<EditorContentType>("blog");
  const [mode, setMode] = useState<EditorMode>("create");
  const [autoMerge, setAutoMerge] = useState(true);
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingItem, setIsLoadingItem] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SubmitSuccess | null>(null);

  const [blogValues, setBlogValues] = useState<BlogFormValues>(defaultBlogValues);
  const [publicationValues, setPublicationValues] = useState<PublicationFormValues>(defaultPublicationValues);
  const [aboutValues, setAboutValues] = useState<AboutFormValues>(defaultAboutValues);
  const [projectsValues, setProjectsValues] = useState<ProjectsFormValues>(defaultProjectsValues);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [docxFile, setDocxFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setIsLoadingOptions(true);
      setError(null);

      try {
        const response = await fetch(`/api/local-content/options?type=${contentType}`);
        const payload = (await response.json()) as { items?: OptionItem[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load content options");
        }

        if (cancelled) {
          return;
        }

        const nextOptions = payload.items ?? [];
        setOptions(nextOptions);

        if (mode === "edit") {
          setSelectedId((current) => {
            if (current && nextOptions.some((item) => item.id === current)) {
              return current;
            }
            return nextOptions[0]?.id ?? "";
          });
        }
      } catch (requestError) {
        if (!cancelled) {
          setOptions([]);
          setSelectedId("");
          setError(requestError instanceof Error ? requestError.message : "Failed to load options");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOptions(false);
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [contentType, mode]);

  useEffect(() => {
    if (mode !== "edit") {
      return;
    }

    if (!selectedId) {
      return;
    }

    let cancelled = false;

    async function loadItem() {
      setIsLoadingItem(true);
      setError(null);

      try {
        const response = await fetch(`/api/local-content/item?type=${contentType}&id=${encodeURIComponent(selectedId)}`);
        const payload = (await response.json()) as { data?: unknown; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load selected item");
        }

        if (cancelled || !payload.data || typeof payload.data !== "object") {
          return;
        }

        if (contentType === "blog") {
          const data = payload.data as {
            title: string;
            slug: string;
            date: string;
            summary: string;
            tags: string[];
            draft: boolean;
            body: string;
          };
          setBlogValues({
            title: data.title,
            slug: data.slug,
            date: data.date,
            summary: data.summary,
            tags: data.tags.join(", "),
            draft: data.draft,
            body: data.body
          });
        }

        if (contentType === "publication") {
          const data = payload.data as {
            title: string;
            slug: string;
            authors: string[];
            venue: string;
            year: number;
            type: PublicationFormValues["type"];
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

          setPublicationValues({
            title: data.title,
            slug: data.slug,
            authors: data.authors.join(", "),
            venue: data.venue,
            year: String(data.year),
            type: data.type,
            highlight: data.highlight,
            draft: data.draft,
            doi: data.links.doi ?? "",
            arxiv: data.links.arxiv ?? "",
            pdf: data.links.pdf ?? "",
            docx: data.links.docx ?? "",
            code: data.links.code ?? "",
            body: data.body
          });
        }

        if (contentType === "about") {
          const data = payload.data as { body: string };
          setAboutValues({ body: data.body });
        }

        if (contentType === "projects") {
          const data = payload.data as {
            cards: Array<{
              title: string;
              description: string;
            }>;
          };
          setProjectsValues({
            cards: data.cards.length > 0 ? data.cards : [{ title: "", description: "" }]
          });
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Failed to load selected item");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingItem(false);
        }
      }
    }

    void loadItem();

    return () => {
      cancelled = true;
    };
  }, [contentType, mode, selectedId]);

  const selectedLabel = useMemo(() => contentTypeLabels[contentType], [contentType]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        type: contentType,
        mode,
        id: mode === "edit" ? selectedId : undefined,
        autoMerge,
        data:
          contentType === "blog"
            ? {
                title: blogValues.title,
                slug: blogValues.slug,
                date: blogValues.date,
                summary: blogValues.summary,
                tags: blogValues.tags
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item.length > 0),
                draft: blogValues.draft,
                body: blogValues.body
              }
            : contentType === "publication"
              ? {
                  title: publicationValues.title,
                  slug: publicationValues.slug,
                  authors: publicationValues.authors
                    .split(",")
                    .map((item) => item.trim())
                    .filter((item) => item.length > 0),
                  venue: publicationValues.venue,
                  year: Number(publicationValues.year),
                  type: publicationValues.type,
                  highlight: publicationValues.highlight,
                  draft: publicationValues.draft,
                  links: {
                    doi: publicationValues.doi,
                    arxiv: publicationValues.arxiv,
                    pdf: publicationValues.pdf,
                    docx: publicationValues.docx,
                    code: publicationValues.code
                  },
                  body: publicationValues.body
                }
              : contentType === "about"
                ? {
                    body: aboutValues.body
                  }
                : {
                    cards: projectsValues.cards
                  }
      };

      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      if (contentType === "publication") {
        if (pdfFile) {
          formData.append("pdfFile", pdfFile);
        }

        if (docxFile) {
          formData.append("docxFile", docxFile);
        }
      }

      const response = await fetch("/api/local-content/submit", {
        method: "POST",
        body: formData
      });

      const responsePayload = (await response.json()) as {
        pullRequestUrl?: string;
        pullRequestNumber?: number;
        branchName?: string;
        error?: string;
      };

      if (!response.ok || !responsePayload.pullRequestUrl || !responsePayload.pullRequestNumber || !responsePayload.branchName) {
        throw new Error(responsePayload.error ?? "Submission failed");
      }

      setPdfFile(null);
      setDocxFile(null);
      setSuccess({
        pullRequestUrl: responsePayload.pullRequestUrl,
        pullRequestNumber: responsePayload.pullRequestNumber,
        branchName: responsePayload.branchName
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit content");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-stack">
      <div className="card intake-admin-head">
        <h1>Local Content Intake</h1>
        <p className="meta">Create and edit content, then open one PR per submission.</p>
      </div>

      <form className="card intake-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Content type
            <select
              value={contentType}
              onChange={(event) => {
                const nextType = event.target.value as EditorContentType;
                setContentType(nextType);
                if (nextType === "about" || nextType === "projects") {
                  setMode("edit");
                }
                setSuccess(null);
                setError(null);
                setPdfFile(null);
                setDocxFile(null);
              }}
              disabled={isSubmitting}
            >
              {Object.entries(contentTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Mode
            <select
              value={mode}
              onChange={(event) => {
                setMode(event.target.value as EditorMode);
                setSuccess(null);
                setError(null);
              }}
              disabled={isSubmitting}
            >
              <option value="create">Create</option>
              <option value="edit">Edit</option>
            </select>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={autoMerge}
              onChange={(event) => setAutoMerge(event.target.checked)}
              disabled={isSubmitting}
            />
            Auto-merge (squash) when checks pass
          </label>
        </div>

        {mode === "edit" && (
          <label>
            Select {selectedLabel}
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              disabled={isSubmitting || isLoadingOptions || options.length === 0}
            >
              {options.length === 0 ? (
                <option value="">No items found</option>
              ) : (
                options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </label>
        )}

        {contentType === "blog" && <BlogForm value={blogValues} onChange={setBlogValues} disabled={isSubmitting || isLoadingItem} />}

        {contentType === "publication" && (
          <PublicationForm
            value={publicationValues}
            onChange={setPublicationValues}
            onPdfFileChange={setPdfFile}
            onDocxFileChange={setDocxFile}
            pdfFileName={pdfFile?.name}
            docxFileName={docxFile?.name}
            disabled={isSubmitting || isLoadingItem}
          />
        )}

        {contentType === "about" && <AboutForm value={aboutValues} onChange={setAboutValues} disabled={isSubmitting || isLoadingItem} />}

        {contentType === "projects" && (
          <ProjectsForm value={projectsValues} onChange={setProjectsValues} disabled={isSubmitting || isLoadingItem} />
        )}

        {error && <p className="form-message form-message-error">{error}</p>}

        {success && (
          <p className="form-message">
            PR #{success.pullRequestNumber} opened on branch <code>{success.branchName}</code>. <a href={success.pullRequestUrl}>Open PR</a>
          </p>
        )}

        <button type="submit" disabled={isSubmitting || isLoadingItem || (mode === "edit" && !selectedId)}>
          {isSubmitting ? "Submitting..." : `Submit ${selectedLabel}`}
        </button>
      </form>
    </section>
  );
}
