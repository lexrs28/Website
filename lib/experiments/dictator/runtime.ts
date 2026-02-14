import { createPostgresDictatorRepository } from "@/lib/experiments/dictator/repository";
import { createDictatorGameService } from "@/lib/experiments/dictator/service";
import type { DictatorGameService } from "@/lib/experiments/dictator/types";

let cachedService: DictatorGameService | null = null;

export function getDictatorGameService(): DictatorGameService {
  if (!cachedService) {
    cachedService = createDictatorGameService(createPostgresDictatorRepository());
  }

  return cachedService;
}
