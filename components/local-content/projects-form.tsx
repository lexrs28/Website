"use client";

import type { ProjectsFormValues } from "@/components/local-content/types";

type ProjectsFormProps = {
  value: ProjectsFormValues;
  onChange: (next: ProjectsFormValues) => void;
  disabled?: boolean;
};

export function ProjectsForm({ value, onChange, disabled = false }: ProjectsFormProps) {
  function updateCard(index: number, key: "title" | "description", nextValue: string) {
    const cards = value.cards.map((card, cardIndex) => {
      if (cardIndex !== index) {
        return card;
      }

      return {
        ...card,
        [key]: nextValue
      };
    });

    onChange({ cards });
  }

  function addCard() {
    onChange({
      cards: [...value.cards, { title: "", description: "" }]
    });
  }

  function removeCard(index: number) {
    const cards = value.cards.filter((_, cardIndex) => cardIndex !== index);
    onChange({ cards });
  }

  return (
    <div className="intake-form-stack">
      {value.cards.map((card, index) => (
        <fieldset key={`${index}-${card.title}`} className="card intake-card-fieldset">
          <legend>Card {index + 1}</legend>
          <label>
            Title
            <input
              type="text"
              value={card.title}
              onChange={(event) => updateCard(index, "title", event.target.value)}
              required
              disabled={disabled}
            />
          </label>
          <label>
            Description
            <textarea
              value={card.description}
              onChange={(event) => updateCard(index, "description", event.target.value)}
              rows={4}
              required
              disabled={disabled}
            />
          </label>
          <button type="button" onClick={() => removeCard(index)} disabled={disabled || value.cards.length <= 1}>
            Remove card
          </button>
        </fieldset>
      ))}

      <button type="button" onClick={addCard} disabled={disabled}>
        Add card
      </button>
    </div>
  );
}
