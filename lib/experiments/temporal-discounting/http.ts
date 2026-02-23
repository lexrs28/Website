import { NextRequest, NextResponse } from "next/server";
import { getTemporalDiscountingService } from "@/lib/experiments/temporal-discounting/runtime";
import { createSessionToken } from "@/lib/experiments/temporal-discounting/service";
import type { TemporalDiscountingService } from "@/lib/experiments/temporal-discounting/types";

const SESSION_COOKIE_NAME = "td_session";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type TemporalSubmitHandlerDependencies = {
  service?: TemporalDiscountingService;
  sessionTokenFactory?: () => string;
};

export async function handleTemporalDiscountingSubmission(
  request: NextRequest,
  dependencies: TemporalSubmitHandlerDependencies = {}
): Promise<NextResponse> {
  const service = dependencies.service ?? getTemporalDiscountingService();
  const createToken = dependencies.sessionTokenFactory ?? createSessionToken;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid request body." },
      { status: 400 }
    );
  }

  const existingToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessionToken = existingToken ?? createToken();
  const result = await service.submitResponse({
    sessionToken,
    submission: payload
  });

  const responseStatus =
    result.status === "ok" ? 201 : result.status === "duplicate" ? 409 : result.code === "validation" ? 400 : 500;

  const response = NextResponse.json(result, { status: responseStatus });

  if (!existingToken && result.status !== "error") {
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_COOKIE_MAX_AGE
    });
  }

  return response;
}

export type TemporalExportHandlerDependencies = {
  service?: TemporalDiscountingService;
  exportToken?: string;
};

function isAuthorized(request: NextRequest, expectedToken: string): boolean {
  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const queryToken = request.nextUrl.searchParams.get("token")?.trim() ?? "";

  return bearerToken === expectedToken || queryToken === expectedToken;
}

function resolveExportToken(explicitToken?: string): string | undefined {
  return explicitToken ?? process.env.TEMPORAL_DISCOUNTING_EXPORT_TOKEN ?? process.env.DICTATOR_EXPORT_TOKEN;
}

export async function handleTemporalDiscountingExport(
  request: NextRequest,
  dependencies: TemporalExportHandlerDependencies = {}
): Promise<NextResponse> {
  const token = resolveExportToken(dependencies.exportToken);

  if (!token || !isAuthorized(request, token)) {
    return NextResponse.json(
      { status: "error", message: "Unauthorized." },
      { status: 401 }
    );
  }

  const service = dependencies.service ?? getTemporalDiscountingService();
  const rows = await service.listResponsesForExport();
  const csvBody = service.toCsv(rows);

  return new NextResponse(csvBody, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"temporal-discounting-responses.csv\"",
      "Cache-Control": "no-store"
    }
  });
}
