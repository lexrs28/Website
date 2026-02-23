import { createHash, randomUUID } from "node:crypto";
import { DEFAULT_TEMPORAL_DISCOUNTING_EXPERIMENT_SLUG } from "@/lib/experiments/temporal-discounting/constants";
import { temporalDiscountingSubmissionSchema } from "@/lib/experiments/temporal-discounting/schema";
import type {
  TemporalDiscountingResponseRecord,
  TemporalDiscountingService,
  TemporalDiscountingRepository,
  TemporalSubmitResult
} from "@/lib/experiments/temporal-discounting/types";

function resolveExperimentSlug(explicitSlug?: string): string {
  return (
    explicitSlug ??
    process.env.TEMPORAL_DISCOUNTING_EXPERIMENT_SLUG ??
    process.env.DICTATOR_EXPERIMENT_SLUG ??
    DEFAULT_TEMPORAL_DISCOUNTING_EXPERIMENT_SLUG
  );
}

function hashSessionToken(sessionToken: string): string {
  return createHash("sha256").update(sessionToken).digest("hex");
}

function escapeCsvCell(value: string | number | null): string {
  if (value === null) {
    return "";
  }

  const serialized = String(value);
  if (/[,"\n]/.test(serialized)) {
    return `"${serialized.replace(/"/g, '""')}"`;
  }

  return serialized;
}

export function createSessionToken(): string {
  return randomUUID();
}

export function createTemporalDiscountingService(
  repository: TemporalDiscountingRepository
): TemporalDiscountingService {
  return {
    async submitResponse({ sessionToken, submission, experimentSlug }): Promise<TemporalSubmitResult> {
      const parsed = temporalDiscountingSubmissionSchema.safeParse(submission);
      if (!parsed.success) {
        return {
          status: "error",
          code: "validation",
          message: "Please complete all required fields using the allowed values."
        };
      }

      try {
        const sessionTokenHash = hashSessionToken(sessionToken);
        const session = await repository.upsertExperimentSession(sessionTokenHash);

        const insertResult = await repository.insertTemporalDiscountingResponse({
          sessionId: session.id,
          experimentSlug: resolveExperimentSlug(experimentSlug),
          donationTiming: parsed.data.donationTiming,
          ageRange: parsed.data.ageRange,
          genderIdentity: parsed.data.genderIdentity,
          countryOrRegion: parsed.data.countryOrRegion,
          educationLevel: parsed.data.educationLevel,
          employmentStatus: parsed.data.employmentStatus,
          incomeRange: parsed.data.incomeRange,
          browserLanguage: parsed.data.browserLanguage ?? null,
          timezoneOffsetMinutes: parsed.data.timezoneOffsetMinutes ?? null
        });

        if (!insertResult.ok) {
          return {
            status: "duplicate",
            message: "This browser session already submitted a response for this experiment."
          };
        }

        return {
          status: "ok",
          id: insertResult.id
        };
      } catch {
        return {
          status: "error",
          code: "server",
          message: "Unable to save your response right now. Please try again."
        };
      }
    },

    async listResponsesForExport(experimentSlug?: string): Promise<TemporalDiscountingResponseRecord[]> {
      return repository.listTemporalDiscountingResponses(resolveExperimentSlug(experimentSlug));
    },

    toCsv(rows: TemporalDiscountingResponseRecord[]): string {
      const header = [
        "id",
        "experiment_slug",
        "donation_timing",
        "age_range",
        "gender_identity",
        "country_or_region",
        "education_level",
        "employment_status",
        "income_range",
        "browser_language",
        "timezone_offset_minutes",
        "created_at"
      ];

      const lines = rows.map((row) =>
        [
          row.id,
          row.experimentSlug,
          row.donationTiming,
          row.ageRange,
          row.genderIdentity,
          row.countryOrRegion,
          row.educationLevel,
          row.employmentStatus,
          row.incomeRange,
          row.browserLanguage,
          row.timezoneOffsetMinutes,
          row.createdAt
        ]
          .map(escapeCsvCell)
          .join(",")
      );

      return [header.join(","), ...lines].join("\n");
    }
  };
}
