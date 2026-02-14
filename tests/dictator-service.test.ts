import { describe, expect, it } from "vitest";
import { createDictatorGameService } from "@/lib/experiments/dictator/service";
import type {
  DictatorGameResponseRecord,
  DictatorRepository,
  ExperimentSession,
  NewDictatorGameResponse
} from "@/lib/experiments/dictator/types";

const baseSubmission = {
  amountGiven: 25,
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

class InMemoryDictatorRepository implements DictatorRepository {
  private sessionMap = new Map<string, ExperimentSession>();
  private responseMap = new Map<string, DictatorGameResponseRecord>();
  private nextSessionId = 1;
  private nextResponseId = 1;

  public insertedRows: NewDictatorGameResponse[] = [];

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

  async insertDictatorGameResponse(input: NewDictatorGameResponse) {
    this.insertedRows.push(input);

    const duplicateKey = `${input.sessionId}:${input.experimentSlug}`;
    if (this.responseMap.has(duplicateKey)) {
      return { ok: false as const, reason: "duplicate" as const };
    }

    const row: DictatorGameResponseRecord = {
      id: this.nextResponseId++,
      experimentSlug: input.experimentSlug,
      amountGiven: input.amountGiven,
      amountKept: input.amountKept,
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

  async listDictatorGameResponses(experimentSlug: string): Promise<DictatorGameResponseRecord[]> {
    return [...this.responseMap.values()].filter((row) => row.experimentSlug === experimentSlug);
  }
}

describe("dictator game service", () => {
  it("creates a new response and blocks duplicate submission for same session", async () => {
    const repository = new InMemoryDictatorRepository();
    const service = createDictatorGameService(repository);

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

  it("computes amount kept as endowment minus amount given", async () => {
    const repository = new InMemoryDictatorRepository();
    const service = createDictatorGameService(repository);

    await service.submitResponse({
      sessionToken: "session-token-2",
      submission: {
        ...baseSubmission,
        amountGiven: 70
      }
    });

    expect(repository.insertedRows[0]?.amountGiven).toBe(70);
    expect(repository.insertedRows[0]?.amountKept).toBe(30);
  });

  it("serializes export rows to CSV", async () => {
    const repository = new InMemoryDictatorRepository();
    const service = createDictatorGameService(repository);

    await service.submitResponse({
      sessionToken: "session-token-3",
      submission: baseSubmission
    });

    const rows = await service.listResponsesForExport();
    const csv = service.toCsv(rows);

    expect(csv).toContain("experiment_slug");
    expect(csv).toContain("dictator-game-v1");
  });
});
