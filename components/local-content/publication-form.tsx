"use client";

import type { PublicationFormValues } from "@/components/local-content/types";

const publicationTypes: PublicationFormValues["type"][] = ["journal", "conference", "preprint", "thesis", "workshop"];

type PublicationFormProps = {
  value: PublicationFormValues;
  onChange: (next: PublicationFormValues) => void;
  onPdfFileChange: (file: File | null) => void;
  onDocxFileChange: (file: File | null) => void;
  pdfFileName?: string;
  docxFileName?: string;
  disabled?: boolean;
};

export function PublicationForm({
  value,
  onChange,
  onPdfFileChange,
  onDocxFileChange,
  pdfFileName,
  docxFileName,
  disabled = false
}: PublicationFormProps) {
  function update<Key extends keyof PublicationFormValues>(key: Key, nextValue: PublicationFormValues[Key]) {
    onChange({
      ...value,
      [key]: nextValue
    });
  }

  return (
    <div className="intake-form-stack">
      <div className="form-grid">
        <label>
          Title
          <input
            type="text"
            value={value.title}
            onChange={(event) => update("title", event.target.value)}
            required
            disabled={disabled}
          />
        </label>

        <label>
          Slug
          <input
            type="text"
            value={value.slug}
            onChange={(event) => update("slug", event.target.value)}
            required
            disabled={disabled}
          />
        </label>

        <label>
          Authors (comma separated)
          <input
            type="text"
            value={value.authors}
            onChange={(event) => update("authors", event.target.value)}
            required
            disabled={disabled}
          />
        </label>

        <label>
          Venue
          <input
            type="text"
            value={value.venue}
            onChange={(event) => update("venue", event.target.value)}
            required
            disabled={disabled}
          />
        </label>

        <label>
          Year
          <input
            type="number"
            min={1900}
            value={value.year}
            onChange={(event) => update("year", event.target.value)}
            required
            disabled={disabled}
          />
        </label>

        <label>
          Type
          <select value={value.type} onChange={(event) => update("type", event.target.value as PublicationFormValues["type"])} disabled={disabled}>
            {publicationTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-grid">
        <label>
          DOI
          <input
            type="text"
            value={value.doi}
            onChange={(event) => update("doi", event.target.value)}
            placeholder="https://doi.org/..."
            disabled={disabled}
          />
        </label>

        <label>
          arXiv
          <input
            type="text"
            value={value.arxiv}
            onChange={(event) => update("arxiv", event.target.value)}
            placeholder="https://arxiv.org/..."
            disabled={disabled}
          />
        </label>

        <label>
          Code
          <input
            type="text"
            value={value.code}
            onChange={(event) => update("code", event.target.value)}
            placeholder="https://github.com/..."
            disabled={disabled}
          />
        </label>

        <label>
          PDF link
          <input
            type="text"
            value={value.pdf}
            onChange={(event) => update("pdf", event.target.value)}
            placeholder="/publications/slug.pdf or https://..."
            disabled={disabled}
          />
        </label>

        <label>
          DOCX link
          <input
            type="text"
            value={value.docx}
            onChange={(event) => update("docx", event.target.value)}
            placeholder="/publications/slug.docx or https://..."
            disabled={disabled}
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          PDF upload (optional, max 10MB)
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => onPdfFileChange(event.target.files?.[0] ?? null)}
            disabled={disabled}
          />
          {pdfFileName && <span className="meta">Selected: {pdfFileName}</span>}
        </label>

        <label>
          DOCX upload (optional, max 10MB)
          <input
            type="file"
            accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
            onChange={(event) => onDocxFileChange(event.target.files?.[0] ?? null)}
            disabled={disabled}
          />
          {docxFileName && <span className="meta">Selected: {docxFileName}</span>}
        </label>
      </div>

      <div className="checkbox-grid">
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={value.highlight}
            onChange={(event) => update("highlight", event.target.checked)}
            disabled={disabled}
          />
          Highlight on homepage
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={value.draft}
            onChange={(event) => update("draft", event.target.checked)}
            disabled={disabled}
          />
          Draft
        </label>
      </div>

      <label>
        Body (Markdown/MDX)
        <textarea
          value={value.body}
          onChange={(event) => update("body", event.target.value)}
          rows={12}
          required
          disabled={disabled}
        />
      </label>
    </div>
  );
}
