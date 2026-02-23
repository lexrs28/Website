import { getSqlClient } from "@/lib/db/postgres";
import type {
  ExperimentSession,
  TemporalDiscountingRepository,
  NewTemporalDiscountingResponse,
  TemporalDiscountingResponseRecord
} from "@/lib/experiments/temporal-discounting/types";

type SessionRow = {
  id: number;
  session_token_hash: string;
  created_at: string | Date;
  last_seen_at: string | Date;
};

type ResponseRow = {
  id: number;
  experiment_slug: string;
  donation_timing: TemporalDiscountingResponseRecord["donationTiming"];
  age_range: TemporalDiscountingResponseRecord["ageRange"];
  gender_identity: TemporalDiscountingResponseRecord["genderIdentity"];
  country_or_region: string;
  education_level: TemporalDiscountingResponseRecord["educationLevel"];
  employment_status: TemporalDiscountingResponseRecord["employmentStatus"];
  income_range: TemporalDiscountingResponseRecord["incomeRange"];
  browser_language: string | null;
  timezone_offset_minutes: number | null;
  created_at: string | Date;
};

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapSessionRow(row: SessionRow): ExperimentSession {
  return {
    id: row.id,
    sessionTokenHash: row.session_token_hash,
    createdAt: toIso(row.created_at),
    lastSeenAt: toIso(row.last_seen_at)
  };
}

function mapResponseRow(row: ResponseRow): TemporalDiscountingResponseRecord {
  return {
    id: row.id,
    experimentSlug: row.experiment_slug,
    donationTiming: row.donation_timing,
    ageRange: row.age_range,
    genderIdentity: row.gender_identity,
    countryOrRegion: row.country_or_region,
    educationLevel: row.education_level,
    employmentStatus: row.employment_status,
    incomeRange: row.income_range,
    browserLanguage: row.browser_language,
    timezoneOffsetMinutes: row.timezone_offset_minutes,
    createdAt: toIso(row.created_at)
  };
}

export function createPostgresTemporalDiscountingRepository(): TemporalDiscountingRepository {
  const sql = getSqlClient();

  return {
    async upsertExperimentSession(sessionTokenHash: string): Promise<ExperimentSession> {
      const rows = await sql<SessionRow[]>`
        INSERT INTO experiment_sessions (session_token_hash)
        VALUES (${sessionTokenHash})
        ON CONFLICT (session_token_hash)
        DO UPDATE SET last_seen_at = NOW()
        RETURNING id, session_token_hash, created_at, last_seen_at
      `;

      const row = rows[0];
      return mapSessionRow(row);
    },

    async insertTemporalDiscountingResponse(input: NewTemporalDiscountingResponse) {
      try {
        const rows = await sql<{ id: number }[]>`
          INSERT INTO temporal_discounting_responses (
            session_id,
            experiment_slug,
            donation_timing,
            age_range,
            gender_identity,
            country_or_region,
            education_level,
            employment_status,
            income_range,
            browser_language,
            timezone_offset_minutes
          )
          VALUES (
            ${input.sessionId},
            ${input.experimentSlug},
            ${input.donationTiming},
            ${input.ageRange},
            ${input.genderIdentity},
            ${input.countryOrRegion},
            ${input.educationLevel},
            ${input.employmentStatus},
            ${input.incomeRange},
            ${input.browserLanguage},
            ${input.timezoneOffsetMinutes}
          )
          RETURNING id
        `;

        return { ok: true as const, id: rows[0].id };
      } catch (error) {
        if ((error as { code?: string }).code === "23505") {
          return { ok: false as const, reason: "duplicate" as const };
        }
        throw error;
      }
    },

    async listTemporalDiscountingResponses(experimentSlug: string): Promise<TemporalDiscountingResponseRecord[]> {
      const rows = await sql<ResponseRow[]>`
        SELECT
          id,
          experiment_slug,
          donation_timing,
          age_range,
          gender_identity,
          country_or_region,
          education_level,
          employment_status,
          income_range,
          browser_language,
          timezone_offset_minutes,
          created_at
        FROM temporal_discounting_responses
        WHERE experiment_slug = ${experimentSlug}
        ORDER BY created_at DESC, id DESC
      `;

      return rows.map(mapResponseRow);
    }
  };
}
