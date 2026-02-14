import { NextRequest } from "next/server";
import { handleDictatorGameExport } from "@/lib/experiments/dictator/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handleDictatorGameExport(request);
}
