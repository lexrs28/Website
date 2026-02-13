"use client";

import { useMemo, useState } from "react";
import type { PublicationEntry, PublicationType } from "@/lib/content/types";

const publicationTypes: Array<PublicationType | "all"> = [
  "all",
  "journal",
  "conference",
  "preprint",
  "thesis",
  "workshop"
];

export function PublicationsList({ publications }: { publications: PublicationEntry[] }) {
  const [selectedType, setSelectedType] = useState<PublicationType | "all">("all");

  const years = useMemo(() => {
    return Array.from(new Set(publications.map((item) => item.year))).sort((a, b) => b - a);
  }, [publications]);

  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  const filtered = useMemo(() => {
    return publications.filter((item) => {
      const typeMatch = selectedType === "all" || item.type === selectedType;
      const yearMatch = selectedYear === "all" || item.year === selectedYear;
      return typeMatch && yearMatch;
    });
  }, [publications, selectedType, selectedYear]);

  return (
    <section>
      <div className="filter-row" role="group" aria-label="Filter publications">
        <label>
          Type
          <select value={selectedType} onChange={(event) => setSelectedType(event.target.value as PublicationType | "all")}>
            {publicationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Year
          <select
            value={selectedYear}
            onChange={(event) =>
              setSelectedYear(event.target.value === "all" ? "all" : Number(event.target.value))
            }
          >
            <option value="all">all</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="stack-list">
        {filtered.map((item) => (
          <li key={item.slug} className="card publication-card">
            <p className="meta">
              {item.year} • {item.type}
            </p>
            <h3>{item.title}</h3>
            <p>{item.authors.join(", ")}</p>
            <p>{item.venue}</p>
            <p className="link-row">
              {item.links.doi && (
                <a href={item.links.doi} target="_blank" rel="noreferrer">
                  DOI
                </a>
              )}
              {item.links.arxiv && (
                <a href={item.links.arxiv} target="_blank" rel="noreferrer">
                  arXiv
                </a>
              )}
              {item.links.pdf && (
                <a href={item.links.pdf} target="_blank" rel="noreferrer">
                  PDF
                </a>
              )}
              {item.links.docx && (
                <a href={item.links.docx} target="_blank" rel="noreferrer">
                  DOCX
                </a>
              )}
              {item.links.code && (
                <a href={item.links.code} target="_blank" rel="noreferrer">
                  Code
                </a>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
