"use client";

import type { AboutFormValues } from "@/components/local-content/types";

type AboutFormProps = {
  value: AboutFormValues;
  onChange: (next: AboutFormValues) => void;
  disabled?: boolean;
};

export function AboutForm({ value, onChange, disabled = false }: AboutFormProps) {
  return (
    <label className="intake-form-stack">
      About body (Markdown/MDX)
      <textarea
        value={value.body}
        onChange={(event) => onChange({ body: event.target.value })}
        rows={16}
        required
        disabled={disabled}
      />
    </label>
  );
}
