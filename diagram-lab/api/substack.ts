const FEED_URL = "https://fpctest.substack.com/feed";
import Parser from "rss-parser";

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const parser = new Parser();

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const limitRaw = url.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitRaw ?? "6") || 6, 1), 12);

  try {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`feed_http_${res.status}`);
    const xmlText = await res.text();

    const feed = await parser.parseString(xmlText);
    const posts = (feed.items ?? [])
      .slice(0, limit)
      .map((item) => {
        const urlStr = (item.link ?? "").trim();
        if (!urlStr) return null;
        const guid = (item.guid ?? urlStr).trim();
        const title = (item.title ?? "Untitled").trim();
        const dateRaw = item.isoDate ?? item.pubDate ?? "";
        const publishedIso = dateRaw ? new Date(dateRaw).toISOString() : "";
        const description = (item.contentSnippet ?? item.content ?? item.summary ?? "") as string;
        const excerpt = description ? stripHtml(String(description)).slice(0, 200) : "";
        return { id: guid || urlStr, title, url: urlStr, publishedIso, excerpt };
      })
      .filter(Boolean);

    return new Response(JSON.stringify({ ok: true, posts }), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "s-maxage=900, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "fetch_failed";
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 502,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}

