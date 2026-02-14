import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { handleDictatorGameSubmission, handleDictatorGameExport } from "@/lib/experiments/dictator/http";
import type { DictatorGameService } from "@/lib/experiments/dictator/types";

function createServiceStub(partial: Partial<DictatorGameService>): DictatorGameService {
  return {
    submitResponse: partial.submitResponse ?? (async () => ({ status: "ok", id: 1 } as const)),
    listResponsesForExport: partial.listResponsesForExport ?? (async () => []),
    toCsv: partial.toCsv ?? (() => "")
  };
}

describe("dictator game APIs", () => {
  it("returns 201 for successful submission", async () => {
    const service = createServiceStub({
      submitResponse: vi.fn(async () => ({ status: "ok", id: 99 } as const))
    });

    const request = new NextRequest("http://localhost/api/experiments/dictator-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountGiven: 50 })
    });

    const response = await handleDictatorGameSubmission(request, {
      service,
      sessionTokenFactory: () => "test-session-token"
    });

    expect(response.status).toBe(201);
    expect(response.headers.get("set-cookie")).toContain("dg_session=test-session-token");
  });

  it("returns 409 for duplicate session submission", async () => {
    const service = createServiceStub({
      submitResponse: vi.fn(async () => ({
        status: "duplicate",
        message: "Already submitted"
      } as const))
    });

    const request = new NextRequest("http://localhost/api/experiments/dictator-game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "dg_session=existing-session"
      },
      body: JSON.stringify({ amountGiven: 50 })
    });

    const response = await handleDictatorGameSubmission(request, { service });

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

    const request = new NextRequest("http://localhost/api/experiments/dictator-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountGiven: 53 })
    });

    const response = await handleDictatorGameSubmission(request, { service });

    expect(response.status).toBe(400);
  });

  it("returns 401 for export without token", async () => {
    const request = new NextRequest("http://localhost/api/experiments/dictator-game/export", {
      method: "GET"
    });

    const response = await handleDictatorGameExport(request, {
      exportToken: "secret-token"
    });

    expect(response.status).toBe(401);
  });

  it("returns CSV for export with bearer token", async () => {
    const service = createServiceStub({
      listResponsesForExport: vi.fn(async () => []),
      toCsv: vi.fn(() => "id,amount_given\n1,50")
    });

    const request = new NextRequest("http://localhost/api/experiments/dictator-game/export", {
      method: "GET",
      headers: {
        Authorization: "Bearer secret-token"
      }
    });

    const response = await handleDictatorGameExport(request, {
      service,
      exportToken: "secret-token"
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(await response.text()).toContain("amount_given");
  });
});
