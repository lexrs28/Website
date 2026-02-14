import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/experiments/dictator/service";
import { getDictatorGameService } from "@/lib/experiments/dictator/runtime";
import type { DictatorGameService } from "@/lib/experiments/dictator/types";

const SESSION_COOKIE_NAME = "dg_session";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type DictatorSubmitHandlerDependencies = {
  service?: DictatorGameService;
  sessionTokenFactory?: () => string;
};

export async function handleDictatorGameSubmission(
  request: NextRequest,
  dependencies: DictatorSubmitHandlerDependencies = {}
): Promise<NextResponse> {
  const service = dependencies.service ?? getDictatorGameService();
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

export type DictatorExportHandlerDependencies = {
  service?: DictatorGameService;
  exportToken?: string;
};

function isAuthorized(request: NextRequest, expectedToken: string): boolean {
  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const queryToken = request.nextUrl.searchParams.get("token")?.trim() ?? "";

  return bearerToken === expectedToken || queryToken === expectedToken;
}

export async function handleDictatorGameExport(
  request: NextRequest,
  dependencies: DictatorExportHandlerDependencies = {}
): Promise<NextResponse> {
  const token = dependencies.exportToken ?? process.env.DICTATOR_EXPORT_TOKEN;

  if (!token || !isAuthorized(request, token)) {
    return NextResponse.json(
      { status: "error", message: "Unauthorized." },
      { status: 401 }
    );
  }

  const service = dependencies.service ?? getDictatorGameService();
  const rows = await service.listResponsesForExport();
  const csvBody = service.toCsv(rows);

  return new NextResponse(csvBody, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"dictator-game-responses.csv\"",
      "Cache-Control": "no-store"
    }
  });
}
