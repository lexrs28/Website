import { createHash, randomUUID } from "node:crypto";
import {
  DEFAULT_DICTATOR_EXPERIMENT_SLUG,
  DICTATOR_ENDOWMENT,
  DICTATOR_STEP
} from "@/lib/experiments/dictator/constants";
import { dictatorGameSubmissionSchema } from "@/lib/experiments/dictator/schema";
import type {
  DictatorGameResponseRecord,
  DictatorGameService,
  DictatorRepository,
  DictatorSubmitResult
} from "@/lib/experiments/dictator/types";

function resolveExperimentSlug(explicitSlug?: string): string {
  return explicitSlug ?? process.env.DICTATOR_EXPERIMENT_SLUG ?? DEFAULT_DICTATOR_EXPERIMENT_SLUG;
}

function hashSessionToken(sessionToken: string): string {
  return createHash("sha256").update(sessionToken).digest("hex");
}

function sanitizeAmountGiven(amount: number): number {
  if (!Number.isInteger(amount) || amount < 0 || amount > DICTATOR_ENDOWMENT || amount % DICTATOR_STEP !== 0) {
    throw new Error("Invalid dictator game amount.");
  }
  return amount;
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

export function createDictatorGameService(repository: DictatorRepository): DictatorGameService {
  return {
    async submitResponse({ sessionToken, submission, experimentSlug }): Promise<DictatorSubmitResult> {
      const parsed = dictatorGameSubmissionSchema.safeParse(submission);
      if (!parsed.success) {
        return {
          status: "error",
          code: "validation",
          message: "Please complete all required fields using the allowed values."
        };
      }

      try {
        const normalizedAmountGiven = sanitizeAmountGiven(parsed.data.amountGiven);
        const amountKept = DICTATOR_ENDOWMENT - normalizedAmountGiven;
        const sessionTokenHash = hashSessionToken(sessionToken);
        const session = await repository.upsertExperimentSession(sessionTokenHash);

        const insertResult = await repository.insertDictatorGameResponse({
          sessionId: session.id,
          experimentSlug: resolveExperimentSlug(experimentSlug),
          amountGiven: normalizedAmountGiven,
          amountKept,
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

    async listResponsesForExport(experimentSlug?: string): Promise<DictatorGameResponseRecord[]> {
      return repository.listDictatorGameResponses(resolveExperimentSlug(experimentSlug));
    },

    toCsv(rows: DictatorGameResponseRecord[]): string {
      const header = [
        "id",
        "experiment_slug",
        "amount_given",
        "amount_kept",
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
          row.amountGiven,
          row.amountKept,
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
