import { describe, expect, it } from "vitest";
import { temporalDiscountingSubmissionSchema } from "@/lib/experiments/temporal-discounting/schema";

const validSubmission = {
  donationTiming: "sooner",
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

describe("temporal discounting schema", () => {
  it("accepts valid submission payload", () => {
    const parsed = temporalDiscountingSubmissionSchema.parse(validSubmission);
    expect(parsed.donationTiming).toBe("sooner");
  });

  it("rejects invalid donation timing values", () => {
    const result = temporalDiscountingSubmissionSchema.safeParse({
      ...validSubmission,
      donationTiming: "next-week"
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing required demographic fields", () => {
    const result = temporalDiscountingSubmissionSchema.safeParse({
      ...validSubmission,
      countryOrRegion: ""
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-empty honeypot values", () => {
    const result = temporalDiscountingSubmissionSchema.safeParse({
      ...validSubmission,
      honeypot: "spam"
    });

    expect(result.success).toBe(false);
  });
});
