import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listContentOptions } from "@/lib/content-intake/content-read";
import { isLocalApiRequest, localNotFoundResponse } from "@/lib/content-intake/local-guard";

export const runtime = "nodejs";

const querySchema = z.object({
  type: z.enum(["blog", "publication", "about", "projects"])
});

export async function GET(request: NextRequest) {
  if (!isLocalApiRequest(request)) {
    return localNotFoundResponse();
  }

  const parsedQuery = querySchema.safeParse({
    type: request.nextUrl.searchParams.get("type")
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  try {
    const items = await listContentOptions(parsedQuery.data.type);
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load content options" },
      { status: 500 }
    );
  }
}
