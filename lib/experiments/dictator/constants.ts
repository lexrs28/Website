export const DEFAULT_DICTATOR_EXPERIMENT_SLUG = "dictator-game-v1";

export const DICTATOR_ENDOWMENT = 100;
export const DICTATOR_STEP = 5;

export const DICTATOR_AMOUNT_OPTIONS: number[] = Array.from(
  { length: DICTATOR_ENDOWMENT / DICTATOR_STEP + 1 },
  (_, index) => index * DICTATOR_STEP
);

export const AGE_RANGE_OPTIONS = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"] as const;

export const GENDER_IDENTITY_OPTIONS = [
  "Woman",
  "Man",
  "Non-binary",
  "Prefer to self-describe",
  "Prefer not to say"
] as const;

export const EDUCATION_LEVEL_OPTIONS = [
  "High school or equivalent",
  "Some college",
  "Bachelor's degree",
  "Master's degree",
  "Doctorate",
  "Other"
] as const;

export const EMPLOYMENT_STATUS_OPTIONS = [
  "Employed full-time",
  "Employed part-time",
  "Self-employed",
  "Student",
  "Unemployed",
  "Retired",
  "Other"
] as const;

export const INCOME_RANGE_OPTIONS = [
  "Under $25,000",
  "$25,000-$49,999",
  "$50,000-$74,999",
  "$75,000-$99,999",
  "$100,000-$149,999",
  "$150,000+",
  "Prefer not to say"
] as const;
