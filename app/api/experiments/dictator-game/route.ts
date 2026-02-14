import { NextRequest } from "next/server";
import { handleDictatorGameSubmission } from "@/lib/experiments/dictator/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleDictatorGameSubmission(request);
}
