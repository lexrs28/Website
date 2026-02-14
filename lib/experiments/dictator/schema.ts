import { z } from "zod";
import {
  AGE_RANGE_OPTIONS,
  DICTATOR_ENDOWMENT,
  DICTATOR_STEP,
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  GENDER_IDENTITY_OPTIONS,
  INCOME_RANGE_OPTIONS
} from "@/lib/experiments/dictator/constants";

export const dictatorGameSubmissionSchema = z
  .object({
    amountGiven: z
      .number({ invalid_type_error: "Amount given must be a number." })
      .int("Amount given must be an integer.")
      .min(0)
      .max(DICTATOR_ENDOWMENT)
      .refine((value) => value % DICTATOR_STEP === 0, {
        message: `Amount given must use $${DICTATOR_STEP} increments.`
      }),
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

export type DictatorGameSubmissionSchema = z.infer<typeof dictatorGameSubmissionSchema>;
