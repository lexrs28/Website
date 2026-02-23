"use client";

import { FormEvent, useState } from "react";
import {
  AGE_RANGE_OPTIONS,
  DONATION_TIMING_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  GENDER_IDENTITY_OPTIONS,
  INCOME_RANGE_OPTIONS
} from "@/lib/experiments/temporal-discounting/constants";

type DonationTiming = (typeof DONATION_TIMING_OPTIONS)[number];

type FormState = {
  donationTiming: DonationTiming | "";
  ageRange: string;
  genderIdentity: string;
  countryOrRegion: string;
  educationLevel: string;
  employmentStatus: string;
  incomeRange: string;
  honeypot: string;
};

const initialFormState: FormState = {
  donationTiming: "",
  ageRange: "",
  genderIdentity: "",
  countryOrRegion: "",
  educationLevel: "",
  employmentStatus: "",
  incomeRange: "",
  honeypot: ""
};

export function TemporalDiscountingForm() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "duplicate" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const isLocked = status === "submitting" || status === "success" || status === "duplicate";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("submitting");
    setMessage("");

    const payload = {
      ...form,
      browserLanguage: typeof navigator !== "undefined" ? navigator.language : undefined,
      timezoneOffsetMinutes:
        typeof Date !== "undefined" ? new Date().getTimezoneOffset() : undefined
    };

    try {
      const response = await fetch("/api/experiments/temporal-discounting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as { status: "ok" | "duplicate" | "error"; message?: string };

      if (response.status === 201 && data.status === "ok") {
        setStatus("success");
        setMessage("Thanks. Your response was recorded.");
        return;
      }

      if (response.status === 409 && data.status === "duplicate") {
        setStatus("duplicate");
        setMessage(data.message ?? "This browser session already submitted this experiment.");
        return;
      }

      setStatus("error");
      setMessage(data.message ?? "Unable to submit right now. Please review the fields and try again.");
    } catch {
      setStatus("error");
      setMessage("Network error while submitting. Please try again.");
    }
  }

  return (
    <form className="experiment-form" onSubmit={handleSubmit}>
      <fieldset className="timing-task" disabled={isLocked}>
        <legend>Would you rather donate to charity tomorrow or in 3 months?</legend>
        <div className="timing-choice-grid">
          <label className={form.donationTiming === "sooner" ? "timing-choice timing-choice-selected" : "timing-choice"}>
            <input
              type="radio"
              name="donationTiming"
              value="sooner"
              checked={form.donationTiming === "sooner"}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  donationTiming: event.target.value as DonationTiming
                }))
              }
              required
            />
            Donate tomorrow (Sooner)
          </label>

          <label className={form.donationTiming === "later" ? "timing-choice timing-choice-selected" : "timing-choice"}>
            <input
              type="radio"
              name="donationTiming"
              value="later"
              checked={form.donationTiming === "later"}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  donationTiming: event.target.value as DonationTiming
                }))
              }
              required
            />
            Donate in 3 months (Later)
          </label>
        </div>

        <div className="timing-animation" aria-hidden="true">
          <div className="timing-lane">
            <div className="timing-box timing-box-sooner">Sooner</div>
            <div className="timing-box timing-box-later">Later</div>
          </div>
          <div
            className={
              form.donationTiming
                ? `timing-gift timing-gift-${form.donationTiming}`
                : "timing-gift"
            }
          >
            Gift
          </div>
        </div>
      </fieldset>

      <div className="form-grid">
        <label>
          Age range
          <select
            required
            value={form.ageRange}
            disabled={isLocked}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                ageRange: event.target.value
              }))
            }
          >
            <option value="">Select...</option>
            {AGE_RANGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Gender identity
          <select
            required
            value={form.genderIdentity}
            disabled={isLocked}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                genderIdentity: event.target.value
              }))
            }
          >
            <option value="">Select...</option>
            {GENDER_IDENTITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Country or region
          <input
            required
            type="text"
            maxLength={120}
            value={form.countryOrRegion}
            disabled={isLocked}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                countryOrRegion: event.target.value
              }))
            }
          />
        </label>

        <label>
          Education level
          <select
            required
            value={form.educationLevel}
            disabled={isLocked}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                educationLevel: event.target.value
              }))
            }
          >
            <option value="">Select...</option>
            {EDUCATION_LEVEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Employment status
          <select
            required
            value={form.employmentStatus}
            disabled={isLocked}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                employmentStatus: event.target.value
              }))
            }
          >
            <option value="">Select...</option>
            {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Income range (USD)
          <select
            required
            value={form.incomeRange}
            disabled={isLocked}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                incomeRange: event.target.value
              }))
            }
          >
            <option value="">Select...</option>
            {INCOME_RANGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="honeypot-field" aria-hidden="true">
        Website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              honeypot: event.target.value
            }))
          }
        />
      </label>

      <p className="meta">
        By submitting, you acknowledge this anonymous response may be used for exploratory research summaries and
        teaching examples.
      </p>

      <button type="submit" disabled={isLocked}>
        {status === "submitting" ? "Submitting..." : "Submit response"}
      </button>

      {message ? (
        <p className={status === "error" ? "form-message form-message-error" : "form-message"} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
