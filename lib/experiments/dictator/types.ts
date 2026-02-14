import type {
  AGE_RANGE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  GENDER_IDENTITY_OPTIONS,
  INCOME_RANGE_OPTIONS
} from "@/lib/experiments/dictator/constants";

export type AgeRange = (typeof AGE_RANGE_OPTIONS)[number];
export type GenderIdentity = (typeof GENDER_IDENTITY_OPTIONS)[number];
export type EducationLevel = (typeof EDUCATION_LEVEL_OPTIONS)[number];
export type EmploymentStatus = (typeof EMPLOYMENT_STATUS_OPTIONS)[number];
export type IncomeRange = (typeof INCOME_RANGE_OPTIONS)[number];

export type DictatorGameSubmissionInput = {
  amountGiven: number;
  ageRange: AgeRange;
  genderIdentity: GenderIdentity;
  countryOrRegion: string;
  educationLevel: EducationLevel;
  employmentStatus: EmploymentStatus;
  incomeRange: IncomeRange;
  browserLanguage?: string;
  timezoneOffsetMinutes?: number;
  honeypot?: string;
};

export type ExperimentSession = {
  id: number;
  sessionTokenHash: string;
  createdAt: string;
  lastSeenAt: string;
};

export type DictatorGameResponseRecord = {
  id: number;
  experimentSlug: string;
  amountGiven: number;
  amountKept: number;
  ageRange: AgeRange;
  genderIdentity: GenderIdentity;
  countryOrRegion: string;
  educationLevel: EducationLevel;
  employmentStatus: EmploymentStatus;
  incomeRange: IncomeRange;
  browserLanguage: string | null;
  timezoneOffsetMinutes: number | null;
  createdAt: string;
};

export type NewDictatorGameResponse = {
  sessionId: number;
  experimentSlug: string;
  amountGiven: number;
  amountKept: number;
  ageRange: AgeRange;
  genderIdentity: GenderIdentity;
  countryOrRegion: string;
  educationLevel: EducationLevel;
  employmentStatus: EmploymentStatus;
  incomeRange: IncomeRange;
  browserLanguage: string | null;
  timezoneOffsetMinutes: number | null;
};

export type DictatorInsertResult =
  | { ok: true; id: number }
  | { ok: false; reason: "duplicate" };

export interface DictatorRepository {
  upsertExperimentSession(sessionTokenHash: string): Promise<ExperimentSession>;
  insertDictatorGameResponse(input: NewDictatorGameResponse): Promise<DictatorInsertResult>;
  listDictatorGameResponses(experimentSlug: string): Promise<DictatorGameResponseRecord[]>;
}

export type DictatorSubmitOk = { status: "ok"; id: number };
export type DictatorSubmitDuplicate = { status: "duplicate"; message: string };
export type DictatorSubmitError = {
  status: "error";
  message: string;
  code: "validation" | "server";
};

export type DictatorSubmitResult = DictatorSubmitOk | DictatorSubmitDuplicate | DictatorSubmitError;

export interface DictatorGameService {
  submitResponse(input: {
    sessionToken: string;
    submission: unknown;
    experimentSlug?: string;
  }): Promise<DictatorSubmitResult>;
  listResponsesForExport(experimentSlug?: string): Promise<DictatorGameResponseRecord[]>;
  toCsv(rows: DictatorGameResponseRecord[]): string;
}
