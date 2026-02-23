import type {
  AGE_RANGE_OPTIONS,
  DONATION_TIMING_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  GENDER_IDENTITY_OPTIONS,
  INCOME_RANGE_OPTIONS
} from "@/lib/experiments/temporal-discounting/constants";

export type DonationTiming = (typeof DONATION_TIMING_OPTIONS)[number];
export type AgeRange = (typeof AGE_RANGE_OPTIONS)[number];
export type GenderIdentity = (typeof GENDER_IDENTITY_OPTIONS)[number];
export type EducationLevel = (typeof EDUCATION_LEVEL_OPTIONS)[number];
export type EmploymentStatus = (typeof EMPLOYMENT_STATUS_OPTIONS)[number];
export type IncomeRange = (typeof INCOME_RANGE_OPTIONS)[number];

export type TemporalDiscountingSubmissionInput = {
  donationTiming: DonationTiming;
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

export type TemporalDiscountingResponseRecord = {
  id: number;
  experimentSlug: string;
  donationTiming: DonationTiming;
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

export type NewTemporalDiscountingResponse = {
  sessionId: number;
  experimentSlug: string;
  donationTiming: DonationTiming;
  ageRange: AgeRange;
  genderIdentity: GenderIdentity;
  countryOrRegion: string;
  educationLevel: EducationLevel;
  employmentStatus: EmploymentStatus;
  incomeRange: IncomeRange;
  browserLanguage: string | null;
  timezoneOffsetMinutes: number | null;
};

export type TemporalInsertResult =
  | { ok: true; id: number }
  | { ok: false; reason: "duplicate" };

export interface TemporalDiscountingRepository {
  upsertExperimentSession(sessionTokenHash: string): Promise<ExperimentSession>;
  insertTemporalDiscountingResponse(input: NewTemporalDiscountingResponse): Promise<TemporalInsertResult>;
  listTemporalDiscountingResponses(experimentSlug: string): Promise<TemporalDiscountingResponseRecord[]>;
}

export type TemporalSubmitOk = { status: "ok"; id: number };
export type TemporalSubmitDuplicate = { status: "duplicate"; message: string };
export type TemporalSubmitError = {
  status: "error";
  message: string;
  code: "validation" | "server";
};

export type TemporalSubmitResult = TemporalSubmitOk | TemporalSubmitDuplicate | TemporalSubmitError;

export interface TemporalDiscountingService {
  submitResponse(input: {
    sessionToken: string;
    submission: unknown;
    experimentSlug?: string;
  }): Promise<TemporalSubmitResult>;
  listResponsesForExport(experimentSlug?: string): Promise<TemporalDiscountingResponseRecord[]>;
  toCsv(rows: TemporalDiscountingResponseRecord[]): string;
}
