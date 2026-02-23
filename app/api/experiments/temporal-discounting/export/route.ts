import { NextRequest } from "next/server";
import { handleTemporalDiscountingExport } from "@/lib/experiments/temporal-discounting/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handleTemporalDiscountingExport(request);
}
