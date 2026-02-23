import { describe, expect, it } from "vitest";
import { createTemporalDiscountingService } from "@/lib/experiments/temporal-discounting/service";
import type {
  ExperimentSession,
  NewTemporalDiscountingResponse,
  TemporalDiscountingRepository,
  TemporalDiscountingResponseRecord
} from "@/lib/experiments/temporal-discounting/types";

const baseSubmission = {
  donationTiming: "sooner" as const,
  ageRange: "25-34" as const,
  genderIdentity: "Woman" as const,
  countryOrRegion: "United States",
  educationLevel: "Bachelor's degree" as const,
  employmentStatus: "Employed full-time" as const,
  incomeRange: "$75,000-$99,999" as const,
  browserLanguage: "en-US",
  timezoneOffsetMinutes: 300,
  honeypot: ""
};

class InMemoryTemporalRepository implements TemporalDiscountingRepository {
  private sessionMap = new Map<string, ExperimentSession>();
  private responseMap = new Map<string, TemporalDiscountingResponseRecord>();
  private nextSessionId = 1;
  private nextResponseId = 1;

  public insertedRows: NewTemporalDiscountingResponse[] = [];

  async upsertExperimentSession(sessionTokenHash: string): Promise<ExperimentSession> {
    const existing = this.sessionMap.get(sessionTokenHash);
    const now = new Date().toISOString();

    if (existing) {
      const updated: ExperimentSession = {
        ...existing,
        lastSeenAt: now
      };
      this.sessionMap.set(sessionTokenHash, updated);
      return updated;
    }

    const created: ExperimentSession = {
      id: this.nextSessionId++,
      sessionTokenHash,
      createdAt: now,
      lastSeenAt: now
    };

    this.sessionMap.set(sessionTokenHash, created);
    return created;
  }

  async insertTemporalDiscountingResponse(input: NewTemporalDiscountingResponse) {
    this.insertedRows.push(input);

    const duplicateKey = `${input.sessionId}:${input.experimentSlug}`;
    if (this.responseMap.has(duplicateKey)) {
      return { ok: false as const, reason: "duplicate" as const };
    }

    const row: TemporalDiscountingResponseRecord = {
      id: this.nextResponseId++,
      experimentSlug: input.experimentSlug,
      donationTiming: input.donationTiming,
      ageRange: input.ageRange,
      genderIdentity: input.genderIdentity,
      countryOrRegion: input.countryOrRegion,
      educationLevel: input.educationLevel,
      employmentStatus: input.employmentStatus,
      incomeRange: input.incomeRange,
      browserLanguage: input.browserLanguage,
      timezoneOffsetMinutes: input.timezoneOffsetMinutes,
      createdAt: new Date().toISOString()
    };

    this.responseMap.set(duplicateKey, row);
    return { ok: true as const, id: row.id };
  }

  async listTemporalDiscountingResponses(experimentSlug: string): Promise<TemporalDiscountingResponseRecord[]> {
    return [...this.responseMap.values()].filter((row) => row.experimentSlug === experimentSlug);
  }
}

describe("temporal discounting service", () => {
  it("creates a new response and blocks duplicate submission for same session", async () => {
    const repository = new InMemoryTemporalRepository();
    const service = createTemporalDiscountingService(repository);

    const first = await service.submitResponse({
      sessionToken: "session-token-1",
      submission: baseSubmission
    });
    const second = await service.submitResponse({
      sessionToken: "session-token-1",
      submission: baseSubmission
    });

    expect(first.status).toBe("ok");
    expect(second.status).toBe("duplicate");
  });

  it("persists sooner/later donation timing choice", async () => {
    const repository = new InMemoryTemporalRepository();
    const service = createTemporalDiscountingService(repository);

    await service.submitResponse({
      sessionToken: "session-token-2",
      submission: {
        ...baseSubmission,
        donationTiming: "later"
      }
    });

    expect(repository.insertedRows[0]?.donationTiming).toBe("later");
  });

  it("serializes export rows to CSV", async () => {
    const repository = new InMemoryTemporalRepository();
    const service = createTemporalDiscountingService(repository);

    await service.submitResponse({
      sessionToken: "session-token-3",
      submission: baseSubmission
    });

    const rows = await service.listResponsesForExport();
    const csv = service.toCsv(rows);

    expect(csv).toContain("experiment_slug");
    expect(csv).toContain("donation_timing");
    expect(csv).toContain("temporal-discounting-v1");
  });
});
