import { NextRequest } from "next/server";
import { handleTemporalDiscountingSubmission } from "@/lib/experiments/temporal-discounting/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleTemporalDiscountingSubmission(request);
}
