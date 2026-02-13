import { getPublishedBlogPosts } from "@/lib/content/blog";
import { generateRssXml } from "@/lib/rss";

export async function GET() {
  const posts = await getPublishedBlogPosts();
  const body = generateRssXml(posts);

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
