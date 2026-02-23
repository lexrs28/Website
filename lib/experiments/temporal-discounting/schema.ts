import { z } from "zod";
import {
  AGE_RANGE_OPTIONS,
  DONATION_TIMING_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  GENDER_IDENTITY_OPTIONS,
  INCOME_RANGE_OPTIONS
} from "@/lib/experiments/temporal-discounting/constants";

export const temporalDiscountingSubmissionSchema = z
  .object({
    donationTiming: z.enum(DONATION_TIMING_OPTIONS),
    ageRange: z.enum(AGE_RANGE_OPTIONS),
    genderIdentity: z.enum(GENDER_IDENTITY_OPTIONS),
    countryOrRegion: z.string().trim().min(2).max(120),
    educationLevel: z.enum(EDUCATION_LEVEL_OPTIONS),
    employmentStatus: z.enum(EMPLOYMENT_STATUS_OPTIONS),
    incomeRange: z.enum(INCOME_RANGE_OPTIONS),
    browserLanguage: z.string().trim().min(2).max(35).optional(),
    timezoneOffsetMinutes: z.number().int().min(-840).max(840).optional(),
    honeypot: z.string().max(0).optional().default("")
  })
  .strict();

export type TemporalDiscountingSubmissionSchema = z.infer<typeof temporalDiscountingSubmissionSchema>;
