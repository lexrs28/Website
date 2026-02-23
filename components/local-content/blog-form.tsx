"use client";

import type { BlogFormValues } from "@/components/local-content/types";

type BlogFormProps = {
  value: BlogFormValues;
  onChange: (next: BlogFormValues) => void;
  disabled?: boolean;
};

export function BlogForm({ value, onChange, disabled = false }: BlogFormProps) {
  function update<Key extends keyof BlogFormValues>(key: Key, nextValue: BlogFormValues[Key]) {
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
          Date
          <input
            type="date"
            value={value.date}
            onChange={(event) => update("date", event.target.value)}
            required
            disabled={disabled}
          />
        </label>

        <label>
          Tags (comma separated)
          <input
            type="text"
            value={value.tags}
            onChange={(event) => update("tags", event.target.value)}
            placeholder="behavioral-economics, donor-science"
            disabled={disabled}
          />
        </label>
      </div>

      <label>
        Summary
        <textarea
          value={value.summary}
          onChange={(event) => update("summary", event.target.value)}
          rows={3}
          required
          disabled={disabled}
        />
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

      <label>
        Body (Markdown/MDX)
        <textarea
          value={value.body}
          onChange={(event) => update("body", event.target.value)}
          rows={14}
          required
          disabled={disabled}
        />
      </label>
    </div>
  );
}
