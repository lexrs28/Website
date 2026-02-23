import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function stripPort(hostValue: string): string {
  const trimmed = hostValue.trim().toLowerCase();

  if (trimmed.startsWith("[")) {
    const end = trimmed.indexOf("]");
    if (end >= 0) {
      return trimmed.slice(1, end);
    }
  }

  const [host] = trimmed.split(":");
  return host;
}

function normalizeIp(ipValue: string): string {
  const trimmed = ipValue.trim().toLowerCase();
  return trimmed.startsWith("::ffff:") ? trimmed.slice("::ffff:".length) : trimmed;
}

function isLoopbackIp(ipValue: string): boolean {
  const normalized = normalizeIp(ipValue);
  return normalized === "::1" || normalized === "127.0.0.1" || normalized.startsWith("127.");
}

function isLoopbackHost(hostValue: string): boolean {
  const normalized = stripPort(hostValue);
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

export function isContentPipelineEnabled(): boolean {
  return process.env.CONTENT_PIPELINE_ENABLED === "true";
}

export function isLocalPageRequest(headerStore: Headers): boolean {
  if (!isContentPipelineEnabled()) {
    return false;
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "";
  return host.length > 0 && isLoopbackHost(host);
}

export function isLocalApiRequest(request: NextRequest): boolean {
  if (!isContentPipelineEnabled()) {
    return false;
  }

  if (isLoopbackHost(request.nextUrl.hostname)) {
    return true;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost && isLoopbackHost(forwardedHost)) {
    return true;
  }

  const host = request.headers.get("host");
  if (host && isLoopbackHost(host)) {
    return true;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) {
    return false;
  }

  const [firstHop] = forwardedFor.split(",");
  return Boolean(firstHop) && isLoopbackIp(firstHop);
}

export function localNotFoundResponse(): NextResponse {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
