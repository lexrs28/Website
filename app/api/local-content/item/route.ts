import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getContentItem } from "@/lib/content-intake/content-read";
import { isLocalApiRequest, localNotFoundResponse } from "@/lib/content-intake/local-guard";

export const runtime = "nodejs";

const querySchema = z.object({
  type: z.enum(["blog", "publication", "about", "projects"]),
  id: z.string().trim().min(1)
});

export async function GET(request: NextRequest) {
  if (!isLocalApiRequest(request)) {
    return localNotFoundResponse();
  }

  const parsedQuery = querySchema.safeParse({
    type: request.nextUrl.searchParams.get("type"),
    id: request.nextUrl.searchParams.get("id")
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Invalid request query" }, { status: 400 });
  }

  try {
    const item = await getContentItem(process.cwd(), parsedQuery.data.type, parsedQuery.data.id);

    if (!item) {
      return NextResponse.json({ error: "Content item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load content item" },
      { status: 500 }
    );
  }
}
