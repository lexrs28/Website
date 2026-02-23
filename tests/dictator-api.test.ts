import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  handleTemporalDiscountingExport,
  handleTemporalDiscountingSubmission
} from "@/lib/experiments/temporal-discounting/http";
import type { TemporalDiscountingService } from "@/lib/experiments/temporal-discounting/types";

function createServiceStub(partial: Partial<TemporalDiscountingService>): TemporalDiscountingService {
  return {
    submitResponse: partial.submitResponse ?? (async () => ({ status: "ok", id: 1 } as const)),
    listResponsesForExport: partial.listResponsesForExport ?? (async () => []),
    toCsv: partial.toCsv ?? (() => "")
  };
}

describe("temporal discounting APIs", () => {
  it("returns 201 for successful submission", async () => {
    const service = createServiceStub({
      submitResponse: vi.fn(async () => ({ status: "ok", id: 99 } as const))
    });

    const request = new NextRequest("http://localhost/api/experiments/temporal-discounting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ donationTiming: "sooner" })
    });

    const response = await handleTemporalDiscountingSubmission(request, {
      service,
      sessionTokenFactory: () => "test-session-token"
    });

    expect(response.status).toBe(201);
    expect(response.headers.get("set-cookie")).toContain("td_session=test-session-token");
  });

  it("returns 409 for duplicate session submission", async () => {
    const service = createServiceStub({
      submitResponse: vi.fn(async () => ({
        status: "duplicate",
        message: "Already submitted"
      } as const))
    });

    const request = new NextRequest("http://localhost/api/experiments/temporal-discounting", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "td_session=existing-session"
      },
      body: JSON.stringify({ donationTiming: "later" })
    });

    const response = await handleTemporalDiscountingSubmission(request, { service });

    expect(response.status).toBe(409);
  });

  it("returns 400 for validation failures", async () => {
    const service = createServiceStub({
      submitResponse: vi.fn(async () => ({
        status: "error",
        code: "validation",
        message: "Invalid payload"
      } as const))
    });

    const request = new NextRequest("http://localhost/api/experiments/temporal-discounting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ donationTiming: "invalid" })
    });

    const response = await handleTemporalDiscountingSubmission(request, { service });

    expect(response.status).toBe(400);
  });

  it("returns 401 for export without token", async () => {
    const request = new NextRequest("http://localhost/api/experiments/temporal-discounting/export", {
      method: "GET"
    });

    const response = await handleTemporalDiscountingExport(request, {
      exportToken: "secret-token"
    });

    expect(response.status).toBe(401);
  });

  it("returns CSV for export with bearer token", async () => {
    const service = createServiceStub({
      listResponsesForExport: vi.fn(async () => []),
      toCsv: vi.fn(() => "id,donation_timing\n1,sooner")
    });

    const request = new NextRequest("http://localhost/api/experiments/temporal-discounting/export", {
      method: "GET",
      headers: {
        Authorization: "Bearer secret-token"
      }
    });

    const response = await handleTemporalDiscountingExport(request, {
      service,
      exportToken: "secret-token"
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(await response.text()).toContain("donation_timing");
  });
});
