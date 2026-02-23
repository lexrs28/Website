import { createPostgresTemporalDiscountingRepository } from "@/lib/experiments/temporal-discounting/repository";
import { createTemporalDiscountingService } from "@/lib/experiments/temporal-discounting/service";
import type { TemporalDiscountingService } from "@/lib/experiments/temporal-discounting/types";

let cachedService: TemporalDiscountingService | null = null;

export function getTemporalDiscountingService(): TemporalDiscountingService {
  if (!cachedService) {
    cachedService = createTemporalDiscountingService(createPostgresTemporalDiscountingRepository());
  }

  return cachedService;
}
