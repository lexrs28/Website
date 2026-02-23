import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { isLocalApiRequest, localNotFoundResponse } from "@/lib/content-intake/local-guard";
import { submitLocalContent } from "@/lib/content-intake/submit";
import { parseSubmissionPayload } from "@/lib/content-intake/validate";

export const runtime = "nodejs";

function coerceUploadFile(value: FormDataEntryValue | null, fieldName: string): File | undefined {
  if (value === null) {
    return undefined;
  }

  if (!(value instanceof File)) {
    throw new Error(`${fieldName} must be a file upload`);
  }

  if (value.size === 0) {
    return undefined;
  }

  return value;
}

export async function POST(request: NextRequest) {
  if (!isLocalApiRequest(request)) {
    return localNotFoundResponse();
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data request" }, { status: 400 });
  }

  try {
    const formData = await request.formData();

    const payloadRaw = formData.get("payload");
    if (typeof payloadRaw !== "string") {
      return NextResponse.json({ error: "Missing payload field" }, { status: 400 });
    }

    const submission = parseSubmissionPayload(payloadRaw);
    const pdfFile = coerceUploadFile(formData.get("pdfFile"), "pdfFile");
    const docxFile = coerceUploadFile(formData.get("docxFile"), "docxFile");

    const result = await submitLocalContent({
      repoRoot: process.cwd(),
      submission,
      pdfFile,
      docxFile
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid submission payload" }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Content submission failed" }, { status: 500 });
  }
}
