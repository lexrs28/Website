import { describe, expect, it } from "vitest";
import { dictatorGameSubmissionSchema } from "@/lib/experiments/dictator/schema";

const validSubmission = {
  amountGiven: 50,
  ageRange: "25-34",
  genderIdentity: "Woman",
  countryOrRegion: "United States",
  educationLevel: "Bachelor's degree",
  employmentStatus: "Employed full-time",
  incomeRange: "$75,000-$99,999",
  browserLanguage: "en-US",
  timezoneOffsetMinutes: 300,
  honeypot: ""
};

describe("dictator game schema", () => {
  it("accepts valid submission payload", () => {
    const parsed = dictatorGameSubmissionSchema.parse(validSubmission);
    expect(parsed.amountGiven).toBe(50);
  });

  it("rejects amounts not in $5 increments", () => {
    const result = dictatorGameSubmissionSchema.safeParse({
      ...validSubmission,
      amountGiven: 53
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing required demographic fields", () => {
    const result = dictatorGameSubmissionSchema.safeParse({
      ...validSubmission,
      countryOrRegion: ""
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-empty honeypot values", () => {
    const result = dictatorGameSubmissionSchema.safeParse({
      ...validSubmission,
      honeypot: "spam"
    });

    expect(result.success).toBe(false);
  });
});
